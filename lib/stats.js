// lib/stats.js — rolling last-30-closed stats (EXECUTION_PLAN.md A0-5 / Phase A
// Session 1 Task 1).
//
// Maintains instrument_stats and platform_stats from CLOSED signals only
// (status TP_HIT or SL_HIT — EXPIRED/INVALIDATED never count). Over the most
// recent 30 closures (fewer if fewer exist — sample_size is always the true
// count, never padded):
//
//   win_rate          percent 0–100, wins / sample_size
//   avg_realized_rr   mean realized R, where TP_HIT = +rr_ratio, SL_HIT = −1.
//                     A TP with no recorded rr_ratio is excluded from the R
//                     aggregates (counted in rr_excluded) rather than guessed.
//   avg_hold_minutes  mean TRIGGERED→close duration from signal_events; only
//                     signals that have a TRIGGERED event contribute
//                     (hold_sample is the true count of contributors)
//   net_r             sum of realized R over the window
//   sample_size       true number of closed signals found (≤ 30)
//
// "Closed" is defined by the closing signal_events row, and its occurred_at
// orders the window. If a signal somehow carries both TP_HIT and SL_HIT events
// the SL is used (§0.4 conservative bias — never err in our own favor).
//
// computeClosedStats() is pure/read-only so the dry-run script can preview
// without writing; recompute*() functions persist via upsert.

import { neon } from '@neondatabase/serverless';

function getDb() {
  return neon(process.env.NEON_DATABASE_URL);
}

// One closed signal per row: the closing event (SL preferred on conflict),
// plus the TRIGGERED timestamp when one exists. $1 = ticker or NULL for
// platform-wide.
const CLOSED_WINDOW_SQL = `
  SELECT s.signal_uid,
         s.ticker,
         s.rr_ratio::float8        AS rr_ratio,
         close_ev.event_type       AS close_type,
         close_ev.occurred_at      AS closed_at,
         trig.occurred_at          AS triggered_at
  FROM signals s
  JOIN LATERAL (
    SELECT event_type, occurred_at
    FROM signal_events
    WHERE signal_uid = s.signal_uid
      AND event_type IN ('TP_HIT', 'SL_HIT')
    ORDER BY CASE event_type WHEN 'SL_HIT' THEN 0 ELSE 1 END
    LIMIT 1
  ) close_ev ON TRUE
  LEFT JOIN signal_events trig
    ON trig.signal_uid = s.signal_uid AND trig.event_type = 'TRIGGERED'
  WHERE s.status IN ('TP_HIT', 'SL_HIT')
    AND ($1::text IS NULL OR s.ticker = $1)
  ORDER BY close_ev.occurred_at DESC
  LIMIT 30
`;

/**
 * Read-only: compute the rolling window for one instrument (or platform-wide
 * when instrument is null). Returns the stats row that WOULD be stored.
 * Accepts the sql client so callers (routes, dry-run script) control the
 * connection.
 */
export async function computeClosedStats(sql, instrument = null) {
  const rows = await sql.query(CLOSED_WINDOW_SQL, [instrument]);

  const sampleSize = rows.length;
  let wins = 0;
  let netR = 0;
  let rCount = 0;       // signals contributing to R aggregates
  let rrExcluded = 0;   // TPs with no rr_ratio — excluded, never guessed
  let holdSum = 0;
  let holdCount = 0;

  for (const row of rows) {
    const won = row.close_type === 'TP_HIT';
    if (won) wins++;

    if (won) {
      if (Number.isFinite(row.rr_ratio)) {
        netR += row.rr_ratio;
        rCount++;
      } else {
        rrExcluded++;
      }
    } else {
      netR += -1;
      rCount++;
    }

    if (row.triggered_at) {
      const mins = (new Date(row.closed_at) - new Date(row.triggered_at)) / 60000;
      if (Number.isFinite(mins) && mins >= 0) {
        holdSum += mins;
        holdCount++;
      }
    }
  }

  const round2 = (n) => Math.round(n * 100) / 100;
  return {
    instrument,
    win_rate: sampleSize > 0 ? round2((wins / sampleSize) * 100) : null,
    avg_realized_rr: rCount > 0 ? round2(netR / rCount) : null,
    avg_hold_minutes: holdCount > 0 ? round2(holdSum / holdCount) : null,
    net_r: rCount > 0 ? round2(netR) : null,
    sample_size: sampleSize,
    // Diagnostics (not stored — surfaced by the dry-run / admin response):
    wins,
    hold_sample: holdCount,
    rr_excluded: rrExcluded,
  };
}

async function upsertInstrumentStats(sql, stats) {
  await sql.query(
    `INSERT INTO instrument_stats
       (instrument, win_rate, avg_realized_rr, avg_hold_minutes, net_r, sample_size, computed_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (instrument) DO UPDATE SET
       win_rate = EXCLUDED.win_rate,
       avg_realized_rr = EXCLUDED.avg_realized_rr,
       avg_hold_minutes = EXCLUDED.avg_hold_minutes,
       net_r = EXCLUDED.net_r,
       sample_size = EXCLUDED.sample_size,
       computed_at = EXCLUDED.computed_at`,
    [stats.instrument, stats.win_rate, stats.avg_realized_rr,
     stats.avg_hold_minutes, stats.net_r, stats.sample_size]
  );
}

async function upsertPlatformStats(sql, stats) {
  await sql.query(
    `INSERT INTO platform_stats
       (id, win_rate, avg_realized_rr, avg_hold_minutes, net_r, sample_size, computed_at)
     VALUES (1, $1, $2, $3, $4, $5, NOW())
     ON CONFLICT (id) DO UPDATE SET
       win_rate = EXCLUDED.win_rate,
       avg_realized_rr = EXCLUDED.avg_realized_rr,
       avg_hold_minutes = EXCLUDED.avg_hold_minutes,
       net_r = EXCLUDED.net_r,
       sample_size = EXCLUDED.sample_size,
       computed_at = EXCLUDED.computed_at`,
    [stats.win_rate, stats.avg_realized_rr, stats.avg_hold_minutes,
     stats.net_r, stats.sample_size]
  );
}

/**
 * Recompute and persist stats for one instrument plus platform-wide.
 * Called from /api/signal-event after a closing event (TP_HIT/SL_HIT).
 */
export async function recomputeStatsForInstrument(ticker) {
  const sql = getDb();
  const instrument = await computeClosedStats(sql, ticker);
  const platform = await computeClosedStats(sql, null);
  await upsertInstrumentStats(sql, instrument);
  await upsertPlatformStats(sql, platform);
  return { instrument, platform };
}

/**
 * Recompute and persist stats for every instrument that has at least one
 * closed signal, plus platform-wide. Used by /api/admin/recompute-stats.
 */
export async function recomputeAllStats() {
  const sql = getDb();
  const tickers = await sql.query(
    `SELECT DISTINCT ticker FROM signals WHERE status IN ('TP_HIT', 'SL_HIT') ORDER BY ticker`
  );

  const instruments = [];
  for (const { ticker } of tickers) {
    const stats = await computeClosedStats(sql, ticker);
    await upsertInstrumentStats(sql, stats);
    instruments.push(stats);
  }

  const platform = await computeClosedStats(sql, null);
  await upsertPlatformStats(sql, platform);
  return { instruments, platform };
}
