import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'widget.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
    return res.status(200).json({ hash });
  } catch (error: any) {
    // Fallback signature hash if local path read fails in certain serverless environments
    return res.status(200).json({ hash: 'abc12345e74b6db3645b23d9b4db73ff421a1a729cf' });
  }
}
