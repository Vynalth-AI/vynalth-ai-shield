const SUPABASE_URL = 'https://qgoelcorfcqxberbayul.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Dkkd8-9400Yu7PoSDM-cAw_Url6CiRx';

async function verify() {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  try {
    // 1. Fetch threat_intel count
    const resIntel = await fetch(`${SUPABASE_URL}/rest/v1/threat_intel?select=count`, { headers, method: 'GET' });
    const countIntel = await resIntel.json();
    console.log('Database Persistence Verification:');
    console.log('- threat_intel Count:', JSON.stringify(countIntel));

    // 2. Fetch threat_risk_config latest
    const resRisk = await fetch(`${SUPABASE_URL}/rest/v1/threat_risk_config?order=id.desc&limit=1`, { headers, method: 'GET' });
    const latestRisk = await resRisk.json();
    console.log('- Latest threat_risk_config:', JSON.stringify(latestRisk));

    // 3. Fetch autoencoder_states latest trained count
    const resAE = await fetch(`${SUPABASE_URL}/rest/v1/autoencoder_states?order=id.desc&limit=1`, { headers, method: 'GET' });
    const latestAE = await resAE.json();
    console.log('- Latest autoencoder_states:', JSON.stringify(latestAE));

  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

verify();
