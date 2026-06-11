/**
 * Migration 003 — v2 signals data foundation (EXECUTION_PLAN.md A0-3 / §6).
 *
 * Creates the v2 schema and backfills historical signal articles:
 *   - signals            immutable signal records (payload-v2 fields)
 *   - signal_events      append-only lifecycle log, unique (signal_uid, event_type)
 *   - price_snapshots    1h OHLC bars per instrument
 *   - instrument_stats   rolling last-30-closed aggregates per instrument
 *   - platform_stats     rolling last-30-closed aggregates, platform-wide
 *   - market_pulse        latest computed pulse values + formulas version
 *   - articles.signal_uid FK → signals(signal_uid)
 *   - backfill: every category='signal' article → a signals row
 *       status: is_valid=false → INVALIDATED (reason from invalidation_reason),
 *               otherwise       → EXPIRED
 *       outcome: NULL (historical TP/SL outcomes are unknown — never fabricated)
 *       generated_at: the article's created_at (real timestamp, not invented)
 *
 * SAFETY:
 *   - DRY RUN BY DEFAULT. Run with no flags (or --dry-run) for a read-only
 *     preview. Pass --apply to actually write.
 *   - All DDL is idempotent (IF NOT EXISTS / catalog guards). The backfill only
 *     touches articles whose signal_uid IS NULL, so it is safe to re-run.
 *   - BACK UP FIRST before --apply (e.g. pg_dump of the Neon branch, or take a
 *     Neon point-in-time branch).
 *
 * Usage:
 *   node scripts/migrations/003_v2_signals_schema.js            # dry run
 *   node scripts/migrations/003_v2_signals_schema.js --apply    # execute
 */

const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');

// ── DDL statements (each is a single, idempotent statement) ──────────────────
const DDL = [
  {
    label: 'CREATE TABLE signals',
    sql: `
      CREATE TABLE IF NOT EXISTS signals (
        signal_uid        UUID PRIMARY KEY,
        schema_version    INTEGER NOT NULL DEFAULT 2,
        ticker            VARCHAR(20) NOT NULL,
        asset_class       VARCHAR(20),
        direction         VARCHAR(10) NOT NULL,
        entry_price       NUMERIC,
        stop_loss         NUMERIC,
        take_profit       NUMERIC,
        rr_ratio          NUMERIC,
        score             INTEGER,
        tradeflow_score   INTEGER,
        tfs_version       INTEGER,
        confidence        INTEGER,
        adx               NUMERIC,
        rsi               NUMERIC,
        entry_mode        VARCHAR(20),
        sl_reason         TEXT,
        reasons           JSONB,
        market_condition  VARCHAR(20),
        session           VARCHAR(20),
        expected_duration VARCHAR(20),
        generated_at      TIMESTAMPTZ,
        status            VARCHAR(20) NOT NULL DEFAULT 'GENERATED',
        outcome           VARCHAR(10),
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT signals_status_chk CHECK (status IN
          ('GENERATED','TRIGGERED','ACTIVE','TP_HIT','SL_HIT','EXPIRED','INVALIDATED')),
        CONSTRAINT signals_outcome_chk CHECK (outcome IS NULL OR outcome IN ('WIN','LOSS'))
      );`,
  },
  {
    label: 'CREATE TABLE signal_events',
    sql: `
      CREATE TABLE IF NOT EXISTS signal_events (
        id          BIGSERIAL PRIMARY KEY,
        signal_uid  UUID NOT NULL REFERENCES signals(signal_uid),
        event_type  VARCHAR(20) NOT NULL,
        price       NUMERIC,
        occurred_at TIMESTAMPTZ NOT NULL,
        reason      TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT signal_events_type_chk CHECK (event_type IN
          ('GENERATED','TRIGGERED','TP_HIT','SL_HIT','EXPIRED','INVALIDATED')),
        CONSTRAINT signal_events_uniq UNIQUE (signal_uid, event_type)
      );`,
  },
  {
    label: 'CREATE INDEX signal_events(signal_uid)',
    sql: `CREATE INDEX IF NOT EXISTS idx_signal_events_signal_uid
            ON signal_events (signal_uid);`,
  },
  {
    label: 'CREATE TABLE price_snapshots',
    sql: `
      CREATE TABLE IF NOT EXISTS price_snapshots (
        id         BIGSERIAL PRIMARY KEY,
        instrument VARCHAR(20) NOT NULL,
        ts         TIMESTAMPTZ NOT NULL,
        open       NUMERIC,
        high       NUMERIC,
        low        NUMERIC,
        close      NUMERIC,
        CONSTRAINT price_snapshots_uniq UNIQUE (instrument, ts)
      );`,
  },
  {
    label: 'CREATE INDEX price_snapshots(instrument, ts DESC)',
    sql: `CREATE INDEX IF NOT EXISTS idx_price_snapshots_instrument_ts
            ON price_snapshots (instrument, ts DESC);`,
  },
  {
    label: 'CREATE TABLE instrument_stats',
    sql: `
      CREATE TABLE IF NOT EXISTS instrument_stats (
        instrument       VARCHAR(20) PRIMARY KEY,
        win_rate         NUMERIC,
        avg_realized_rr  NUMERIC,
        avg_hold_minutes NUMERIC,
        net_r            NUMERIC,
        sample_size      INTEGER NOT NULL DEFAULT 0,
        computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );`,
  },
  {
    label: 'CREATE TABLE platform_stats',
    sql: `
      CREATE TABLE IF NOT EXISTS platform_stats (
        id               INTEGER PRIMARY KEY DEFAULT 1,
        win_rate         NUMERIC,
        avg_realized_rr  NUMERIC,
        avg_hold_minutes NUMERIC,
        net_r            NUMERIC,
        sample_size      INTEGER NOT NULL DEFAULT 0,
        computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT platform_stats_singleton CHECK (id = 1)
      );`,
  },
  {
    label: 'CREATE TABLE market_pulse',
    sql: `
      CREATE TABLE IF NOT EXISTS market_pulse (
        id                  INTEGER PRIMARY KEY DEFAULT 1,
        dollar_strength     NUMERIC,
        gold_sentiment      VARCHAR(20),
        volatility_regime   VARCHAR(20),
        risk_environment    VARCHAR(20),
        active_signal_count INTEGER,
        formulas_version    INTEGER NOT NULL DEFAULT 1,
        computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT market_pulse_singleton CHECK (id = 1)
      );`,
  },
  {
    label: 'ALTER TABLE articles ADD COLUMN signal_uid',
    sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS signal_uid UUID;`,
  },
  {
    label: 'ALTER TABLE articles ADD CONSTRAINT articles_signal_uid_fkey',
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'articles_signal_uid_fkey'
        ) THEN
          ALTER TABLE articles
            ADD CONSTRAINT articles_signal_uid_fkey
            FOREIGN KEY (signal_uid) REFERENCES signals (signal_uid);
        END IF;
      END $$;`,
  },
  {
    label: 'CREATE INDEX articles(signal_uid)',
    sql: `CREATE INDEX IF NOT EXISTS idx_articles_signal_uid
            ON articles (signal_uid);`,
  },
];

function projectStatus(article) {
  if (article.is_valid === false) return 'INVALIDATED';
  return 'EXPIRED';
}

async function tableExists(sql, name) {
  const r = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${name} LIMIT 1`;
  return r.length > 0;
}

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

  const { getInstrument } = await import('../../lib/instruments.js');
  const sql = neon(url);

  const banner = APPLY ? 'APPLY (writes enabled)' : 'DRY RUN (read-only — no changes)';
  console.log('═'.repeat(70));
  console.log(`Migration 003 — v2 signals schema  ·  MODE: ${banner}`);
  console.log('═'.repeat(70));

  // ── Preview: which objects already exist ──────────────────────────────────
  const targetTables = [
    'signals', 'signal_events', 'price_snapshots',
    'instrument_stats', 'platform_stats', 'market_pulse',
  ];
  console.log('\nTarget tables (exists? → action):');
  for (const t of targetTables) {
    const exists = await tableExists(sql, t);
    console.log(`  ${t.padEnd(18)} ${exists ? 'EXISTS  → skip (IF NOT EXISTS)' : 'missing → CREATE'}`);
  }
  const hasSignalUid = await columnExists(sql, 'articles', 'signal_uid');
  console.log(`  ${'articles.signal_uid'.padEnd(18)} ${hasSignalUid ? 'EXISTS  → skip' : 'missing → ADD COLUMN + FK'}`);

  // ── Preview: backfill scope ──────────────────────────────────────────────
  const totalRow = await sql`SELECT COUNT(*)::int AS n FROM articles WHERE category = 'signal'`;
  const total = totalRow[0].n;

  // Already-migrated count only computable if the column exists.
  let already = 0;
  if (hasSignalUid) {
    const m = await sql`
      SELECT COUNT(*)::int AS n FROM articles
      WHERE category = 'signal' AND signal_uid IS NOT NULL`;
    already = m[0].n;
  }
  const pending = total - already;

  const breakdown = await sql`
    SELECT
      COUNT(*) FILTER (WHERE is_valid = false)               ::int AS invalidated,
      COUNT(*) FILTER (WHERE is_valid IS DISTINCT FROM false)::int AS expired
    FROM articles WHERE category = 'signal'`;

  console.log('\nBackfill scope (category = \'signal\'):');
  console.log(`  total signal articles      ${total}`);
  console.log(`  already migrated           ${already}`);
  console.log(`  to migrate this run        ${pending}`);
  console.log('  projected status mapping (over all signal articles):');
  console.log(`    is_valid = false   → INVALIDATED   ${breakdown[0].invalidated}`);
  console.log(`    otherwise          → EXPIRED       ${breakdown[0].expired}`);
  console.log('    outcome            → NULL (historical outcomes unknown)');

  // Sample of rows that would be migrated.
  const sampleSrc = hasSignalUid
    ? await sql`
        SELECT ticker, direction, score, entry_price, is_valid, invalidation_reason, created_at
        FROM articles WHERE category = 'signal' AND signal_uid IS NULL
        ORDER BY created_at DESC LIMIT 5`
    : await sql`
        SELECT ticker, direction, score, entry_price, is_valid, invalidation_reason, created_at
        FROM articles WHERE category = 'signal'
        ORDER BY created_at DESC LIMIT 5`;

  console.log('\nSample of rows to migrate (newest 5):');
  console.log('  ticker   dir    score  asset_class   → status        generated_at');
  console.log('  ' + '─'.repeat(70));
  for (const a of sampleSrc) {
    const ac = getInstrument(a.ticker)?.assetClass || '(unknown)';
    const st = projectStatus(a);
    const gen = a.created_at ? new Date(a.created_at).toISOString().slice(0, 16) : '—';
    console.log(
      `  ${String(a.ticker || '').padEnd(8)} ${String(a.direction || '').padEnd(6)} ` +
      `${String(a.score ?? '—').padEnd(6)} ${ac.padEnd(13)} → ${st.padEnd(13)} ${gen}`
    );
  }

  console.log('\nDDL that would run:');
  DDL.forEach((d, i) => console.log(`  ${String(i + 1).padStart(2)}. ${d.label}`));

  if (!APPLY) {
    console.log('\n' + '─'.repeat(70));
    console.log('DRY RUN complete. No changes were written.');
    console.log('Review the above, then re-run with --apply to execute.');
    console.log('Reminder: back up the Neon branch before applying.');
    console.log('─'.repeat(70));
    return;
  }

  // ── APPLY ─────────────────────────────────────────────────────────────────
  console.log('\nApplying DDL...');
  for (const d of DDL) {
    await sql.query(d.sql);
    console.log(`  ✓ ${d.label}`);
  }

  console.log('\nBackfilling signals from signal articles...');
  const pendingRows = await sql`
    SELECT id, ticker, direction, score, adx, rsi, entry_mode,
           entry_price, stop_loss, take_profit, rr_ratio,
           is_valid, invalidation_reason, created_at
    FROM articles
    WHERE category = 'signal' AND signal_uid IS NULL
    ORDER BY created_at ASC`;

  let migrated = 0;
  for (const a of pendingRows) {
    const uid = crypto.randomUUID();
    const assetClass = getInstrument(a.ticker)?.assetClass || null;
    const status = projectStatus(a);
    const reason = status === 'INVALIDATED' ? (a.invalidation_reason || null) : null;

    // Insert immutable signal (schema_version 1 — historical, pre-v2 fields NULL).
    await sql`
      INSERT INTO signals (
        signal_uid, schema_version, ticker, asset_class, direction,
        entry_price, stop_loss, take_profit, rr_ratio, score,
        adx, rsi, entry_mode, generated_at, status, outcome
      ) VALUES (
        ${uid}, 1, ${a.ticker}, ${assetClass}, ${a.direction},
        ${a.entry_price}, ${a.stop_loss}, ${a.take_profit}, ${a.rr_ratio}, ${a.score},
        ${a.adx}, ${a.rsi}, ${a.entry_mode}, ${a.created_at}, ${status}, ${null}
      )
      ON CONFLICT (signal_uid) DO NOTHING`;

    // Link the article to its signal.
    await sql`UPDATE articles SET signal_uid = ${uid} WHERE id = ${a.id}`;
    migrated++;
  }
  console.log(`  ✓ ${migrated} signal article(s) backfilled.`);

  // Verification.
  const verify = await sql`
    SELECT status, COUNT(*)::int AS n FROM signals GROUP BY status ORDER BY status`;
  console.log('\nVerification — signals by status:');
  for (const r of verify) console.log(`  ${r.status.padEnd(14)} ${r.n}`);

  const orphan = await sql`
    SELECT COUNT(*)::int AS n FROM articles
    WHERE category = 'signal' AND signal_uid IS NULL`;
  console.log(`\nSignal articles still without signal_uid: ${orphan[0].n} (expected 0)`);

  console.log('\nMigration 003 complete.');
}

run().catch((err) => {
  console.error('Migration 003 failed:', err.message);
  process.exit(1);
});
