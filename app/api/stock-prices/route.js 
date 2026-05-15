// app/api/stock-prices/route.js
// Fetches live (15-min delayed) US stock quotes from Finnhub.
// Runs server-side — the API key never reaches the browser.
// Returns clean JSON: [{ symbol, price, change, changePercent }, ...]

import { NextResponse } from 'next/server';

const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'];

// Simple in-memory cache to stay well under Finnhub's 60 calls/min free-tier limit.
// Stocks don't tick like crypto — 30-second freshness is more than enough.
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 30_000;

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'FINNHUB_API_KEY not configured' },
      { status: 500 }
    );
  }

  // Return cached response if still fresh
  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ stocks: cache.data, cached: true });
  }

  try {
    // Fetch all 7 tickers in parallel
    const fetches = STOCK_SYMBOLS.map(async (symbol) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return null;
        const q = await res.json();
        // Finnhub /quote returns: { c: current, d: change, dp: percentChange, h, l, o, pc, t }
        // If price is 0 or missing, the ticker is invalid or the API is rate-limited
        if (!q.c || q.c === 0) return null;
        return {
          symbol,
          price: q.c,
          change: q.d ?? 0,
          changePercent: q.dp ?? 0,
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(fetches);
    const stocks = results.filter(Boolean);

    cache = { data: stocks, timestamp: now };

    return NextResponse.json({ stocks, cached: false });
  } catch (error) {
    console.error('Finnhub stock-prices error:', error);
    // If everything fails but we have stale cache, return it as a fallback
    if (cache.data) {
      return NextResponse.json({ stocks: cache.data, cached: true, stale: true });
    }
    return NextResponse.json({ error: error.message, stocks: [] }, { status: 500 });
  }
}