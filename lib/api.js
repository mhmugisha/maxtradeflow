const API_BASE = 'https://smart-asset-bot-production.up.railway.app';

export async function fetchPrices() {
  try {
    const response = await fetch(`${API_BASE}/api/ctrader/prices`);
    if (!response.ok) throw new Error('Failed to fetch prices');
    return await response.json();
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