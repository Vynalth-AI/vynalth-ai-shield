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
      return res.status(200).json({ 
        weights1: [
          [0.05, -0.05],
          [-0.08, 0.08],
          [0.02, -0.02],
          [-0.04, 0.04]
        ],
        bias1: [0.1, 0.1],
        bias2: [0.1, 0.1, 0.1, 0.1],
        trained_samples_count: 0
      });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/autoencoder_states?order=id.desc&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.statusText}`);
    }

    const states = await response.json();
    if (states && states.length > 0) {
      return res.status(200).json(states[0]);
    }

    // Default weights fallback
    return res.status(200).json({ 
      weights1: [
        [0.05, -0.05],
        [-0.08, 0.08],
        [0.02, -0.02],
        [-0.04, 0.04]
      ],
      bias1: [0.1, 0.1],
      bias2: [0.1, 0.1, 0.1, 0.1],
      trained_samples_count: 0
    });
  } catch (error: any) {
    console.error('Error fetching latest model:', error);
    return res.status(500).json({ error: error.message });
  }
}
