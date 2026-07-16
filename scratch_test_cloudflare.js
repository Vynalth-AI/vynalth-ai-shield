const CLOUDFLARE_SEARCH_URL = 'https://8e6afc0f-9bfc-4aba-8b16-5b452ed6e065.search.ai.cloudflare.com/search';

fetch(CLOUDFLARE_SEARCH_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'bot' })
})
.then(res => {
  console.log('STATUS:', res.status);
  return res.json().then(data => console.log('DATA:', data));
})
.catch(err => console.error('ERROR:', err));
