import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load env files
function loadEnv(file) {
  const envPath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv('.env');
loadEnv('.env.local');

// Import the crawl handler
import handler from '../api/cron/crawl.ts';

const req = {
  headers: {
    authorization: process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined
  }
};

const res = {
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log('CRON STATUS CODE:', this.statusCode);
    console.log('CRON RESPONSE:', JSON.stringify(data, null, 2));
    process.exit(this.statusCode === 200 ? 0 : 1);
  }
};

console.log('Triggering daily crawl handler...');
handler(req, res).catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
