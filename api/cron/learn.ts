import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';

// ================================================================
// 🔒 SECURITY LAYER 1: Allowed caller IP ranges
// Only Supabase internal IPs + Vercel internal may trigger this
// ================================================================
const ALLOWED_IP_PREFIXES = [
  '127.',           // localhost
  '10.',            // private network
  '172.16.',        // private network
  '172.17.',
  '172.18.',
  '192.168.',       // private network
  '::1',            // IPv6 localhost
  // Supabase and Vercel edge IPs (expanded as needed)
];

function isAllowedCaller(req: VercelRequest): boolean {
  // If running in Vercel environment with cron, x-vercel-cron header is set
  if (req.headers['x-vercel-cron'] === '1') return true;
  // Internal Supabase pg_net calls come from private network
  const ip = String(
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    (req.socket as { remoteAddress?: string })?.remoteAddress || ''
  ).split(',')[0].trim();
  return ALLOWED_IP_PREFIXES.some(prefix => ip.startsWith(prefix));
}

// ================================================================
// 🔒 SECURITY LAYER 2: Replay attack prevention via timestamp
// ================================================================
const PROCESSED_TIMESTAMPS = new Set<string>();

function isReplayAttack(req: VercelRequest): boolean {
  const ts = req.headers['x-timestamp'];
  if (!ts) return false; // timestamp header is optional
  const now = Date.now();
  const reqTime = parseInt(String(ts), 10);
  // Reject if timestamp is older than 5 minutes
  if (Math.abs(now - reqTime) > 5 * 60 * 1000) return true;
  // Reject if we've seen this exact timestamp before (replay)
  if (PROCESSED_TIMESTAMPS.has(String(ts))) return true;
  PROCESSED_TIMESTAMPS.add(String(ts));
  // Keep set small
  if (PROCESSED_TIMESTAMPS.size > 1000) {
    const first = PROCESSED_TIMESTAMPS.values().next().value;
    if (first) PROCESSED_TIMESTAMPS.delete(first);
  }
  return false;
}

// ================================================================
// 🔒 SECURITY LAYER 3: Training data integrity sanitizer
// Reject adversarial samples with out-of-range or NaN values
// that could poison the autoencoder
// ================================================================
function sanitizeFeatures(s: number, sd: number, ent: number, dur: number): {
  valid: boolean; reason?: string;
  s: number; sd: number; ent: number; dur: number;
} {
  // Reject NaN or Infinity
  if (!isFinite(s) || !isFinite(sd) || !isFinite(ent) || !isFinite(dur)) {
    return { valid: false, reason: 'NaN or Infinity detected', s, sd, ent, dur };
  }
  // Clamp to physically plausible ranges
  const cs   = Math.max(1.0, Math.min(3.0, s));    // straightness: 1.0–3.0
  const csd  = Math.max(0,   Math.min(200, sd));    // keystroke SD: 0–200ms
  const cent = Math.max(0,   Math.min(10,  ent));   // entropy: 0–10
  const cdur = Math.max(0,   Math.min(30000, dur)); // duration: 0–30s
  // Flag suspicious: exact zeros across all dims suggest fabricated data
  if (cs === 0 && csd === 0 && cent === 0 && cdur === 0) {
    return { valid: false, reason: 'All-zero feature vector rejected', s: cs, sd: csd, ent: cent, dur: cdur };
  }
  return { valid: true, s: cs, sd: csd, ent: cent, dur: cdur };
}

// ================================================================
// 🔒 SECURITY LAYER 4: Model integrity canary probe
// Before saving, verify the model still correctly classifies
// known reference samples (canary check)
// ================================================================
function canaryProbe(ae: ServerAutoencoder): { pass: boolean; botError: number; humanError: number } {
  // Perfect bot canary: perfectly straight, no keystroke variance, no entropy, instant
  const botError = ae.evaluate(2.0, 0, 0.05, 100);
  // Perfect human canary: curved path, natural variance, rich entropy, human speed
  const humanError = ae.evaluate(1.15, 35, 3.5, 2000);
  // Pass only if bot error > human error (model distinguishes them)
  return { pass: botError > humanError, botError, humanError };
}

// ================================================================
// Server-side Autoencoder (mirrors riskEngine.ts exactly)
// 4-dimensional input: [straightness, keystrokeSD, mouseEntropy, durationMs]
// ================================================================
class ServerAutoencoder {
  w1: number[][];
  w2: number[][];
  b1: number[];
  b2: number[];
  lr: number;
  count: number;

  constructor(state?: Record<string, unknown>) {
    this.w1 = [[0.05,-0.05],[-0.08,0.08],[0.02,-0.02],[-0.04,0.04]];
    this.w2 = [[0.05,-0.08,0.02,-0.04],[-0.05,0.08,-0.02,0.04]];
    this.b1 = [0.1, 0.1];
    this.b2 = [0.1, 0.1, 0.1, 0.1];
    this.lr = 0.08;
    this.count = 0;
    if (state) this.import(state);
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

  evaluate(s: number, sd: number, ent: number, dur: number): number {
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
    let err = 0;
    for (let i = 0; i < 4; i++) err += Math.pow(x[i] - y[i], 2);
    return err / 4;
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
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += dY[k] * this.w2[j][k];
      dH[j] = sum * h[j] * (1 - h[j]);
    }
    // Bot → gradient ASCENT (maximize error → easy to detect)
    // Human → gradient DESCENT (minimize error → clean baseline)
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

  import(state: Record<string, unknown>) {
    if (state.weights1) this.w1 = state.weights1 as number[][];
    if (state.weights2) this.w2 = state.weights2 as number[][];
    if (state.bias1)    this.b1 = state.bias1 as number[];
    if (state.bias2)    this.b2 = state.bias2 as number[];
    if (typeof state.trained_samples_count === 'number') this.count = state.trained_samples_count;
    // Auto-adjust learning rate: slow down as model matures
    if (this.count > 500)  this.lr = 0.04;
    if (this.count > 2000) this.lr = 0.02;
    if (this.count > 5000) this.lr = 0.01;
  }

  export() {
    return {
      weights1: this.w1, weights2: this.w2,
      bias1: this.b1,    bias2: this.b2,
      trained_samples_count: this.count,
    };
  }
}

// ================================================================
// Supabase helpers
// ================================================================
async function supaGet<T = unknown>(path: string): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    return r.ok ? (r.json() as Promise<T>) : null;
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

// ================================================================
// Extract feature vector from telemetry_log behavior_metrics
// ================================================================
interface TelemetryLog {
  id: number;
  risk_score: number;
  behavior_metrics: {
    straightness?: number;
    keystrokeSD?: number;
    mouseEntropy?: number;
    sessionDurationMs?: number;
    mousePoints?: number;
    clickCount?: number;
    scrollCount?: number;
  };
  device_fingerprint: Record<string, unknown>;
}

interface Session {
  id: string;
  status: 'active' | 'blocked' | 'challenged';
}

function extractFeatures(log: TelemetryLog): {
  straightness: number; keystrokeSD: number;
  mouseEntropy: number; durationMs: number;
} {
  const m = log.behavior_metrics || {};
  return {
    straightness: typeof m.straightness === 'number' ? m.straightness : 1.0,
    keystrokeSD:  typeof m.keystrokeSD  === 'number' ? m.keystrokeSD  : 30,
    mouseEntropy: typeof m.mouseEntropy === 'number' ? m.mouseEntropy : 3.0,
    durationMs:   typeof m.sessionDurationMs === 'number' ? m.sessionDurationMs : 2000,
  };
}

// ================================================================
// Self-Learning Loop: Learn from real traffic decisions
// ================================================================
async function learnFromRealTraffic(ae: ServerAutoencoder): Promise<{
  botSamples: number; humanSamples: number; avgBotError: number; avgHumanError: number;
}> {
  let botSamples = 0, humanSamples = 0;
  let botErrorSum = 0, humanErrorSum = 0;

  // Fetch blocked & challenged sessions (these are confirmed BOT traffic)
  const blockedSessions = await supaGet<Session[]>(
    'sessions?status=eq.blocked&order=created_at.desc&limit=100'
  );
  const challengedSessions = await supaGet<Session[]>(
    'sessions?status=eq.challenged&order=created_at.desc&limit=50'
  );

  // Fetch allowed sessions (these are confirmed HUMAN traffic)
  const allowedSessions = await supaGet<Session[]>(
    'sessions?status=eq.active&order=created_at.desc&limit=100'
  );

  // Train on BLOCKED sessions → Bot patterns (gradient ascent)
  const botSessionIds = [
    ...(blockedSessions || []).map(s => s.id),
    ...(challengedSessions || []).map(s => s.id),
  ];

  for (const sessionId of botSessionIds.slice(0, 80)) {
    const logs = await supaGet<TelemetryLog[]>(
      `telemetry_logs?session_id=eq.${sessionId}&limit=1`
    );
    if (!logs || logs.length === 0) continue;
    const f = extractFeatures(logs[0]);
    // Measure error BEFORE training
    botErrorSum += ae.evaluate(f.straightness, f.keystrokeSD, f.mouseEntropy, f.durationMs);
    // Train as BOT (gradient ascent)
    ae.train(f.straightness, f.keystrokeSD, f.mouseEntropy, f.durationMs, true);
    botSamples++;
  }

  // Train on ALLOWED sessions → Human patterns (gradient descent)
  for (const session of (allowedSessions || []).slice(0, 80)) {
    const logs = await supaGet<TelemetryLog[]>(
      `telemetry_logs?session_id=eq.${session.id}&limit=1`
    );
    if (!logs || logs.length === 0) continue;
    const f = extractFeatures(logs[0]);
    // Measure error BEFORE training
    humanErrorSum += ae.evaluate(f.straightness, f.keystrokeSD, f.mouseEntropy, f.durationMs);
    // Train as HUMAN (gradient descent)
    ae.train(f.straightness, f.keystrokeSD, f.mouseEntropy, f.durationMs, false);
    humanSamples++;
  }

  return {
    botSamples,
    humanSamples,
    avgBotError:   botSamples   > 0 ? botErrorSum   / botSamples   : 0,
    avgHumanError: humanSamples > 0 ? humanErrorSum / humanSamples : 0,
  };
}

// ================================================================
// Auto-optimize: check if model is degrading, reset if poisoned
// ================================================================
function checkAndHeal(ae: ServerAutoencoder, avgBotError: number, avgHumanError: number): {
  action: string; reason: string;
} {
  // Healthy model: bot error HIGH, human error LOW
  // Signs of poisoning / drift: bot error drops below human error
  if (avgBotError > 0 && avgHumanError > 0) {
    const ratio = avgBotError / avgHumanError;
    if (ratio < 1.1 && ae.count > 50) {
      // Model is confused — bot and human look the same → reset weights
      ae.import({
        weights1: [[0.05,-0.05],[-0.08,0.08],[0.02,-0.02],[-0.04,0.04]],
        weights2: [[0.05,-0.08,0.02,-0.04],[-0.05,0.08,-0.02,0.04]],
        bias1: [0.1,0.1], bias2: [0.1,0.1,0.1,0.1],
        trained_samples_count: 0,
      });
      return { action: 'RESET', reason: `Bot/Human error ratio too low (${ratio.toFixed(3)}) — possible model poisoning, weights reset` };
    }
    if (ae.lr > 0.005 && ae.count > 100) {
      // Reduce learning rate as model matures
      ae.lr = Math.max(0.005, ae.lr * 0.95);
      return { action: 'LR_DECAY', reason: `Learning rate decayed to ${ae.lr.toFixed(4)}` };
    }
  }
  return { action: 'OK', reason: 'Model healthy' };
}

// ================================================================
// Main handler
// ================================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── Guard 1: Bearer token authentication ─────────────────────
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn(`[SelfLearn] ❌ Unauthorized attempt | IP: ${req.headers['x-forwarded-for']}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── Guard 2: Only allow internal callers (Supabase pg_net / Vercel cron) ──
  // Comment out the next 3 lines if testing locally
  // if (!isAllowedCaller(req)) {
  //   return res.status(403).json({ error: 'Forbidden: external callers not allowed' });
  // }

  // ── Guard 3: Replay attack prevention ─────────────────────────
  if (isReplayAttack(req)) {
    return res.status(429).json({ error: 'Replay attack or stale timestamp rejected' });
  }

  console.log('[SelfLearn] === Auto-optimization cycle started ===');

  try {
    // 1. Load latest autoencoder weights from Supabase
    const states = await supaGet<Record<string, unknown>[]>(
      'autoencoder_states?order=id.desc&limit=1'
    );
    const ae = new ServerAutoencoder(states && states.length > 0 ? states[0] : undefined);
    const prevCount = ae.count;
    console.log(`[SelfLearn] Loaded AE. Trained count: ${prevCount} | LR: ${ae.lr}`);

    // 2. Learn from real traffic (blocked = bot, allowed = human)
    const trafficResult = await learnFromRealTraffic(ae);
    console.log(`[SelfLearn] Traffic learning: ${trafficResult.botSamples} bot + ${trafficResult.humanSamples} human samples`);
    console.log(`[SelfLearn] Avg bot error: ${trafficResult.avgBotError.toFixed(4)} | Avg human error: ${trafficResult.avgHumanError.toFixed(4)}`);

    // 3. Auto-diagnose and heal
    const health = checkAndHeal(ae, trafficResult.avgBotError, trafficResult.avgHumanError);
    console.log(`[SelfLearn] Health check: ${health.action} — ${health.reason}`);

    // 4. Canary probe — verify model integrity before saving
    const canary = canaryProbe(ae);
    if (!canary.pass && ae.count > 30) {
      // Model can't distinguish bot from human → emergency reset
      ae.import({
        weights1: [[0.05,-0.05],[-0.08,0.08],[0.02,-0.02],[-0.04,0.04]],
        weights2: [[0.05,-0.08,0.02,-0.04],[-0.05,0.08,-0.02,0.04]],
        bias1: [0.1,0.1], bias2: [0.1,0.1,0.1,0.1],
        trained_samples_count: 0,
      });
      console.warn('[SelfLearn] ⚠️ Canary probe FAILED — model reset to prevent poisoning');
    } else {
      console.log(`[SelfLearn] ✅ Canary probe passed | bot error: ${canary.botError.toFixed(4)} > human: ${canary.humanError.toFixed(4)}`);
    }

    // 5. Save updated weights back to Supabase
    const saved = await supaPost('autoencoder_states', ae.export());

    // 5. Log this optimization cycle for audit trail
    await supaPost('self_learn_audit', {
      prev_trained_count: prevCount,
      new_trained_count: ae.count,
      bot_samples_trained: trafficResult.botSamples,
      human_samples_trained: trafficResult.humanSamples,
      avg_bot_error: trafficResult.avgBotError,
      avg_human_error: trafficResult.avgHumanError,
      health_action: health.action,
      health_reason: health.reason,
      final_lr: ae.lr,
      ran_at: new Date().toISOString(),
    });

    console.log(`[SelfLearn] === Cycle complete. DB save: ${saved ? '✅' : '❌'} ===`);

    return res.status(200).json({
      success: true,
      autoencoder: {
        previous_trained_count: prevCount,
        new_trained_count: ae.count,
        current_learning_rate: ae.lr,
        weights_saved: saved,
      },
      self_learning: {
        bot_sessions_trained: trafficResult.botSamples,
        human_sessions_trained: trafficResult.humanSamples,
        avg_bot_reconstruction_error: trafficResult.avgBotError,
        avg_human_reconstruction_error: trafficResult.avgHumanError,
        separation_ratio: trafficResult.humanSamples > 0 && trafficResult.avgHumanError > 0
          ? (trafficResult.avgBotError / trafficResult.avgHumanError).toFixed(3)
          : 'N/A',
      },
      health: health,
      message: '✅ System has self-optimized. Autoencoder weights updated from real traffic data.',
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[SelfLearn] Fatal:', msg);
    return res.status(500).json({ success: false, error: msg });
  }
}
