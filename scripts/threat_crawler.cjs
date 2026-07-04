/**
 * scripts/threat_crawler.cjs
 * 
 * An automated, recursive web threat crawler that mimics a search engine.
 * It crawls seed web pages, extracts clean textual content, saves them locally
 * in the public/intel/ directory, and dynamically rebuilds public/sitemap.xml
 * so Cloudflare's AI Search crawler can index them automatically.
 * 
 * Usage:
 *   node scripts/threat_crawler.cjs <seed_url> [max_pages] [max_depth]
 *   Example: node scripts/threat_crawler.cjs https://cve.mitre.org/ 10 2
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const INTEL_DIR = path.join(__dirname, '../public/intel');
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');
const BASE_HOST = 'https://vitashield.sleepsomno.com';

// Ensure output directory exists
if (!fs.existsSync(INTEL_DIR)) {
  fs.mkdirSync(INTEL_DIR, { recursive: true });
}

// Command-line arguments
const seedUrl = process.argv[2];
const maxPages = parseInt(process.argv[3], 10) || 10;
const maxDepth = parseInt(process.argv[4], 10) || 2;

if (!seedUrl) {
  console.log('Error: Please provide a seed URL.');
  console.log('Usage: node scripts/threat_crawler.cjs <seed_url> [max_pages] [max_depth]');
  process.exit(1);
}

const visitedUrls = new Set();
const queue = [{ url: seedUrl, depth: 0 }];
let pagesCrawled = 0;

console.log(`🚀 Starting Threat Crawler with seed: ${seedUrl}`);
console.log(`   Max Pages: ${maxPages} | Max Depth: ${maxDepth}`);

function fetchPage(targetUrl) {
  return new Promise((resolve, reject) => {
    const client = targetUrl.startsWith('https') ? https : http;
    
    const req = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VitaShieldThreatCrawler/1.0; +https://vitashield.sleepsomno.com)'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch page. Status: ${res.statusCode}`));
        return;
      }

      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(body));
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

function extractLinks(html, baseUrl) {
  const links = [];
  const regex = /href="([^"#]+)"/ig;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    try {
      const absoluteUrl = new URL(match[1], baseUrl).toString();
      // Only crawl HTTP/HTTPS links
      if (absoluteUrl.startsWith('http')) {
        links.push(absoluteUrl);
      }
    } catch (e) {
      // Ignore malformed URLs
    }
  }
  return links;
}

function cleanHtml(html) {
  // Remove scripts, styles, and comments
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Extract Title
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Crawled Security Document';

  // Extract body content text
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : cleaned;

  // Strips standard tags but keeps basic paragraph text, list items, headings
  bodyContent = bodyContent
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n# $1\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n* $1\n')
    .replace(/<[^>]+>/g, ' ') // Strip remaining HTML tags
    .replace(/\s+/g, ' ')     // Normalize whitespaces
    .trim();

  return { title, text: bodyContent };
}

async function runCrawler() {
  while (queue.length > 0 && pagesCrawled < maxPages) {
    const { url, depth } = queue.shift();

    if (visitedUrls.has(url)) continue;
    visitedUrls.add(url);

    console.log(`[${pagesCrawled + 1}/${maxPages}] Crawling: ${url} (Depth: ${depth})`);

    try {
      const html = await fetchPage(url);
      const { title, text } = cleanHtml(html);
      
      // Save text to a local file
      const fileName = `intel_${Date.now()}_${pagesCrawled}.html`;
      const filePath = path.join(INTEL_DIR, fileName);

      const htmlOutput = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="Threat Intel Crawled from ${url}">
</head>
<body style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
  <h1>${title}</h1>
  <p><strong>Source URL:</strong> <a href="${url}">${url}</a></p>
  <hr>
  <div style="white-space: pre-wrap;">${text}</div>
</body>
</html>`;

      fs.writeFileSync(filePath, htmlOutput, 'utf8');
      pagesCrawled++;

      // If we haven't reached max depth, find and queue links
      if (depth < maxDepth) {
        const foundLinks = extractLinks(html, url);
        // Restrict to same domain family if desired, or allow external (this script allows external links to gather wide intelligence)
        for (const link of foundLinks) {
          if (!visitedUrls.has(link)) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }
    } catch (err) {
      console.log(`⚠️ Failed to crawl ${url}: ${err.message}`);
    }
  }

  console.log(`\n🎉 Crawl complete! Crawled ${pagesCrawled} pages.`);
  rebuildSitemap();
}

function rebuildSitemap() {
  console.log('🔄 Rebuilding sitemap.xml...');
  
  // Read all crawled files
  const files = fs.readdirSync(INTEL_DIR).filter(f => f.endsWith('.html'));
  
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_HOST}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;

  for (const file of files) {
    sitemapXml += `  <url>
    <loc>${BASE_HOST}/intel/${file}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  sitemapXml += `</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemapXml, 'utf8');
  console.log(`✅ Sitemap successfully updated with ${files.length} crawled files!`);
}

runCrawler();
