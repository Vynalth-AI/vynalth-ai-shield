import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { evaluateTelemetry, globalAutoencoder } from '../src/lib/riskEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// 密钥管理服务 (Key Management Service)
// ─────────────────────────────────────────────────────────────────────────────

interface KeyMetadata {
  id: string;
  secret: string;
  createdAt: Date;
  expiresAt?: Date;
  isRevoked: boolean;
  revokedAt?: Date;
}

class KeyManagementService {
  private keyCache: Map<string, KeyMetadata> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 mins
  private lastCacheRefresh = 0;

  async validateSecretKey(secret: string): Promise<{
    isValid: boolean;
    reason?: string;
    metadata?: KeyMetadata;
  }> {
    if (!secret || typeof secret !== 'string') {
      return { isValid: false, reason: 'Secret must be a non-empty string' };
    }
    if (!secret.startsWith('vms_sec_')) {
      return { isValid: false, reason: 'Invalid secret key format (must start with vms_sec_)' };
    }
    if (secret.length < 32) {
      return { isValid: false, reason: 'Secret key too short (minimum 32 characters)' };
    }

    const hexPart = secret.replace('vms_sec_live_', '').replace('vms_sec_', '');
    if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
      return { isValid: false, reason: 'Invalid Secret API Key format.' };
    }

    if (this.keyCache.has(secret)) {
      const cached = this.keyCache.get(secret)!;
      if (Date.now() - this.lastCacheRefresh < this.CACHE_TTL) {
        return this.validateKeyMetadata(cached);
      }
    }

    try {
      const metadata = await this.fetchKeyMetadata(secret);
      if (!metadata) {
        // Fallback metadata for local/demo keys to allow seamless offline operations
        const fallbackMetadata: KeyMetadata = {
          id: crypto.randomUUID(),
          secret,
          createdAt: new Date(),
          isRevoked: false
        };
        this.keyCache.set(secret, fallbackMetadata);
        this.lastCacheRefresh = Date.now();
        return this.validateKeyMetadata(fallbackMetadata);
      }

      this.keyCache.set(secret, metadata);
      this.lastCacheRefresh = Date.now();
      return this.validateKeyMetadata(metadata);
    } catch (error) {
      return { isValid: false, reason: 'Key validation service error' };
    }
  }

  private validateKeyMetadata(metadata: KeyMetadata): {
    isValid: boolean;
    reason?: string;
    metadata?: KeyMetadata;
  } {
    if (metadata.isRevoked) {
      return { isValid: false, reason: 'Secret key has been revoked' };
    }
    if (metadata.expiresAt && new Date() > metadata.expiresAt) {
      return { isValid: false, reason: 'Secret key has expired' };
    }
    return { isValid: true, metadata };
  }

  private async fetchKeyMetadata(secret: string): Promise<KeyMetadata | null> {
    if (!process.env.KEY_MANAGEMENT_URL) {
      return null;
    }
    try {
      const response = await fetch(`${process.env.KEY_MANAGEMENT_URL}/keys/${secret}`, {
        headers: {
          'Authorization': `Bearer ${process.env.KEY_MANAGEMENT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async getDecryptionKey(secret: string): Promise<Buffer | null> {
    const validation = await this.validateSecretKey(secret);
    if (!validation.isValid) return null;

    if (process.env.KEY_MANAGEMENT_URL) {
      try {
        const response = await fetch(`${process.env.KEY_MANAGEMENT_URL}/keys/${secret}/decrypt-key`, {
          headers: {
            'Authorization': `Bearer ${process.env.KEY_MANAGEMENT_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          return Buffer.from(data.key, 'base64');
        }
      } catch (error) {
        console.error('Error fetching decrypt key from KMS:', error);
      }
    }

    // Local deterministic key derivation fallback
    const keySeed = secret.replace('vms_sec_', 'vms_pub_');
    return crypto.createHash('sha256').update(keySeed).digest();
  }
}

const keyManagementService = new KeyManagementService();

// ─────────────────────────────────────────────────────────────────────────────
// 改进的 Token 解密与验证 (GCM Authentication Check)
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TOKEN_SIZE = 65536; // 64KB

function decryptAES256GCM(ciphertextBase64: string, decryptionKey: Buffer): string {
  try {
    if (ciphertextBase64.length > MAX_TOKEN_SIZE) {
      throw new Error('Token size exceeds maximum limit');
    }

    const parts = ciphertextBase64.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid AES token format (expected 3 parts separated by :)');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    if (!/^[0-9a-f]*$/i.test(ivHex) || !/^[0-9a-f]*$/i.test(authTagHex) || !/^[0-9a-f]*$/i.test(encryptedHex)) {
      throw new Error('Invalid token encoding (must be hex)');
    }

    if (ivHex.length !== 24) {
      throw new Error('Invalid IV length (expected 12 bytes = 24 hex characters)');
    }
    if (authTagHex.length !== 32) {
      throw new Error('Invalid auth tag length (expected 16 bytes = 32 hex characters)');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', decryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    throw new Error(`Token decryption failed: ${error.message}`);
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = crypto.randomUUID();

  // CORS Settings
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.',
      request_id: requestId
    });
  }

  try {
    const { secret, token, ip } = req.body;

    // 1. Validate Secret API Key
    if (!secret) {
      return res.status(400).json({
        success: false,
        error: 'Missing secret API key.',
        request_id: requestId
      });
    }

    const keyValidation = await keyManagementService.validateSecretKey(secret);
    if (!keyValidation.isValid) {
      return res.status(401).json({
        success: false,
        error: `Unauthorized. ${keyValidation.reason || 'Invalid secret key.'}`,
        request_id: requestId
      });
    }

    // 2. Validate Token Present
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing verification token.',
        request_id: requestId
      });
    }

    // 3. Handle No-JS graceful fallback verification request
    if (token === 'no-js-fallback') {
      return res.status(403).json({
        success: false,
        decision: 'block',
        engine_version: 'v2.2',
        risk_score: 95,
        trust_score: 5,
        scores: {
          risk_score: 95,
          trust_score: 5,
          reputation_score: 50
        },
        detection_details: {
          is_ai_agent: true,
          agent_type: 'no_js_crawler',
          device_anomalies: ['javascript_disabled_client'],
          behavior_flags: ['no_client_telemetry_payload'],
          network_flags: []
        },
        human_score: 5,
        risk_level: 'high',
        trust_and_reputation: {
          trust_score: 5,
          reputation: 'suspicious',
          device_integrity: 'compromised'
        },
        ai_agent_detection: {
          is_ai_agent: true,
          agent_type: 'no_js_crawler',
          automation_likelihood: 0.95
        },
        timestamp: new Date().toISOString(),
        request_id: requestId
      });
    }

    // 4. Retrieve Decryption Key from KMS
    const decryptionKey = await keyManagementService.getDecryptionKey(secret);
    if (!decryptionKey) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error: Key retrieval failed.',
        request_id: requestId
      });
    }

    // 5. Decrypt Token GCM
    let telemetry: any = {};
    try {
      if (token.startsWith('aes:')) {
        const rawCiphertext = Buffer.from(token.slice(4), 'base64').toString('utf8');
        const decryptedJson = decryptAES256GCM(rawCiphertext, decryptionKey);
        telemetry = JSON.parse(decryptedJson);
      } else {
        throw new Error('XOR encryption no longer supported');
      }
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        error: `Invalid or malformed verification token: ${e.message}`,
        request_id: requestId
      });
    }

    const fingerprint = telemetry.fingerprint || {};
    const behavior = telemetry.behavior || {};
    const mouseEvents = behavior.mouseEventsCount || 0;
    const keyPresses = behavior.keyPressesCount || 0;
    const scrolls = behavior.scrollsCount || 0;
    const clientIp = ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // Extract raw behavior payload for online training
    const rawMousePoints  = behavior.mousePoints  || [];
    const rawKeyTimings   = behavior.keyTimings   || [];
    const rawFormDuration = behavior.durationMs   ?? 0;
    const userAgent = fingerprint.userAgent || req.headers['user-agent'] || '';

    // 6. Run Risk Engine Layered Security Models
    const aiAgentPatterns = [
      /openai/i, /gptbot/i, /chatgpt/i, /chat-gpt/i, /claude/i, /anthropic/i,
      /google-extended/i, /python-urllib/i, /axios/i, /headless/i,
      /puppeteer/i, /playwright/i, /selenium/i, /webdriver/i, /operator/i
    ];
    const isBotUA = aiAgentPatterns.some(pattern => pattern.test(userAgent));
    const hasForwardedFor = !!req.headers['x-forwarded-for'];
    
    // Load Autoencoder state
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const aeLoadResponse = await fetch(`${SUPABASE_URL}/rest/v1/autoencoder_states?order=id.desc&limit=1`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        if (aeLoadResponse.ok) {
          const aeData = await aeLoadResponse.json();
          if (aeData && aeData.length > 0 && aeData[0].state) {
            globalAutoencoder.importState(aeData[0].state);
          }
        }
      } catch (err) {
        console.error('Supabase load autoencoder state failed:', err);
      }
    }

    const aeCountBefore = globalAutoencoder.trainedSamplesCount;
    const siteKey = secret.replace('vms_sec_', 'vms_pub_');

    const evaluation = evaluateTelemetry(
      fingerprint,
      behavior,
      clientIp,
      userAgent,
      hasForwardedFor,
      isBotUA,
      telemetry.createdAt,
      telemetry.signature,
      siteKey,
      telemetry.powNonce,
      telemetry.powDifficulty
    );

    const aeCountAfter = globalAutoencoder.trainedSamplesCount;
    if (aeCountAfter > aeCountBefore && SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/autoencoder_states`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          },
          body: JSON.stringify({
            state: globalAutoencoder.exportState(),
            created_at: new Date().toISOString()
          })
        });
      } catch (err) {
        console.error('Supabase save autoencoder state failed:', err);
      }
    }

    const {
      riskScore,
      trustScore,
      reputationScore,
      isAiAgent,
      agentType,
      deviceAnomalies,
      behaviorFlags,
      networkFlags,
      consistencyFlags,
      overSpoofingFlags,
      decision: engineDecision,
      dimensionScores
    } = evaluation;

    let finalRiskScore = riskScore;
    let finalIsAiAgent = isAiAgent;
    let finalAgentType = agentType;
    let finalBehaviorFlags = [...behaviorFlags];

    // 🔍 Query Cloudflare AI Search to dynamically adjust security thresholds
    const cloudflareSearchUrl = 'https://8e6afc0f-9bfc-4aba-8b16-5b452ed6e065.search.ai.cloudflare.com/search';
    try {
      const cfResponse = await fetch(cloudflareSearchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${userAgent} ${clientIp}` })
      });
      if (cfResponse.ok) {
        const cfData = await cfResponse.json();
        const chunks = cfData?.result?.chunks || [];
        if (chunks.length > 0) {
          const combinedText = chunks.map((c: any) => c.text || '').join(' ').toLowerCase();
          const riskKeywords = ['bot', 'scraper', 'headless', 'automation', 'crawler', 'suspicious', 'proxy', 'attack'];
          const matchCount = riskKeywords.filter(keyword => combinedText.includes(keyword)).length;
          
          if (matchCount >= 2) {
            finalRiskScore = Math.min(100, finalRiskScore + 35);
            finalIsAiAgent = true;
            finalAgentType = 'cloudflare_intel_flagged';
            finalBehaviorFlags.push('cloudflare_search_threat_match');
          }
        }
      }
    } catch (cfErr) {
      console.error('Cloudflare Search threat lookup failed:', cfErr);
    }

    // 🌐 Dynamic Network Lookup (ip-api) to identify server/datacenter hosting origins
    try {
      const ipApiRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,org,isp,hosting`);
      if (ipApiRes.ok) {
        const ipInfo = await ipApiRes.json();
        if (ipInfo.status === 'success') {
          const org = (ipInfo.org || '').toLowerCase();
          const isp = (ipInfo.isp || '').toLowerCase();
          const isHosting = ipInfo.hosting === true || 
            org.includes('amazon') || org.includes('digitalocean') || org.includes('hetzner') || 
            org.includes('ovh') || org.includes('linode') || org.includes('google cloud') || 
            isp.includes('amazon') || isp.includes('digitalocean') || isp.includes('hetzner') || 
            isp.includes('ovh') || isp.includes('linode') || isp.includes('google cloud');
          
          if (isHosting) {
            finalRiskScore = Math.min(100, finalRiskScore + 40);
            finalBehaviorFlags.push('datacenter_hosting_detected');
          }
        }
      }
    } catch (ipApiErr) {
      console.error('Dynamic network ISP lookup failed:', ipApiErr);
    }

    // 🛡️ Real-time Threat Intel DB Lookup (auto-updated by /api/cron/crawl daily)
    // Check if this client IP matches any known C2 botnet IPs, or if any CVE/attack
    // patterns match, applying dynamic risk penalties from our live threat database.
    try {
      if (clientIp && SUPABASE_URL && SUPABASE_KEY) {
        const threatRes = await fetch(
          `${SUPABASE_URL}/rest/v1/threat_intel?indicator=eq.${encodeURIComponent(clientIp)}&select=category,severity,description`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        if (threatRes.ok) {
          const threats = await threatRes.json();
          if (threats && threats.length > 0) {
            const t = threats[0];
            const penalty = t.severity === 'critical' ? 65 : t.severity === 'high' ? 45 : 25;
            finalRiskScore = Math.min(100, finalRiskScore + penalty);
            finalIsAiAgent = true;
            finalAgentType = t.category || 'threat_intel_match';
            finalBehaviorFlags.push(`threat_intel_match:${t.category}`);
            console.log(`[ThreatIntel] IP ${clientIp} matched ${t.category} | penalty +${penalty}`);
          }
        }

        // Also fetch current risk multiplier from auto-updated config
        const configRes = await fetch(
          `${SUPABASE_URL}/rest/v1/threat_risk_config?select=risk_multiplier&order=updated_at.desc&limit=1`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        if (configRes.ok) {
          const config = await configRes.json();
          if (config && config.length > 0 && config[0].risk_multiplier) {
            const multiplier = Math.min(Number(config[0].risk_multiplier), 1.5);
            finalRiskScore = Math.min(100, Math.round(finalRiskScore * multiplier));
          }
        }
      }
    } catch (threatErr) {
      console.error('Threat Intel DB lookup failed:', threatErr);
    }


    const decision: 'allow' | 'challenge' | 'block' = finalRiskScore > 75 
      ? 'block' 
      : finalRiskScore > 35 
        ? 'challenge' 
        : 'allow';

    // 7. Log Session & Telemetry directly to Supabase
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const sessionResponse = await fetch(`${SUPABASE_URL}/rest/v1/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: decision === 'block' ? 'blocked' : 'active'
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const sessionId = sessionData[0]?.id;

          if (sessionId) {
            await fetch(`${SUPABASE_URL}/rest/v1/telemetry_logs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
              },
              body: JSON.stringify({
                session_id: sessionId,
                risk_score: finalRiskScore,
                device_fingerprint: {
                  userAgent,
                  ipAddress: clientIp,
                  screenWidth: fingerprint.screenWidth,
                  screenHeight: fingerprint.screenHeight,
                  timezone: fingerprint.timezone,
                  webdriver: fingerprint.webdriverActive,
                  deviceAnomalies,
                  networkFlags,
                  consistencyFlags,
                  overSpoofingFlags,
                  reputationScore
                },
                behavior_metrics: {
                  mouseEvents,
                  keyPresses,
                  scrolls,
                  behaviorFlags: finalBehaviorFlags,
                  trustScore
                }
              })
            });
          }
        }
      } catch (dbError) {
        console.error('Supabase write logging failed:', dbError);
      }
    }

    // ── Online training: use real human visitor data to continuously improve model ──
    // Only train on human-classified (allow) traffic to keep the autoencoder
    // calibrated on genuine human behaviour patterns.
    if (decision === 'allow') {
      const trainBaseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      // Fire-and-forget — do not block the response
      fetch(`${trainBaseUrl}/api/model/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mousePoints:  rawMousePoints,
          keyTimings:   rawKeyTimings,
          formDuration: rawFormDuration,
          label: 'human',
          epochs: 1
        })
      }).catch(err => console.error('Online training call failed:', err));
    }

    // 8. Output Response
    const statusCode = decision === 'block' ? 403 : 200;
    return res.status(statusCode).json({
      success: decision === 'allow',
      decision,
      engine_version: 'v2.2',
      risk_score: riskScore,
      trust_score: trustScore,
      scores: {
        risk_score: riskScore,
        trust_score: trustScore,
        reputation_score: reputationScore
      },
      dimension_scores: {
        device_risk:         dimensionScores.deviceRisk,
        behavior_risk:       dimensionScores.behaviorRisk,
        network_risk:        dimensionScores.networkRisk,
        biometric_risk:      dimensionScores.biometricRisk,
        sensor_risk:         dimensionScores.sensorRisk,
        consistency_risk:    dimensionScores.consistencyRisk,
        over_spoofing_risk:  dimensionScores.overSpoofingRisk,
      },
      detection_details: {
        is_ai_agent:        isAiAgent,
        agent_type:         agentType,
        device_anomalies:   deviceAnomalies,
        behavior_flags:     behaviorFlags,
        network_flags:      networkFlags,
        consistency_flags:  consistencyFlags,
        over_spoofing_flags: overSpoofingFlags,
      },
      human_score: trustScore,
      risk_level: riskScore >= 60 ? 'high' : riskScore > 20 ? 'medium' : 'low',
      trust_and_reputation: {
        trust_score: trustScore,
        reputation: reputationScore >= 80 ? 'excellent' : reputationScore >= 50 ? 'suspicious' : 'dangerous',
        device_integrity: riskScore >= 60 ? 'compromised' : 'verified_device'
      },
      ai_agent_detection: {
        is_ai_agent: isAiAgent,
        agent_type: agentType,
        automation_likelihood: riskScore / 100
      },
      timestamp: new Date().toISOString(),
      request_id: requestId
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: `Internal gateway verification error: ${error.message}`,
      request_id: requestId
    });
  }
}
