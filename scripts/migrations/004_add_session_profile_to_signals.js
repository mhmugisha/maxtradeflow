/**
 * Migration 004 — add signals.session_profile.
 *
 * The Smart Asset Bot v2 publish-signal payload now carries a
 * `session_profile` field identifying which session profile produced the
 * signal: 'london' | 'new_york' | 'asian' | 'crypto', or 'all' for the
 * legacy multi-session bot. We capture it on the signals row.
 *
 * Design notes:
 *   - DEFAULT 'all' so existing rows backfill to a sensible value (the
 *     pre-profile bot effectively ran "all sessions") instead of NULL.
 *   - No CHECK constraint. We expect to add more profiles over time and
 *     do NOT want a constraint blocking ingestion if the bot sends a new
 *     value before this column is updated. A loose VARCHAR is fine here.
 *
 * SAFETY:
 *   - DRY RUN BY DEFAULT. Run with no flags (or --dry-run) for a read-only
 *     preview. Pass --apply to actually write.
 *   - The ALTER is idempotent (ADD COLUMN IF NOT EXISTS).
 *
 * Usage:
 *   node scripts/migrations/004_add_session_profile_to_signals.js          # dry run
 *   node scripts/migrations/004_add_session_profile_to_signals.js --apply  # execute
 */

const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');

const DDL = [
  {
    label: "ALTER TABLE signals ADD COLUMN session_profile VARCHAR(20) DEFAULT 'all'",
    sql: `ALTER TABLE signals
            ADD COLUMN IF NOT EXISTS session_profile VARCHAR(20) DEFAULT 'all';`,
  },
];

async function columnExists(sql, table, column) {
  const r = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table}
      AND column_name = ${column} LIMIT 1`;
  return r.length > 0;
}

async function run() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    console.error('Error: NEON_DATABASE_URL is not set. Check .env.local.');
    process.exit(1);
  }

  const sql = neon(url);

  const banner = APPLY ? 'APPLY (writes enabled)' : 'DRY RUN (read-only — no changes)';
  console.log('═'.repeat(70));
  console.log(`Migration 004 — add signals.session_profile  ·  MODE: ${banner}`);
  console.log('═'.repeat(70));

  const exists = await columnExists(sql, 'signals', 'session_profile');
  console.log(`\nsignals.session_profile  ${exists ? 'EXISTS  → skip (IF NOT EXISTS)' : 'missing → ADD COLUMN'}`);

  const totalRow = await sql`SELECT COUNT(*)::int AS n FROM signals`;
  console.log(`\nExisting signals rows: ${totalRow[0].n}`);
  console.log("  These will pick up DEFAULT 'all' for session_profile.");

  console.log('\nDDL that would run:');
  DDL.forEach((d, i) => console.log(`  ${String(i + 1).padStart(2)}. ${d.label}`));

  if (!APPLY) {
    console.log('\n' + '─'.repeat(70));
    console.log('DRY RUN complete. No changes were written.');
    console.log('Review the above, then re-run with --apply to execute.');
    console.log('─'.repeat(70));
    return;
  }

  console.log('\nApplying DDL...');
  for (const d of DDL) {
    await sql.query(d.sql);
    console.log(`  ✓ ${d.label}`);
  }

  const verify = await sql`
    SELECT session_profile, COUNT(*)::int AS n
    FROM signals
    GROUP BY session_profile
    ORDER BY session_profile NULLS LAST`;
  console.log('\nVerification — signals by session_profile:');
  for (const r of verify) {
    console.log(`  ${String(r.session_profile ?? '(null)').padEnd(14)} ${r.n}`);
  }

  console.log('\nMigration 004 complete.');
}

run().catch((err) => {
  console.error('Migration 004 failed:', err.message);
  process.exit(1);
});
