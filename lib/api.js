const API_BASE = 'https://smart-asset-bot-production.up.railway.app';

export async function fetchPrices() {
  try {
    const response = await fetch(`${API_BASE}/api/ctrader/prices`);
    if (!response.ok) throw new Error('Failed to fetch prices');
    const data = await response.json();
    const prices = data.prices || data;
    if (typeof prices !== 'object' || Array.isArray(prices)) return [];
    return Object.entries(prices).map(([sym, val]) => {
      const isJPY = sym.includes('JPY');
      const isIndex = ['US500','NAS100','US30'].includes(sym);
      const isMetal = sym === 'XAUUSD';
      const decimals = isJPY ? 3 : isIndex ? 2 : isMetal ? 2 : 5;
      const display = sym.length === 6 && !isIndex && !isMetal
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
    console.error('Error fetching prices:', error);
    return [];
  }
}

export async function fetchScreener() {
  try {
    const response = await fetch(`${API_BASE}/api/screener`);
    if (!response.ok) throw new Error('Failed to fetch screener');
    return await response.json();
  } catch (error) {
    console.error('Error fetching screener:', error);
    return [];
  }
}

export async function fetchBotStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/bot/status`);
    if (!response.ok) throw new Error('Failed to fetch bot status');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bot status:', error);
    return null;
  }
}