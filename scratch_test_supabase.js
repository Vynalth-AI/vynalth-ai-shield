const SUPABASE_URL = 'https://qgoelcorfcqxberbayul.supabase.co';
const SUPABASE_PUBLISHABLE = 'sb_publishable_Dkkd8-9400Yu7PoSDM-cAw_Url6CiRx';

fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=1`, {
  headers: {
    'apikey': SUPABASE_PUBLISHABLE,
    'Authorization': `Bearer ${SUPABASE_PUBLISHABLE}`
  }
})
.then(res => {
  console.log('STATUS:', res.status);
  return res.json().then(data => console.log('DATA:', data));
})
.catch(err => console.error('ERROR:', err));
