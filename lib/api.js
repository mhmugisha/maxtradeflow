// Bot API base. Configured via NEXT_PUBLIC_BOT_API_BASE; the fallback is the
// verified-live production API host (NOT the -a8f3 host, which is the bot's
// dashboard frontend). See EXECUTION_PLAN.md §1 / A0-1.
import { getInstrument, decimalsFor } from './instruments';

const API_BASE =
  process.env.NEXT_PUBLIC_BOT_API_BASE ||
  'https://smart-asset-bot-production.up.railway.app';

export async function fetchPrices() {
  // Poll our own caching proxy (A0-7), never Railway directly.
  const url = '/api/live/prices';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const data = await response.json();
    const prices = data.prices || data;
    if (typeof prices !== 'object' || Array.isArray(prices)) return [];
    return Object.entries(prices).map(([sym, val]) => {
      const assetClass = getInstrument(sym)?.assetClass;
      const decimals = decimalsFor(sym);
      // Display string preserved as-is: only 6-char forex symbols get a slash;
      // indices, metals and crypto keep their raw symbol in the prices feed.
      const display = sym.length === 6 && !['indices', 'commodities', 'crypto'].includes(assetClass)
        ? sym.slice(0,3) + '/' + sym.slice(3)
        : sym;
      const spread = val.ask && val.bid ? Math.abs(val.ask - val.bid).toFixed(decimals) : '—';
      return {
        symbol: display,
        bid: val.bid ? val.bid.toFixed(decimals) : '—',
        ask: val.ask ? val.ask.toFixed(decimals) : '—',
        spread,
      };
    });
  } catch (error) {
    console.error(`[api] fetchPrices failed (${url}):`, error?.message || error);
    return [];
  }
}

export async function fetchScreener() {
  // Poll our own caching proxy (A0-7), never Railway directly.
  const url = '/api/live/screener';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const data = await response.json();
    const markets = data.markets || data;
    if (!Array.isArray(markets)) return [];
    return markets.map(m => {
      const sym = m.ticker || m.symbol || '';
      const assetClass = getInstrument(sym)?.assetClass;
      // Screener display: 6-char symbols get a slash unless index or metal
      // (so crypto IS slashed here — matches pre-existing behavior).
      const display = sym.length === 6 && !['indices', 'commodities'].includes(assetClass)
        ? sym.slice(0,3) + '/' + sym.slice(3)
        : sym;
      const direction = (m.direction || '').includes('BEAR') ? 'SHORT' : 'LONG';
      const action = m.rating === 'TRADE' ? 'TRADE' : m.rating === 'WATCH' ? 'WATCH' : 'AVOID';
      return {
        symbol: display,
        score: m.score || 0,
        adx: m.adx ? parseFloat(m.adx).toFixed(1) : '—',
        direction,
        action,
        rsi: m.rsi ? parseFloat(m.rsi).toFixed(1) : '—',
      };
    });
  } catch (error) {
    console.error(`[api] fetchScreener failed (${url}):`, error?.message || error);
    return [];
  }
}

export async function fetchBotStatus() {
  const url = `${API_BASE}/api/bot/status`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`[api] fetchBotStatus failed (${url}):`, error?.message || error);
    return null;
  }
}