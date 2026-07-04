import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qgoelcorfcqxberbayul.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';

// =====================================================================
// Open-Source Threat Intelligence Sources (all free, no API key needed)
// =====================================================================
const THREAT_FEEDS = [
  {
    name: 'CISA KEV',
    description: 'CISA Known Exploited Vulnerabilities Catalog (US Government)',
    url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    type: 'json' as const,
  },
  {
    name: 'abuse.ch URLhaus',
    description: 'Malware distribution URLs tracked by abuse.ch community',
    url: 'https://urlhaus-api.abuse.ch/v1/urls/recent/',
    type: 'json_post' as const,
  },
  {
    name: 'Feodo Tracker C2 IPs',
    description: 'Botnet Command-and-Control IP blocklist by abuse.ch',
    url: 'https://feodotracker.abuse.ch/downloads/ipblocklist.json',
    type: 'json' as const,
  },
];

// =====================================================================
// Type definitions
// =====================================================================
interface ThreatRecord {
  source: string;
  category: string;
  indicator: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  raw_data: Record<string, unknown>;
}

// =====================================================================
// Supabase helpers
// =====================================================================
async function upsertThreat(record: ThreatRecord): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  // Check if indicator already exists
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/threat_intel?indicator=eq.${encodeURIComponent(record.indicator)}&source=eq.${encodeURIComponent(record.source)}`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (checkRes.ok) {
    const existing = await checkRes.json();
    if (existing && existing.length > 0) return; // Skip duplicate
  }

  await fetch(`${SUPABASE_URL}/rest/v1/threat_intel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(record),
  });
}

async function updateThreatStats(stats: { cves: number; malicious_urls: number; c2_ips: number }): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  await fetch(`${SUPABASE_URL}/rest/v1/threat_feed_stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...stats, last_updated: new Date().toISOString() }),
  });
}

// =====================================================================
// Feed parsers
// =====================================================================
async function fetchCISAKEV(): Promise<ThreatRecord[]> {
  const results: ThreatRecord[] = [];
  try {
    const res = await fetch(THREAT_FEEDS[0].url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return results;
    const data = await res.json() as { vulnerabilities?: Array<Record<string, unknown>> };

    const vulns = (data.vulnerabilities || []).slice(0, 50); // Latest 50 KEVs
    for (const v of vulns) {
      results.push({
        source: 'CISA KEV',
        category: 'cve_exploited',
        indicator: String(v.cveID || ''),
        description: `[${v.vendorProject}] ${v.product}: ${v.shortDescription}`,
        severity: 'critical',
        raw_data: v,
      });
    }
  } catch (err) {
    console.error('CISA KEV fetch error:', err);
  }
  return results;
}

async function fetchURLhaus(): Promise<ThreatRecord[]> {
  const results: ThreatRecord[] = [];
  try {
    const res = await fetch(THREAT_FEEDS[1].url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'limit=50',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return results;
    const data = await res.json() as { urls?: Array<Record<string, unknown>> };

    for (const entry of (data.urls || []).slice(0, 30)) {
      const url = String(entry.url || '');
      if (!url) continue;
      results.push({
        source: 'abuse.ch URLhaus',
        category: 'malware_url',
        indicator: url,
        description: `Malware: ${entry.tags || 'unknown'} | Reporter: ${entry.reporter || 'community'}`,
        severity: 'high',
        raw_data: entry,
      });
    }
  } catch (err) {
    console.error('URLhaus fetch error:', err);
  }
  return results;
}

async function fetchFeodoC2(): Promise<ThreatRecord[]> {
  const results: ThreatRecord[] = [];
  try {
    const res = await fetch(THREAT_FEEDS[2].url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return results;
    const data = await res.json() as Array<Record<string, unknown>>;

    for (const entry of (data || []).slice(0, 50)) {
      const ip = String(entry.ip_address || '');
      if (!ip) continue;
      results.push({
        source: 'Feodo Tracker',
        category: 'c2_botnet_ip',
        indicator: ip,
        description: `C2 Botnet IP | Malware: ${entry.malware || 'unknown'} | Port: ${entry.port || 'unknown'}`,
        severity: 'critical',
        raw_data: entry,
      });
    }
  } catch (err) {
    console.error('Feodo C2 fetch error:', err);
  }
  return results;
}

// =====================================================================
// Auto-update risk engine: raise baseline risk for C2/KEV indicators
// =====================================================================
async function autoUpdateRiskThresholds(c2Count: number, kevCount: number): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  if (c2Count === 0 && kevCount === 0) return;

  // Dynamically increase global risk sensitivity when new threats are detected
  const riskMultiplier = Math.min(1.0 + (c2Count + kevCount) * 0.002, 1.5);

  await fetch(`${SUPABASE_URL}/rest/v1/threat_risk_config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      risk_multiplier: riskMultiplier,
      new_kev_count: kevCount,
      new_c2_count: c2Count,
      updated_at: new Date().toISOString(),
    }),
  });
}

// =====================================================================
// Main cron handler
// =====================================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Protect against unauthorized triggers
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  console.log('[ThreatCrawler] Starting threat intelligence collection...');

  try {
    // Parallel fetch from all open-source feeds
    const [cisaRecords, urlhausRecords, feodoRecords] = await Promise.all([
      fetchCISAKEV(),
      fetchURLhaus(),
      fetchFeodoC2(),
    ]);

    const allRecords = [...cisaRecords, ...urlhausRecords, ...feodoRecords];
    let saved = 0;

    // Persist all records concurrently in batches
    const batchSize = 5;
    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, i + batchSize);
      await Promise.all(batch.map((r) => upsertThreat(r).then(() => saved++).catch(() => {})));
    }

    // Update feed statistics
    await updateThreatStats({
      cves: cisaRecords.length,
      malicious_urls: urlhausRecords.length,
      c2_ips: feodoRecords.length,
    });

    // Auto-adjust risk engine sensitivity based on newly discovered threats
    await autoUpdateRiskThresholds(feodoRecords.length, cisaRecords.length);

    console.log(`[ThreatCrawler] Done. Saved ${saved}/${allRecords.length} indicators.`);

    return res.status(200).json({
      success: true,
      summary: {
        cisa_kev: cisaRecords.length,
        malware_urls: urlhausRecords.length,
        botnet_c2_ips: feodoRecords.length,
        total_saved: saved,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ThreatCrawler] Fatal error:', message);
    return res.status(500).json({ success: false, error: message });
  }
}
