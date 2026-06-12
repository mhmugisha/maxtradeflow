import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isAuthorized } from '@/lib/signal-auth';
import { recomputeStatsForInstrument } from '@/lib/stats';

function getDb() {
  return neon(process.env.NEON_DATABASE_URL);
}

// §6 contract: append-only lifecycle events. INVALIDATED carries a reason.
const EVENT_TYPES = ['GENERATED', 'TRIGGERED', 'TP_HIT', 'SL_HIT', 'EXPIRED', 'INVALIDATED'];

// Denormalized signals.status the event advances to (the only allowed UPDATE on
// signals, per §0.3). TRIGGERED → ACTIVE. Terminal states are guarded below so
// a closed signal is never reopened (also enforces §0.4 conservative bias: a
// later TP_HIT cannot overwrite an SL_HIT that was recorded first).
const STATUS_FOR_EVENT = {
  GENERATED: 'GENERATED',
  TRIGGERED: 'ACTIVE',
  TP_HIT: 'TP_HIT',
  SL_HIT: 'SL_HIT',
  EXPIRED: 'EXPIRED',
  INVALIDATED: 'INVALIDATED',
};
const OUTCOME_FOR_EVENT = { TP_HIT: 'WIN', SL_HIT: 'LOSS' };

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { signal_uid, event_type, price, occurred_at, reason } = await request.json();

    if (!signal_uid || !event_type || !occurred_at) {
      return NextResponse.json(
        { error: 'signal_uid, event_type and occurred_at are required' },
        { status: 400 }
      );
    }
    if (!EVENT_TYPES.includes(event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type. Must be one of: ${EVENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const sql = getDb();

    // The signal must exist (clear 404 rather than a FK error).
    const found = await sql`SELECT ticker FROM signals WHERE signal_uid = ${signal_uid} LIMIT 1`;
    if (found.length === 0) {
      return NextResponse.json({ error: 'Unknown signal_uid' }, { status: 404 });
    }
    const ticker = found[0].ticker;

    // Append-only, idempotent on (signal_uid, event_type).
    const inserted = await sql`
      INSERT INTO signal_events (signal_uid, event_type, price, occurred_at, reason)
      VALUES (${signal_uid}, ${event_type}, ${price ?? null}, ${occurred_at}, ${reason ?? null})
      ON CONFLICT (signal_uid, event_type) DO NOTHING
      RETURNING id
    `;
    const wasNew = inserted.length > 0;

    // Advance denormalized status, but never reopen a closed signal.
    const newStatus = STATUS_FOR_EVENT[event_type];
    const outcome = OUTCOME_FOR_EVENT[event_type] ?? null;
    await sql`
      UPDATE signals
      SET status = ${newStatus},
          outcome = COALESCE(${outcome}, outcome)
      WHERE signal_uid = ${signal_uid}
        AND status NOT IN ('TP_HIT', 'SL_HIT', 'EXPIRED', 'INVALIDATED')
    `;

    // A closing event changes the rolling last-30 window — recompute stats for
    // this instrument + platform. Failure here must not lose the event (it is
    // already recorded), so it is logged and surfaced in the response rather
    // than failing the request (§0.5: no silent failures).
    let stats = 'skipped';
    if (wasNew && (event_type === 'TP_HIT' || event_type === 'SL_HIT')) {
      try {
        await recomputeStatsForInstrument(ticker);
        stats = 'recomputed';
      } catch (statsError) {
        console.error(`[signal-event] stats recompute failed (${ticker}):`, statsError?.message || statsError);
        stats = 'failed';
      }
    }

    return NextResponse.json({ success: true, signal_uid, event_type, idempotent: !wasNew, stats });
  } catch (error) {
    console.error('Signal event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
