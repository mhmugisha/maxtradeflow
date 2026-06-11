import { proxyBot } from '@/lib/live-proxy';

// Caching proxy for Market Pulse (A0-7). The bot's pulse endpoint ships with
// A0-6; until then this returns 502 (logged, never cached). Upstream path is
// overridable via BOT_PULSE_PATH so it can be wired up without a code change.
export const dynamic = 'force-dynamic';

export async function GET() {
  return proxyBot(process.env.BOT_PULSE_PATH || '/api/market-pulse');
}
