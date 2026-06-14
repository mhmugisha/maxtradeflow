import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// When an article is marked dead, advance the matching signals.status by
// POSTing to the guarded /api/signal-event endpoint (reuses its terminal-state
// guard and STATUS_FOR_EVENT logic — we never write `signals` directly here).
const REASON_TO_EVENT = {
  STOPPED: 'SL_HIT',
  FILLED: 'TP_HIT',
  INVALIDATED: 'INVALIDATED',
  EXPIRED: 'EXPIRED',
};

async function bridgeToSignalEvent(origin, signal_uid, reason) {
  if (!signal_uid) return;
  const event_type = REASON_TO_EVENT[reason];
  if (!event_type) return;
  try {
    const res = await fetch(`${origin}/api/signal-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PUBLISH_SECRET}`,
      },
      body: JSON.stringify({
        signal_uid,
        event_type,
        occurred_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        `[check-invalidations] signal-event ${event_type} failed for ${signal_uid}: ${res.status} ${text}`
      );
    }
  } catch (err) {
    console.error(
      `[check-invalidations] signal-event POST error for ${signal_uid}:`,
      err?.message || err
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer ' + process.env.CHECK_INVALIDATIONS_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.prices || typeof body.prices !== 'object') {
      return NextResponse.json({ error: 'Missing required field: prices' }, { status: 400 });
    }

    const { prices } = body;
    const sql = neon(process.env.NEON_DATABASE_URL);

    const [activeSignals, expiredSignals] = await Promise.all([
      sql`
        SELECT id, ticker, direction, entry_price, stop_loss, take_profit, created_at, signal_uid
        FROM articles
        WHERE category = 'signal'
          AND published = true
          AND (is_valid IS NULL OR is_valid = true)
          AND created_at > NOW() - INTERVAL '24 hours'
      `,
      sql`
        SELECT id, signal_uid FROM articles
        WHERE category = 'signal'
          AND published = true
          AND (is_valid IS NULL OR is_valid = true)
          AND created_at <= NOW() - INTERVAL '24 hours'
      `,
    ]);

    const origin = new URL(request.url).origin;

    console.log(
      `[check-invalidations] Received ${Object.keys(prices).length} prices, checking ${activeSignals.length} active signals, ${expiredSignals.length} expired`
    );

    const matches = [];

    for (const signal of activeSignals) {
      const currentPrice = prices[signal.ticker]?.mid;
      if (!currentPrice) continue;

      const entry = parseFloat(signal.entry_price);
      const sl = parseFloat(signal.stop_loss);
      const tp = parseFloat(signal.take_profit);
      const direction = signal.direction;

      if (!entry || !sl || !tp || isNaN(entry) || isNaN(sl) || isNaN(tp)) continue;

      let invalidationReason = null;

      if (direction === 'LONG') {
        const halfway = entry + (tp - entry) / 2;
        if (currentPrice <= sl) invalidationReason = 'STOPPED';
        else if (currentPrice >= tp) invalidationReason = 'FILLED';
        else if (currentPrice >= halfway) invalidationReason = 'INVALIDATED';
      } else if (direction === 'SHORT') {
        const halfway = entry - (entry - tp) / 2;
        if (currentPrice >= sl) invalidationReason = 'STOPPED';
        else if (currentPrice <= tp) invalidationReason = 'FILLED';
        else if (currentPrice <= halfway) invalidationReason = 'INVALIDATED';
      }

      if (invalidationReason) {
        matches.push({ id: signal.id, reason: invalidationReason, signal_uid: signal.signal_uid });
      }
    }

    const breakdown = { STOPPED: 0, FILLED: 0, INVALIDATED: 0, EXPIRED: 0 };

    for (const reason of ['STOPPED', 'FILLED', 'INVALIDATED']) {
      const batch = matches.filter((m) => m.reason === reason);
      const ids = batch.map((m) => m.id);
      if (ids.length > 0) {
        await sql`
          UPDATE articles
          SET is_valid = false,
              invalidated_at = NOW(),
              invalidation_reason = ${reason}
          WHERE id = ANY(${ids})
        `;
        breakdown[reason] = ids.length;
        // Fan-out to signal-event so signals.status advances under its guard.
        for (const m of batch) {
          await bridgeToSignalEvent(origin, m.signal_uid, reason);
        }
      }
    }

    const expiredIds = expiredSignals.map((s) => s.id);
    if (expiredIds.length > 0) {
      await sql`
        UPDATE articles
        SET is_valid = false,
            invalidated_at = NOW(),
            invalidation_reason = 'EXPIRED'
        WHERE id = ANY(${expiredIds})
      `;
      breakdown.EXPIRED = expiredIds.length;
      for (const s of expiredSignals) {
        await bridgeToSignalEvent(origin, s.signal_uid, 'EXPIRED');
      }
    }

    const result = {
      checked: activeSignals.length,
      invalidated: matches.length + expiredIds.length,
      breakdown,
    };

    console.log(
      `[check-invalidations] Result: ${result.invalidated}/${result.checked} invalidated`,
      result.breakdown
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[check-invalidations] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
