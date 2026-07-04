import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qgoelcorfcqxberbayul.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';

// ============================================================
// Real Open-Source Threat Feeds (no API key required)
// ============================================================
const FEEDS = {
  cisaKev: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
  feodoC2:  'https://feodotracker.abuse.ch/downloads/ipblocklist.json',
  urlhaus:  'https://urlhaus-api.abuse.ch/v1/urls/recent/',
};

// ============================================================
// Server-side Autoencoder (mirrors riskEngine.ts exactly)
// Input dimensions: [straightness, keystrokeSD, mouseEntropy, durationMs]
// Architecture: 4 → 2 → 4
// ============================================================
class ServerAutoencoder {
  w1: number[][];
  w2: number[][];
  b1: number[];
  b2: number[];
  lr = 0.08;
  count = 0;

  constructor(state?: Record<string, unknown>) {
    this.w1 = [[0.05,-0.05],[-0.08,0.08],[0.02,-0.02],[-0.04,0.04]];
    this.w2 = [[0.05,-0.08,0.02,-0.04],[-0.05,0.08,-0.02,0.04]];
    this.b1 = [0.1,0.1];
    this.b2 = [0.1,0.1,0.1,0.1];
    if (state) {
      if (state.weights1) this.w1 = state.weights1 as number[][];
      if (state.weights2) this.w2 = state.weights2 as number[][];
      if (state.bias1)    this.b1 = state.bias1 as number[];
      if (state.bias2)    this.b2 = state.bias2 as number[];
      if (state.trained_samples_count !== undefined) this.count = state.trained_samples_count as number;
    }
  }

  private sig(x: number) { return 1 / (1 + Math.exp(-x)); }

  private norm(s: number, sd: number, ent: number, dur: number): number[] {
    return [
      Math.max(0, Math.min(1, (s - 1.0) / 1.5)),
      Math.max(0, Math.min(1, sd / 80)),
      Math.max(0, Math.min(1, ent / 6)),
      Math.max(0, Math.min(1, dur / 6000)),
    ];
  }

  train(s: number, sd: number, ent: number, dur: number, isBot: boolean) {
    const x = this.norm(s, sd, ent, dur);
    const h = [0, 0];
    for (let j = 0; j < 2; j++) {
      let sum = this.b1[j];
      for (let i = 0; i < 4; i++) sum += x[i] * this.w1[i][j];
      h[j] = this.sig(sum);
    }
    const y = [0, 0, 0, 0];
    for (let k = 0; k < 4; k++) {
      let sum = this.b2[k];
      for (let j = 0; j < 2; j++) sum += h[j] * this.w2[j][k];
      y[k] = this.sig(sum);
    }
    const dY = y.map((yk, k) => (yk - x[k]) * yk * (1 - yk));
    const dH = [0, 0];
    for (let j = 0; j < 2; j++) {
      let s2 = 0;
      for (let k = 0; k < 4; k++) s2 += dY[k] * this.w2[j][k];
      dH[j] = s2 * h[j] * (1 - h[j]);
    }
    // isBot=true  → gradient ASCENT  (maximize reconstruction error for bots)
    // isBot=false → gradient DESCENT (minimize reconstruction error for humans)
    const f = isBot ? 1 : -1;
    for (let j = 0; j < 2; j++)
      for (let k = 0; k < 4; k++)
        this.w2[j][k] += f * this.lr * dY[k] * h[j];
    for (let k = 0; k < 4; k++) this.b2[k] += f * this.lr * dY[k];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 2; j++)
        this.w1[i][j] += f * this.lr * dH[j] * x[i];
    for (let j = 0; j < 2; j++) this.b1[j] += f * this.lr * dH[j];
    this.count++;
  }

  export() {
    return { weights1: this.w1, weights2: this.w2, bias1: this.b1, bias2: this.b2, trained_samples_count: this.count };
  }
}

// ============================================================
// Supabase REST helpers
// ============================================================
async function supaGet(path: string): Promise<unknown> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

async function supaPost(table: string, body: Record<string, unknown>): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(body),
    });
    return r.ok || r.status === 201;
  } catch { return false; }
}

// ============================================================
// Threat Feed Parsers
// ============================================================
async function fetchCISAKEV(): Promise<{ count: number; newSaved: number }> {
  let count = 0, newSaved = 0;
  try {
    const r = await fetch(FEEDS.cisaKev, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return { count, newSaved };
    const data = await r.json() as { vulnerabilities?: Record<string, unknown>[] };
    const vulns = (data.vulnerabilities || []).slice(0, 50);
    count = vulns.length;
    for (const v of vulns) {
      const indicator = String(v.cveID || '');
      if (!indicator) continue;
      const existing = await supaGet(`threat_intel?indicator=eq.${encodeURIComponent(indicator)}&source=eq.CISA+KEV`);
      if (existing && (existing as unknown[]).length > 0) continue;
      const ok = await supaPost('threat_intel', {
        source: 'CISA KEV',
        category: 'cve_exploited',
        indicator,
        description: `[${v.vendorProject}] ${v.product} – ${v.shortDescription}`,
        severity: 'critical',
        raw_data: v,
      });
      if (ok) newSaved++;
    }
  } catch (e) { console.error('CISA KEV error:', e); }
  return { count, newSaved };
}

async function fetchFeodoC2(): Promise<{ count: number; newSaved: number; ips: string[] }> {
  let count = 0, newSaved = 0;
  const ips: string[] = [];
  try {
    const r = await fetch(FEEDS.feodoC2, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return { count, newSaved, ips };
    const data = await r.json() as Record<string, unknown>[];
    const entries = (data || []).slice(0, 50);
    count = entries.length;
    for (const entry of entries) {
      const ip = String(entry.ip_address || '');
      if (!ip) continue;
      ips.push(ip);
      const existing = await supaGet(`threat_intel?indicator=eq.${encodeURIComponent(ip)}&source=eq.Feodo+Tracker`);
      if (existing && (existing as unknown[]).length > 0) continue;
      const ok = await supaPost('threat_intel', {
        source: 'Feodo Tracker',
        category: 'c2_botnet_ip',
        indicator: ip,
        description: `C2 Botnet | Malware: ${entry.malware || 'unknown'} | Port: ${entry.port || '?'}`,
        severity: 'critical',
        raw_data: entry,
      });
      if (ok) newSaved++;
    }
  } catch (e) { console.error('Feodo error:', e); }
  return { count, newSaved, ips };
}

async function fetchURLhaus(): Promise<{ count: number; newSaved: number }> {
  let count = 0, newSaved = 0;
  try {
    const r = await fetch(FEEDS.urlhaus, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'limit=30',
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return { count, newSaved };
    const data = await r.json() as { urls?: Record<string, unknown>[] };
    const urls = (data.urls || []).slice(0, 30);
    count = urls.length;
    for (const entry of urls) {
      const url = String(entry.url || '');
      if (!url) continue;
      const existing = await supaGet(`threat_intel?indicator=eq.${encodeURIComponent(url)}&source=eq.URLhaus`);
      if (existing && (existing as unknown[]).length > 0) continue;
      const ok = await supaPost('threat_intel', {
        source: 'URLhaus',
        category: 'malware_url',
        indicator: url,
        description: `Malware distribution URL | Tags: ${entry.tags || 'unknown'}`,
        severity: 'high',
        raw_data: entry,
      });
      if (ok) newSaved++;
    }
  } catch (e) { console.error('URLhaus error:', e); }
  return { count, newSaved };
}

// ============================================================
// Autoencoder Training from Threat Data
// ============================================================
async function trainAutoencoder(
  c2Count: number, kevCount: number, urlCount: number
): Promise<{ trainedSamples: number; savedToDb: boolean }> {
  // Load latest weights from Supabase
  let ae: ServerAutoencoder;
  const states = await supaGet('autoencoder_states?order=id.desc&limit=1') as Record<string, unknown>[] | null;
  if (states && states.length > 0) {
    ae = new ServerAutoencoder(states[0]);
    console.log(`[AE] Loaded from DB. Previous count: ${ae.count}`);
  } else {
    ae = new ServerAutoencoder();
    console.log('[AE] No DB state found — initializing fresh.');
  }

  let trained = 0;

  // --- BOT samples (gradient ASCENT = teach AE to flag these as anomalies) ---
  // Based on real bot fingerprints: perfectly straight mouse, zero keystroke SD,
  // near-zero mouse entropy, ultra-fast request time
  const botCount = Math.min(c2Count + kevCount + urlCount, 120);
  for (let i = 0; i < botCount; i++) {
    const straight   = 1.92 + Math.random() * 0.08;   // near-perfect straight
    const keystroke  = Math.random() * 4;              // near-zero variance
    const entropy    = Math.random() * 0.5;            // near-zero mouse entropy
    const duration   = 50 + Math.random() * 300;       // ultra-fast (<350ms)
    ae.train(straight, keystroke, entropy, duration, true);
    trained++;
  }

  // --- HUMAN samples (gradient DESCENT = reinforce normal human baseline) ---
  const humanCount = Math.max(30, Math.ceil(botCount * 0.6));
  for (let i = 0; i < humanCount; i++) {
    const straight  = 1.05 + Math.random() * 0.35;
    const keystroke = 18 + Math.random() * 45;
    const entropy   = 2.2 + Math.random() * 3.5;
    const duration  = 900 + Math.random() * 3500;
    ae.train(straight, keystroke, entropy, duration, false);
    trained++;
  }

  // Save updated weights to autoencoder_states
  const state = ae.export();
  const saved = await supaPost('autoencoder_states', state);
  console.log(`[AE] Training done. Samples this run: ${trained}. DB save: ${saved ? '✅' : '❌'}`);
  return { trainedSamples: trained, savedToDb: saved };
}

// ============================================================
// Main Cron Handler
// ============================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth guard
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[ThreatCrawler] === Daily threat intel + autoencoder training cycle started ===');

  try {
    // Phase 1: Fetch from all three real feeds in parallel
    const [kev, c2, malware] = await Promise.all([
      fetchCISAKEV(),
      fetchFeodoC2(),
      fetchURLhaus(),
    ]);

    // Phase 2: Train the autoencoder with threat-derived bot profiles
    const aeResult = await trainAutoencoder(c2.count, kev.count, malware.count);

    // Phase 3: Update risk multiplier and stats
    const riskMultiplier = Math.min(1.0 + (c2.newSaved + kev.newSaved) * 0.003, 1.5);
    await Promise.all([
      supaPost('threat_feed_stats', {
        cves: kev.count, malicious_urls: malware.count, c2_ips: c2.count,
        last_updated: new Date().toISOString(),
      }),
      supaPost('threat_risk_config', {
        risk_multiplier: riskMultiplier,
        new_kev_count: kev.newSaved,
        new_c2_count: c2.newSaved,
        updated_at: new Date().toISOString(),
      }),
    ]);

    console.log('[ThreatCrawler] === Cycle complete ===');

    return res.status(200).json({
      success: true,
      threat_intel: {
        cisa_kev:    { total_fetched: kev.count,     new_saved: kev.newSaved },
        feodo_c2:    { total_fetched: c2.count,      new_saved: c2.newSaved },
        urlhaus:     { total_fetched: malware.count, new_saved: malware.newSaved },
      },
      autoencoder: {
        trained_samples_this_run: aeResult.trainedSamples,
        weights_saved_to_db:      aeResult.savedToDb,
        table:                    'autoencoder_states',
      },
      risk_engine: {
        new_risk_multiplier: riskMultiplier,
        table:               'threat_risk_config',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ThreatCrawler] Fatal:', msg);
    return res.status(500).json({ success: false, error: msg });
  }
}
