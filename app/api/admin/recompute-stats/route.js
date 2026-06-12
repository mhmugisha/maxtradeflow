import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/signal-auth';
import { recomputeAllStats } from '@/lib/stats';

// Manual stats recompute (Phase A Session 1 Task 1). Same Bearer-auth pattern
// as publish-signal/signal-event. Recomputes instrument_stats for every
// instrument with ≥1 closed signal, plus platform_stats.
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { instruments, platform } = await recomputeAllStats();
    return NextResponse.json({
      success: true,
      recomputed: instruments.length,
      instruments,
      platform,
    });
  } catch (error) {
    console.error('[recompute-stats] failed:', error?.message || error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
