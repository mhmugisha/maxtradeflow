import { proxyBot } from '@/lib/live-proxy';

// Caching proxy for live prices (A0-7). Edge-cached via proxyBot headers.
export const dynamic = 'force-dynamic';

export async function GET() {
  return proxyBot('/api/ctrader/prices');
}
