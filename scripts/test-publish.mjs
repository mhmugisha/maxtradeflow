import fetch from 'node-fetch';

const signal = {
  ticker: 'GBPJPY',
  direction: 'LONG',
  score: 9,
  adx: 28.4,
  rsi: 52.3,
  entry_price: 213.22,
  stop_loss: 212.06,
  take_profit: 216.70,
  rr_ratio: 3.0,
  entry_mode: 'SWEEP',
  sl_reason: 'Sweep SL beyond swept wick at 212.98',
  rating: 'TRADE'
};

const response = await fetch('http://localhost:3000/api/publish-signal', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer maxtradeflow_publish_2026'
  },
  body: JSON.stringify(signal)
});

const result = await response.json();
console.log('Result:', result);