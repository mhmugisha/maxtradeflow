// lib/formatPrice.js
// Returns a price formatted with appropriate decimal precision per ticker.
// Returns '—' for null/undefined values.

const CRYPTO_2_DECIMALS = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD'];
const CRYPTO_4_DECIMALS = ['XRPUSD', 'ADAUSD'];
const INDICES_2_DECIMALS = ['US500', 'NAS100', 'US30', 'UK100', 'GER40', 'JPN225'];

export function formatPrice(value, ticker) {
  if (value === null || value === undefined || value === '') return '—';

  const decimals =
    CRYPTO_2_DECIMALS.includes(ticker) ? 2
    : CRYPTO_4_DECIMALS.includes(ticker) ? 4
    : INDICES_2_DECIMALS.includes(ticker) ? 2
    : 5;

  return parseFloat(value).toFixed(decimals);
}
