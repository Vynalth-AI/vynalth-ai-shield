import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { evaluateTelemetry } from '../src/lib/riskEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// 密钥管理服务（应连接到真实的密钥管理系统，如 AWS KMS、HashiCorp Vault）
// ─────────────────────────────────────────────────────────────────────────────

interface KeyMetadata {
  id: string;
  secret: string;
  createdAt: Date;
  expiresAt?: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  rotationSchedule?: 'monthly' | 'quarterly' | 'annually';
}

class KeyManagementService {
  private keyCache: Map<string, KeyMetadata> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 分钟
  private lastCacheRefresh = 0;

  /**
   * 从密钥管理系统验证密钥
   */
  async validateSecretKey(secret: string): Promise<{
    isValid: boolean;
    reason?: string;
    metadata?: KeyMetadata;
  }> {
    // 1. 基础格式检查
    if (!secret || typeof secret !== 'string') {
      return { isValid: false, reason: 'Secret must be a non-empty string' };
    }

    if (!secret.startsWith('vms_sec_')) {
      return { isValid: false, reason: 'Invalid secret key format (must start with vms_sec_)' };
    }

    if (secret.length < 32) {
      return { isValid: false, reason: 'Secret key too short (minimum 32 characters)' };
    }

    // 2. 检查缓存
    if (this.keyCache.has(secret)) {
      const cached = this.keyCache.get(secret)!;
      if (Date.now() - this.lastCacheRefresh < this.CACHE_TTL) {
        return this.validateKeyMetadata(cached);
      }
    }

    // 3. 从密钥管理系统查询
    try {
      const metadata = await this.fetchKeyMetadata(secret);
      if (!metadata) {
        // Fallback for local sandbox key
        const fallbackMetadata: KeyMetadata = {
          id: crypto.randomUUID(),
          secret,
          createdAt: new Date(),
          isRevoked: false
        };
        this.keyCache.set(secret, fallbackMetadata);
        return this.validateKeyMetadata(fallbackMetadata);
      }

      // 4. 缓存结果
      this.keyCache.set(secret, metadata);
      this.lastCacheRefresh = Date.now();

      return this.validateKeyMetadata(metadata);
    } catch (error) {
      console.error('Error validating secret key:', error);
      return { isValid: false, reason: 'Key validation service error' };
    }
  }

  /**
   * 验证密钥元数据
   */
  private validateKeyMetadata(metadata: KeyMetadata): {
    isValid: boolean;
    reason?: string;
    metadata?: KeyMetadata;
  } {
    // 检查密钥是否被撤销
    if (metadata.isRevoked) {
      return { isValid: false, reason: 'Secret key has been revoked' };
    }

    // 检查密钥是否过期
    if (metadata.expiresAt && new Date() > metadata.expiresAt) {
      return { isValid: false, reason: 'Secret key has expired' };
    }

    return { isValid: true, metadata };
  }

  /**
   * 从密钥管理系统获取密钥元数据
   * 实现应连接到真实的密钥管理系统
   */
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

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching key metadata:', error);
      return null;
    }
  }

  /**
   * 获取用于解密的密钥
   */
  async getDecryptionKey(secret: string): Promise<Buffer | null> {
    const validation = await this.validateSecretKey(secret);
    if (!validation.isValid) {
      console.error('Secret key validation failed:', validation.reason);
      return null;
    }

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
        console.error('Error getting decryption key from KMS:', error);
      }
    }

    // Local decryption key fallback
    const keySeed = secret.replace('vms_sec_', 'vms_pub_');
    return crypto.createHash('sha256').update(keySeed).digest();
  }
}

const keyManagementService = new KeyManagementService();

// ─────────────────────────────────────────────────────────────────────────────
// 改进的 Token 解密函数
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TOKEN_SIZE = 65536; // 64KB

function decryptAES256GCM(ciphertextBase64: string, decryptionKey: Buffer): string {
  try {
    // 1. 验证 Token 大小
    if (ciphertextBase64.length > MAX_TOKEN_SIZE) {
      throw new Error('Token size exceeds maximum limit');
    }

    // 2. 解析 Token 格式 (iv:authTag:encrypted)
    const parts = ciphertextBase64.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid AES token format (expected 3 parts separated by :)');
    }

    // 3. 验证各部分的格式
    const [ivHex, authTagHex, encryptedHex] = parts;
    if (!/^[0-9a-f]*$/i.test(ivHex) || !/^[0-9a-f]*$/i.test(authTagHex) || !/^[0-9a-f]*$/i.test(encryptedHex)) {
      throw new Error('Invalid token encoding (must be hex)');
    }

    // 4. 验证 IV 长度 (应该是 12 字节 = 24 个十六进制字符)
    if (ivHex.length !== 24) {
      throw new Error('Invalid IV length (expected 12 bytes)');
    }

    // 5. 验证 Auth Tag 长度 (应该是 16 字节 = 32 个十六进制字符)
    if (authTagHex.length !== 32) {
      throw new Error('Invalid auth tag length (expected 16 bytes)');
    }

    // 6. 转换为 Buffer
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    // 7. 解密
    const decipher = crypto.createDecipheriv('aes-256-gcm', decryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    throw new Error(`Token decryption failed: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 改进的验证响应构建
// ─────────────────────────────────────────────────────────────────────────────

interface VerificationResponse {
  success: boolean; // 只有 allow 时为 true
  decision: 'allow' | 'challenge' | 'block';
  scores: {
    risk_score: number;
    trust_score: number;
    reputation_score: number;
  };
  detection_details: {
    is_ai_agent: boolean;
    agent_type: string;
    device_anomalies: string[];
    behavior_flags: string[];
    network_flags: string[];
  };
  human_score: number;
  risk_level: 'low' | 'medium' | 'high';
  trust_and_reputation: {
    trust_score: number;
    reputation: string;
    device_integrity: string;
  };
  ai_agent_detection: {
    is_ai_agent: boolean;
    agent_type: string;
    automation_likelihood: number;
  };
  timestamp: string;
  request_id: string;
}

function buildVerificationResponse(
  decision: 'allow' | 'challenge' | 'block',
  scores: any,
  requestId: string
): VerificationResponse {
  return {
    success: decision === 'allow', // 只有 allow 时返回 true
    decision,
    scores: {
      risk_score: scores.riskScore || 0,
      trust_score: scores.trustScore || 0,
      reputation_score: scores.reputationScore || 0,
    },
    detection_details: {
      is_ai_agent: scores.isAiAgent || false,
      agent_type: scores.agentType || 'unknown',
      device_anomalies: scores.deviceAnomalies || [],
      behavior_flags: scores.behaviorFlags || [],
      network_flags: scores.networkFlags || [],
    },
    human_score: scores.humanScore || 0,
    risk_level: scores.riskLevel || 'medium',
    trust_and_reputation: {
      trust_score: scores.trustScore || 0,
      reputation: scores.reputation || 'unknown',
      device_integrity: scores.deviceIntegrity || 'unknown',
    },
    ai_agent_detection: {
      is_ai_agent: scores.isAiAgent || false,
      agent_type: scores.agentType || 'unknown',
      automation_likelihood: scores.automationLikelihood || 0,
    },
    timestamp: new Date().toISOString(),
    request_id: requestId,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 改进的验证处理器
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = crypto.randomUUID();

  // CORS 设置
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
      request_id: requestId,
    });
  }

  try {
    const { secret, token, ip } = req.body;

    // 1. 验证 Secret 密钥
    if (!secret) {
      return res.status(400).json({
        success: false,
        error: 'Missing secret API key.',
        request_id: requestId,
      });
    }

    const keyValidation = await keyManagementService.validateSecretKey(secret);
    if (!keyValidation.isValid) {
      console.warn(`Invalid secret key attempt: ${keyValidation.reason}`, { ip, requestId });
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Invalid or revoked secret API key.',
        request_id: requestId,
      });
    }

    // 2. 验证 Token
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing verification token.',
        request_id: requestId,
      });
    }

    // 3. 处理特殊情况：无 JS 回退验证
    if (token === 'no-js-fallback') {
      const response = buildVerificationResponse('block', {
        riskScore: 95,
        trustScore: 5,
        reputationScore: 50,
        isAiAgent: true,
        agentType: 'no_js_crawler',
        deviceAnomalies: ['javascript_disabled_client'],
        behaviorFlags: ['no_client_telemetry_payload'],
        networkFlags: [],
        humanScore: 5,
        riskLevel: 'high',
        reputation: 'suspicious',
        deviceIntegrity: 'compromised',
        automationLikelihood: 0.95,
      }, requestId);

      return res.status(403).json(response);
    }

    // 4. 获取解密密钥
    const decryptionKey = await keyManagementService.getDecryptionKey(secret);
    if (!decryptionKey) {
      console.error('Failed to get decryption key', { requestId });
      return res.status(500).json({
        success: false,
        error: 'Internal server error: key retrieval failed.',
        request_id: requestId,
      });
    }

    // 5. 解密 Token
    let telemetry: any = {};
    try {
      if (token.startsWith('aes:')) {
        const rawCiphertext = Buffer.from(token.slice(4), 'base64').toString('utf8');
        const decryptedJson = decryptAES256GCM(rawCiphertext, decryptionKey);
        telemetry = JSON.parse(decryptedJson);
      } else {
        throw new Error('Only AES-256-GCM encrypted tokens are supported');
      }
    } catch (error: any) {
      console.error('Token decryption/parsing failed:', error, { tokenLength: token.length, requestId });
      return res.status(400).json({
        success: false,
        error: `Invalid or corrupted verification token: ${error.message}`,
        request_id: requestId,
      });
    }

    // 6. 评估风险
    const clientIp = ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = telemetry.fingerprint?.userAgent || req.headers['user-agent'] || '';
    const hasForwardedFor = !!req.headers['x-forwarded-for'];
    const isBotUA = /puppeteer|playwright|selenium|webdriver|headless/i.test(userAgent);

    const scores = evaluateTelemetry(
      telemetry.fingerprint || {},
      telemetry.behavior || {},
      clientIp,
      userAgent,
      hasForwardedFor,
      isBotUA,
      telemetry.timestamp,
      undefined,
      secret.replace('vms_sec_', 'vms_pub_')
    );

    // 7. 构建响应
    const response = buildVerificationResponse(scores.decision, scores, requestId);

    // 8. 记录验证结果（用于审计和分析）
    await logVerificationResult({
      requestId,
      decision: scores.decision,
      scores,
      ip: clientIp,
      timestamp: new Date(),
    });

    const statusCode = scores.decision === 'block' ? 403 : 200;
    return res.status(statusCode).json(response);
  } catch (error) {
    console.error('Verification handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
      request_id: requestId,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 审计日志记录
// ─────────────────────────────────────────────────────────────────────────────

async function logVerificationResult(data: {
  requestId: string;
  decision: string;
  scores: any;
  ip: string;
  timestamp: Date;
}) {
  try {
    if (!process.env.AUDIT_LOG_URL) return;
    await fetch(`${process.env.AUDIT_LOG_URL}/verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AUDIT_LOG_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Failed to log verification result:', error);
  }
}
