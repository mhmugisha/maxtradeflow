// lib/instruments.js
// Single source of truth for the 21 bot-traded instruments (EXECUTION_PLAN.md §1).
//
// Shape per instrument:
//   symbol      canonical bot symbol, no slash (e.g. 'EURUSD') — matches the
//               keys returned by the bot price/screener APIs
//   display     human display form (e.g. 'EUR/USD')
//   name        full name (e.g. 'Euro / US Dollar')
//   assetClass  'forex' | 'indices' | 'commodities' | 'crypto'
//   decimals    decimal places for price formatting (FX 5, JPY pairs 3,
//               indices 2, metals 2, crypto 2 — see §1)
//   slug        lowercase route slug (e.g. 'eurusd' → /markets/forex/eurusd)
//   related     up to 4 related instrument symbols (same/adjacent class)
//
// Decimals intentionally mirror the existing lib/api.js formatting so that
// consolidating onto this registry is behavior-neutral. Stocks are a separate
// Finnhub-sourced surface and are NOT part of the 21 bot instruments.
//
// Adding instrument 22 = add one row here.

export const INSTRUMENTS = [
  // ── Forex (11) ──────────────────────────────────────────────────────────
  { symbol: 'EURUSD', display: 'EUR/USD', name: 'Euro / US Dollar',     assetClass: 'forex', decimals: 5, slug: 'eurusd', related: ['GBPUSD', 'EURGBP', 'AUDUSD', 'NZDUSD'] },
  { symbol: 'GBPUSD', display: 'GBP/USD', name: 'Pound / US Dollar',    assetClass: 'forex', decimals: 5, slug: 'gbpusd', related: ['EURUSD', 'EURGBP', 'GBPJPY', 'GBPAUD'] },
  { symbol: 'USDJPY', display: 'USD/JPY', name: 'US Dollar / Yen',      assetClass: 'forex', decimals: 3, slug: 'usdjpy', related: ['GBPJPY', 'AUDJPY', 'CHFJPY', 'EURUSD'] },
  { symbol: 'GBPJPY', display: 'GBP/JPY', name: 'Pound / Yen',          assetClass: 'forex', decimals: 3, slug: 'gbpjpy', related: ['USDJPY', 'AUDJPY', 'CHFJPY', 'GBPUSD'] },
  { symbol: 'AUDUSD', display: 'AUD/USD', name: 'Aussie / US Dollar',   assetClass: 'forex', decimals: 5, slug: 'audusd', related: ['NZDUSD', 'AUDJPY', 'EURUSD', 'GBPAUD'] },
  { symbol: 'USDCAD', display: 'USD/CAD', name: 'US Dollar / Canadian', assetClass: 'forex', decimals: 5, slug: 'usdcad', related: ['EURUSD', 'AUDUSD', 'NZDUSD', 'USDJPY'] },
  { symbol: 'EURGBP', display: 'EUR/GBP', name: 'Euro / Pound',         assetClass: 'forex', decimals: 5, slug: 'eurgbp', related: ['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD'] },
  { symbol: 'AUDJPY', display: 'AUD/JPY', name: 'Aussie / Yen',         assetClass: 'forex', decimals: 3, slug: 'audjpy', related: ['USDJPY', 'GBPJPY', 'CHFJPY', 'AUDUSD'] },
  { symbol: 'GBPAUD', display: 'GBP/AUD', name: 'Pound / Aussie',       assetClass: 'forex', decimals: 5, slug: 'gbpaud', related: ['GBPUSD', 'AUDUSD', 'GBPJPY', 'EURGBP'] },
  { symbol: 'CHFJPY', display: 'CHF/JPY', name: 'Franc / Yen',          assetClass: 'forex', decimals: 3, slug: 'chfjpy', related: ['USDJPY', 'GBPJPY', 'AUDJPY', 'EURUSD'] },
  { symbol: 'NZDUSD', display: 'NZD/USD', name: 'Kiwi / US Dollar',     assetClass: 'forex', decimals: 5, slug: 'nzdusd', related: ['AUDUSD', 'EURUSD', 'USDCAD', 'GBPUSD'] },

  // ── Indices (3) ─────────────────────────────────────────────────────────
  { symbol: 'US500', display: 'US500', name: 'S&P 500 Index',  assetClass: 'indices', decimals: 2, slug: 'us500',  related: ['NAS100', 'US30', 'XAUUSD', 'EURUSD'] },
  { symbol: 'NAS100', display: 'NAS100', name: 'NASDAQ 100',   assetClass: 'indices', decimals: 2, slug: 'nas100', related: ['US500', 'US30', 'XAUUSD', 'BTCUSD'] },
  { symbol: 'US30', display: 'US30', name: 'Dow Jones 30',     assetClass: 'indices', decimals: 2, slug: 'us30',   related: ['US500', 'NAS100', 'XAUUSD', 'EURUSD'] },

  // ── Commodities (1) ─────────────────────────────────────────────────────
  { symbol: 'XAUUSD', display: 'XAU/USD', name: 'Gold / US Dollar', assetClass: 'commodities', decimals: 2, slug: 'xauusd', related: ['US500', 'NAS100', 'USDJPY', 'EURUSD'] },

  // ── Crypto (6) ──────────────────────────────────────────────────────────
  { symbol: 'BTCUSD', display: 'BTC/USD', name: 'Bitcoin / US Dollar',  assetClass: 'crypto', decimals: 2, slug: 'btcusd', related: ['ETHUSD', 'SOLUSD', 'BNBUSD', 'NAS100'] },
  { symbol: 'ETHUSD', display: 'ETH/USD', name: 'Ethereum / US Dollar', assetClass: 'crypto', decimals: 2, slug: 'ethusd', related: ['BTCUSD', 'SOLUSD', 'BNBUSD', 'ADAUSD'] },
  { symbol: 'XRPUSD', display: 'XRP/USD', name: 'Ripple / US Dollar',   assetClass: 'crypto', decimals: 2, slug: 'xrpusd', related: ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD'] },
  { symbol: 'SOLUSD', display: 'SOL/USD', name: 'Solana / US Dollar',   assetClass: 'crypto', decimals: 2, slug: 'solusd', related: ['BTCUSD', 'ETHUSD', 'BNBUSD', 'ADAUSD'] },
  { symbol: 'BNBUSD', display: 'BNB/USD', name: 'Binance Coin / USD',   assetClass: 'crypto', decimals: 2, slug: 'bnbusd', related: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'ADAUSD'] },
  { symbol: 'ADAUSD', display: 'ADA/USD', name: 'Cardano / US Dollar',  assetClass: 'crypto', decimals: 2, slug: 'adausd', related: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD'] },
];

// ── Lookups ─────────────────────────────────────────────────────────────────
// Accept either the canonical symbol ('EURUSD') or the display form ('EUR/USD').
const BY_SYMBOL = new Map(INSTRUMENTS.map((i) => [i.symbol, i]));
const BY_DISPLAY = new Map(INSTRUMENTS.map((i) => [i.display, i]));
const BY_SLUG = new Map(INSTRUMENTS.map((i) => [i.slug, i]));

/** Normalize any input ('EUR/USD', 'eurusd', 'EURUSD') to a canonical symbol. */
export function normalizeSymbol(input) {
  if (!input) return '';
  const raw = String(input).trim();
  const compact = raw.replace('/', '').toUpperCase();
  if (BY_SYMBOL.has(compact)) return compact;
  if (BY_DISPLAY.has(raw.toUpperCase())) return BY_DISPLAY.get(raw.toUpperCase()).symbol;
  if (BY_SLUG.has(raw.toLowerCase())) return BY_SLUG.get(raw.toLowerCase()).symbol;
  return compact;
}

/** Get the full instrument record for any symbol/display/slug, or null. */
export function getInstrument(input) {
  return BY_SYMBOL.get(normalizeSymbol(input)) || null;
}

/** Instruments belonging to an asset class. */
export function instrumentsByClass(assetClass) {
  return INSTRUMENTS.filter((i) => i.assetClass === assetClass);
}

/** Decimal places for a symbol (falls back to 5 for unknown FX-like symbols). */
export function decimalsFor(input) {
  const inst = getInstrument(input);
  return inst ? inst.decimals : 5;
}

/** Display form ('EUR/USD') for a symbol; echoes input if unknown. */
export function displayFor(input) {
  const inst = getInstrument(input);
  return inst ? inst.display : String(input ?? '');
}

/**
 * Format a numeric price using the instrument's decimal precision.
 * Returns '—' for null/undefined/empty/non-numeric values.
 */
export function formatInstrumentPrice(value, input) {
  if (value === null || value === undefined || value === '') return '—';
  const n = parseFloat(value);
  if (Number.isNaN(n)) return '—';
  return n.toFixed(decimalsFor(input));
}
