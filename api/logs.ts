import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qgoelcorfcqxberbayul.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(200).json({ logs: [] });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/telemetry_logs?order=id.desc&limit=100`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.statusText}`);
    }

    const dbLogs = await response.json();

    // Map database logs to frontend VerificationLog format
    const logs = dbLogs.map((item: any) => {
      const fp = item.device_fingerprint || {};
      const bm = item.behavior_metrics || {};
      const ua = fp.userAgent || '';
      
      let device = 'Desktop';
      if (/mobile/i.test(ua)) device = 'Mobile Phone';
      else if (/ipad|tablet/i.test(ua)) device = 'Tablet';

      let browser = 'Chrome';
      if (/firefox/i.test(ua)) browser = 'Firefox';
      else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
      else if (/edge/i.test(ua)) browser = 'Edge';

      const risk = item.risk_score || 0;
      const status = risk > 70 ? 'blocked' : risk > 40 ? 'flagged' : 'passed';

      return {
        id: `req_${item.id || item.session_id || Math.random().toString(36).substr(2, 9)}`,
        timestamp: item.created_at || new Date().toISOString(),
        ipAddress: fp.ipAddress || '127.0.0.1',
        location: fp.timezone ? fp.timezone.replace('_', ' ') : 'Global Gateway',
        device,
        browser,
        method: risk > 70 ? 'cryptographic_pow' : 'behavioral_telemetry',
        status,
        riskScore: risk,
        flags: bm.behaviorFlags || [],
        deviceAnomalies: fp.deviceAnomalies || []
      };
    });

    return res.status(200).json({ logs });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: error.message, logs: [] });
  }
}
