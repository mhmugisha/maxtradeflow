// scripts/stats-dry-run.mjs — READ-ONLY preview of the stats recompute job.
//
// Runs the exact computation lib/stats.js would persist (last 30 CLOSED
// signals — TP_HIT/SL_HIT only — per instrument and platform-wide) against the
// real database and prints what it WOULD write to instrument_stats /
// platform_stats. Performs no writes of any kind.
//
// Usage: node scripts/stats-dry-run.mjs

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { computeClosedStats } from '../lib/stats.js';

dotenv.config({ path: '.env.local' });

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  console.error('Error: NEON_DATABASE_URL is not set. Check .env.local.');
  process.exit(1);
}
const sql = neon(url);

const fmt = (v, suffix = '') => (v === null || v === undefined ? '—' : `${v}${suffix}`);

function printRow(label, s) {
  console.log(
    `  ${label.padEnd(10)} ` +
    `n=${String(s.sample_size).padEnd(4)} ` +
    `win_rate=${fmt(s.win_rate, '%').padEnd(8)} ` +
    `avg_rr=${fmt(s.avg_realized_rr).padEnd(7)} ` +
    `net_r=${fmt(s.net_r).padEnd(8)} ` +
    `avg_hold=${fmt(s.avg_hold_minutes, 'm').padEnd(10)} ` +
    `(wins=${s.wins}, hold_n=${s.hold_sample}, rr_excluded=${s.rr_excluded})`
  );
}

console.log('═'.repeat(78));
console.log('Stats recompute — DRY RUN (read-only, no writes)');
console.log('Window: last 30 CLOSED signals (TP_HIT/SL_HIT only), ordered by close event');
console.log('═'.repeat(78));

// Context: how many signals exist per status, so a small/empty sample is
// explainable rather than mysterious.
const byStatus = await sql.query(
  `SELECT status, COUNT(*)::int AS n FROM signals GROUP BY status ORDER BY status`
);
console.log('\nSignals by status (entire table):');
for (const r of byStatus) console.log(`  ${r.status.padEnd(14)} ${r.n}`);

const tickers = await sql.query(
  `SELECT DISTINCT ticker FROM signals WHERE status IN ('TP_HIT','SL_HIT') ORDER BY ticker`
);

console.log(`\nInstruments with ≥1 closed signal: ${tickers.length}`);
console.log('\nWhat WOULD be written:');

console.log('\nplatform_stats:');
const platform = await computeClosedStats(sql, null);
printRow('(platform)', platform);

console.log('\ninstrument_stats:');
if (tickers.length === 0) {
  console.log('  (none — no instrument has a closed signal yet)');
}
for (const { ticker } of tickers) {
  const s = await computeClosedStats(sql, ticker);
  printRow(ticker, s);
}

console.log('\n' + '─'.repeat(78));
console.log('DRY RUN complete. Nothing was written.');
console.log('Live recompute paths: /api/signal-event (on TP_HIT/SL_HIT) and');
console.log('POST /api/admin/recompute-stats (Bearer auth).');
console.log('─'.repeat(78));
