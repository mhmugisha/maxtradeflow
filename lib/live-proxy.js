// lib/live-proxy.js — server-side caching proxy for the bot API (A0-7).
//
// Route handlers under /api/live/* call proxyBot() so the browser polls our
// own origin (CDN-cached, same-origin, no CORS) instead of Railway directly.
// Responses carry s-maxage=5 / stale-while-revalidate=60: the Vercel edge
// serves a cached copy for 5s and a stale copy for up to 60s while it
// refreshes in the background, collapsing many client polls into ~1 bot hit.

const BOT_BASE =
  process.env.NEXT_PUBLIC_BOT_API_BASE ||
  'https://smart-asset-bot-production.up.railway.app';

const CACHE_CONTROL = 'public, s-maxage=5, stale-while-revalidate=60';

/**
 * Proxy a GET request to the bot and return its JSON with edge-cache headers.
 * On any upstream failure, logs the failing URL (no silent failures, §0.5) and
 * returns 502 with no-store so errors are never cached.
 */
export async function proxyBot(path) {
  const url = `${BOT_BASE}${path}`;
  try {
    const upstream = await fetch(url, { cache: 'no-store' });
    if (!upstream.ok) {
      throw new Error(`HTTP ${upstream.status} ${upstream.statusText}`);
    }
    const data = await upstream.json();
    return Response.json(data, { headers: { 'Cache-Control': CACHE_CONTROL } });
  } catch (error) {
    console.error(`[live-proxy] upstream fetch failed (${url}):`, error?.message || error);
    return Response.json(
      { error: 'upstream_unavailable' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
