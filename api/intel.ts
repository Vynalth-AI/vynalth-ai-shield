import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('Missing page ID');
  }

  let record: any = null;

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/crawled_threat_intel?id=eq.${id}`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          record = data[0];
        }
      }
    } catch (err) {
      console.error('Failed to fetch threat intel from Supabase:', err);
    }
  }

  if (!record) {
    return res.status(404).send('Threat intelligence page not found');
  }

  const htmlOutput = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${record.title}</title>
  <meta name="description" content="Threat Intel Crawled from ${record.source_url}">
</head>
<body style="font-family: sans-serif; padding: 20px; line-height: 1.6; background-color: #050b14; color: #cbd5e1;">
  <h1 style="color: #00f2fe;">${record.title}</h1>
  <p><strong>Source URL:</strong> <a href="${record.source_url}" style="color: #38bdf8;">${record.source_url}</a></p>
  <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1);">
  <div style="white-space: pre-wrap;">${record.content_text}</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  return res.status(200).send(htmlOutput);
}
