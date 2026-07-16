const payload = {
  weights1: [[0.1, 0.1], [0.1, 0.1], [0.1, 0.1], [0.1, 0.1]],
  bias1: [0.1, 0.1],
  bias2: [0.1, 0.1, 0.1, 0.1],
  trained_samples_count: 7
};

fetch('https://vita-shield.vercel.app/api/model/deploy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(res => res.json().then(data => {
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', data);
}))
.catch(err => console.error('ERROR:', err));
