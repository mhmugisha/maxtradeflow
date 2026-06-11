// Bot API base. Configured via NEXT_PUBLIC_BOT_API_BASE; the fallback is the
// verified-live production API host (NOT the -a8f3 host, which is the bot's
// dashboard frontend). See EXECUTION_PLAN.md §1 / A0-1.
const API_BASE =
  process.env.NEXT_PUBLIC_BOT_API_BASE ||
  'https://smart-asset-bot-production.up.railway.app';

export async function fetchPrices() {
  const url = `${API_BASE}/api/ctrader/prices`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const data = await response.json();
    const prices = data.prices || data;
    if (typeof prices !== 'object' || Array.isArray(prices)) return [];
    return Object.entries(prices).map(([sym, val]) => {
      const isJPY = sym.includes('JPY');
      const isIndex = ['US500','NAS100','US30'].includes(sym);
      const isMetal = sym === 'XAUUSD';
      const isCrypto = ['BTCUSD','ETHUSD','XRPUSD','SOLUSD','BNBUSD','ADAUSD'].includes(sym);
      const decimals = isJPY ? 3 : isIndex ? 2 : isMetal ? 2 : isCrypto ? 2 : 5;
      const display = sym.length === 6 && !isIndex && !isMetal && !isCrypto
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
  const url = `${API_BASE}/api/screener`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const data = await response.json();
    const markets = data.markets || data;
    if (!Array.isArray(markets)) return [];
    return markets.map(m => {
      const sym = m.ticker || m.symbol || '';
      const isIndex = ['US500','NAS100','US30'].includes(sym);
      const isMetal = sym === 'XAUUSD';
      const display = sym.length === 6 && !isIndex && !isMetal
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