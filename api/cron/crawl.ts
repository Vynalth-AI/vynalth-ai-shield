import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qgoelcorfcqxberbayul.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Protect cron endpoints against unauthorized execution
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized cron trigger' });
  }

  // Predefined crawl targets
  const seedUrl = 'https://www.cve.org/';
  const maxPages = 3;
  
  const visitedUrls = new Set<string>();
  const queue = [{ url: seedUrl, depth: 0 }];
  let pagesCrawled = 0;
  const crawledResults: Array<{ title: string; source_url: string; content_text: string }> = [];

  try {
    while (queue.length > 0 && pagesCrawled < maxPages) {
      const { url, depth } = queue.shift()!;
      if (visitedUrls.has(url)) continue;
      visitedUrls.add(url);

      // Fetch
      const fetchRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VitaShieldThreatCrawler/1.0; +https://vitashield.sleepsomno.com)'
        }
      });
      if (!fetchRes.ok) continue;

      const html = await fetchRes.text();
      
      // Clean HTML
      let cleaned = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Crawled Security Document';

      const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let bodyContent = bodyMatch ? bodyMatch[1] : cleaned;

      bodyContent = bodyContent
        .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n# $1\n')
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n* $1\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      crawledResults.push({
        title,
        source_url: url,
        content_text: bodyContent
      });

      pagesCrawled++;

      // Extract links if depth < 1
      if (depth < 1) {
        const linkRegex = /href="([^"#]+)"/ig;
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
          try {
            const absoluteUrl = new URL(match[1], url).toString();
            if (absoluteUrl.startsWith('https://www.cve.org/') && !visitedUrls.has(absoluteUrl)) {
              queue.push({ url: absoluteUrl, depth: depth + 1 });
            }
          } catch (e) {}
        }
      }
    }

    // Persist crawled pages to Supabase crawled_threat_intel table
    if (crawledResults.length > 0 && SUPABASE_URL && SUPABASE_KEY) {
      for (const item of crawledResults) {
        try {
          // Check if already exists in Supabase
          const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/crawled_threat_intel?source_url=eq.${encodeURIComponent(item.source_url)}`, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          });
          if (checkRes.ok) {
            const existing = await checkRes.json();
            if (existing && existing.length > 0) {
              // Already indexed, skip
              continue;
            }
          }

          // Insert
          await fetch(`${SUPABASE_URL}/rest/v1/crawled_threat_intel`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify(item)
          });
        } catch (dbErr) {
          console.error(`Supabase persistence failed for ${item.source_url}:`, dbErr);
        }
      }
    }

    return res.status(200).json({
      success: true,
      pages_crawled: pagesCrawled,
      saved_results_count: crawledResults.length
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
