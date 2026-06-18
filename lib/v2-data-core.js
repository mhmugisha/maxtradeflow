// lib/v2-data-core.js — raw (uncached) queries behind lib/v2-data.js.
// Framework-free so scripts can exercise the exact production logic against
// the real DB (same pattern as lib/stats.js computeClosedStats). Each
// function takes the neon sql client as its first argument. See lib/v2-data.js
// for the semantics documentation; that file is the one pages import.

import { getInstrument } from './instruments.js';

export const ACTIVE_STATUSES = ['GENERATED', 'TRIGGERED', 'ACTIVE'];

const num = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Shared SELECT list + row mapper so every signal-shaped helper returns the
// identical, fully-coerced shape.
const SIGNAL_FIELDS = `
  signal_uid, ticker, asset_class, direction,
  entry_price, stop_loss, take_profit, rr_ratio,
  score, tradeflow_score, confidence, adx, rsi,
  market_condition, session, session_profile, expected_duration, reasons,
  entry_mode, sl_reason, status, outcome,
  COALESCE(generated_at, created_at) AS generated_at`;

export function mapSignalRow(r) {
  const tfs = num(r.tradeflow_score);
  const score = num(r.score);
  return {
    signal_uid: r.signal_uid,
    ticker: r.ticker,
    assetClass: r.asset_class || getInstrument(r.ticker)?.assetClass || null,
    direction: r.direction,
    entry_price: num(r.entry_price),
    stop_loss: num(r.stop_loss),
    take_profit: num(r.take_profit),
    rr_ratio: num(r.rr_ratio),
    score,
    tradeflow_score: tfs,
    displayScore: tfs ?? (score != null ? score * 10 : null),
    derived: tfs == null && score != null,
    confidence: num(r.confidence),
    adx: num(r.adx),
    rsi: num(r.rsi),
    market_condition: r.market_condition,
    session: r.session,
    session_profile: r.session_profile ?? null,
    expected_duration: r.expected_duration,
    reasons: Array.isArray(r.reasons) ? r.reasons : null,
    entry_mode: r.entry_mode ?? null,
    sl_reason: r.sl_reason ?? null,
    status: r.status,
    outcome: r.outcome ?? null,
    generated_at: r.generated_at ? new Date(r.generated_at).toISOString() : null,
  };
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Current valid signals, deduped to the latest row per (ticker, direction).
 * The bot currently republishes an unchanged setup on every ~5min scan under
 * a fresh signal_uid (e.g. 14× BTCUSD LONG on 2026-06-11), so raw rows
 * overstate activity — this is display-level dedup of duplicate publications,
 * not curation. displayScore falls back to legacy score × 10 with
 * derived:true so the UI can label it; null when neither exists.
 */
export async function fetchActiveSignals(sql) {
  const rows = await sql.query(
    `SELECT DISTINCT ON (ticker, direction) ${SIGNAL_FIELDS}
     FROM signals
     WHERE status = ANY($1)
     ORDER BY ticker, direction, COALESCE(generated_at, created_at) DESC`,
    [ACTIVE_STATUSES]
  );
  return rows
    .map(mapSignalRow)
    .sort((a, b) => (b.generated_at ?? '').localeCompare(a.generated_at ?? ''));
}

/** Most recent signal for an instrument, any status (drives Signal Journey). */
export async function fetchLatestSignalForInstrument(sql, ticker) {
  const rows = await sql.query(
    `SELECT ${SIGNAL_FIELDS} FROM signals WHERE ticker = $1
     ORDER BY COALESCE(generated_at, created_at) DESC LIMIT 1`,
    [ticker]
  );
  return rows.length ? mapSignalRow(rows[0]) : null;
}

/** One signal by uid (caller validates UUID_RE first), or null. */
export async function fetchSignalByUid(sql, uid) {
  const rows = await sql.query(
    `SELECT ${SIGNAL_FIELDS} FROM signals WHERE signal_uid = $1 LIMIT 1`,
    [uid]
  );
  return rows.length ? mapSignalRow(rows[0]) : null;
}

/**
 * Past signals for an instrument — closed or invalidated/expired only,
 * newest first. realizedR: TP = +rr_ratio, SL = −1, otherwise null (matches
 * lib/stats.js semantics).
 */
export async function fetchSignalHistory(sql, ticker, limit = 10) {
  const rows = await sql.query(
    `SELECT ${SIGNAL_FIELDS} FROM signals
     WHERE ticker = $1 AND status IN ('TP_HIT','SL_HIT','EXPIRED','INVALIDATED')
     ORDER BY COALESCE(generated_at, created_at) DESC LIMIT $2`,
    [ticker, limit]
  );
  return rows.map(mapSignalRow).map((s) => ({
    ...s,
    realizedR:
      s.status === 'TP_HIT' && s.rr_ratio != null ? s.rr_ratio
      : s.status === 'SL_HIT' ? -1
      : null,
  }));
}

/** Lifecycle events for one signal, oldest first (Signal Journey). */
export async function fetchSignalEvents(sql, uid) {
  const rows = await sql.query(
    `SELECT event_type, price, occurred_at, reason FROM signal_events
     WHERE signal_uid = $1 ORDER BY occurred_at ASC`,
    [uid]
  );
  return rows.map((r) => ({
    event_type: r.event_type,
    price: num(r.price),
    occurred_at: r.occurred_at ? new Date(r.occurred_at).toISOString() : null,
    reason: r.reason ?? null,
  }));
}

/**
 * Stats-block gate data: the instrument_stats row (if the stats job has run
 * for this instrument) plus the live count of CLOSED signals (TP/SL only —
 * the gate counts real outcomes, not expiries). The UI shows performance
 * numbers only at sample_size ≥ 30 (§ task rule: never below the gate).
 */
export async function fetchInstrumentStatsGate(sql, ticker) {
  const [statsRows, countRows] = await Promise.all([
    sql.query(
      `SELECT win_rate, avg_realized_rr, avg_hold_minutes, net_r, sample_size, computed_at
       FROM instrument_stats WHERE instrument = $1`,
      [ticker]
    ),
    sql.query(
      `SELECT COUNT(*)::int AS n FROM signals
       WHERE ticker = $1 AND status IN ('TP_HIT','SL_HIT')`,
      [ticker]
    ),
  ]);
  const s = statsRows[0];
  return {
    stats: s
      ? {
          win_rate: num(s.win_rate),
          avg_realized_rr: num(s.avg_realized_rr),
          avg_hold_minutes: num(s.avg_hold_minutes),
          net_r: num(s.net_r),
          sample_size: num(s.sample_size) ?? 0,
          computed_at: s.computed_at ? new Date(s.computed_at).toISOString() : null,
        }
      : null,
    closedCount: countRows[0]?.n ?? 0,
  };
}

/** OHLC bars for the L4 price chart, oldest first. */
export async function fetchChartData(sql, instrument, hours = 72) {
  const rows = await sql.query(
    `SELECT ts, open, high, low, close FROM price_snapshots
     WHERE instrument = $1 AND ts >= now() - make_interval(hours => $2)
     ORDER BY ts ASC`,
    [instrument, hours]
  );
  return rows.map((r) => ({
    ts: r.ts ? new Date(r.ts).toISOString() : null,
    open: num(r.open),
    high: num(r.high),
    low: num(r.low),
    close: num(r.close),
  }));
}

/**
 * Platform-wide stats gate (mirrors fetchInstrumentStatsGate): platform_stats
 * row + live closed count + the REAL earliest signal timestamp (the archive
 * header derives "tracked since" from this, never from an assumed date).
 */
export async function fetchPlatformStatsGate(sql) {
  const [statsRows, metaRows] = await Promise.all([
    sql.query(`SELECT win_rate, avg_realized_rr, avg_hold_minutes, net_r, sample_size, computed_at
               FROM platform_stats WHERE id = 1`),
    sql.query(`SELECT COUNT(*)::int AS total,
                      COUNT(*) FILTER (WHERE status IN ('TP_HIT','SL_HIT'))::int AS closed,
                      MIN(COALESCE(generated_at, created_at)) AS earliest
               FROM signals`),
  ]);
  const s = statsRows[0];
  const m = metaRows[0];
  return {
    stats: s
      ? {
          win_rate: num(s.win_rate),
          avg_realized_rr: num(s.avg_realized_rr),
          avg_hold_minutes: num(s.avg_hold_minutes),
          net_r: num(s.net_r),
          sample_size: num(s.sample_size) ?? 0,
          computed_at: s.computed_at ? new Date(s.computed_at).toISOString() : null,
        }
      : null,
    closedCount: m?.closed ?? 0,
    totalCount: m?.total ?? 0,
    earliest: m?.earliest ? new Date(m.earliest).toISOString() : null,
  };
}

// Archive filters. Status keys group the lifecycle statuses users think in.
export const ARCHIVE_STATUS_FILTERS = {
  active: ['GENERATED', 'TRIGGERED', 'ACTIVE'],
  tp: ['TP_HIT'],
  sl: ['SL_HIT'],
  expired: ['EXPIRED'],
  invalidated: ['INVALIDATED'],
};

// User-facing session profiles. 'all' (the legacy multi-session bot value)
// is deliberately excluded — it labels pre-profile signals, not a filterable
// session the user can pick.
export const ARCHIVE_SESSION_PROFILES = ['london', 'new_york', 'asian', 'crypto'];

/**
 * One archive page, newest first, optionally filtered by asset class and
 * status group. Returns { rows, total } where total respects the filters so
 * pagination stays correct. asset_class falls back to the registry for
 * pre-v2 rows (stored NULL), so the class filter uses COALESCE-over-ticker
 * via a ticker list computed by the caller when needed — here we filter on
 * the stored column OR ticker membership.
 */
export async function fetchSignalsPage(sql, { page = 1, perPage = 20, assetClass = null, status = null, sessionProfile = null, classTickers = null } = {}) {
  const statuses = status ? ARCHIVE_STATUS_FILTERS[status] ?? null : null;
  const sessionFilter = sessionProfile && ARCHIVE_SESSION_PROFILES.includes(sessionProfile) ? sessionProfile : null;
  const where = [];
  const params = [];
  if (statuses) {
    params.push(statuses);
    where.push(`status = ANY($${params.length})`);
  }
  if (assetClass) {
    params.push(assetClass);
    const classIdx = params.length;
    params.push(classTickers ?? []);
    where.push(`(asset_class = $${classIdx} OR (asset_class IS NULL AND ticker = ANY($${params.length})))`);
  }
  if (sessionFilter) {
    params.push(sessionFilter);
    where.push(`session_profile = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  params.push(perPage);
  const limitIdx = params.length;
  params.push((Math.max(1, page) - 1) * perPage);
  const offsetIdx = params.length;

  const [rows, countRows] = await Promise.all([
    sql.query(
      `SELECT ${SIGNAL_FIELDS} FROM signals ${whereSql}
       ORDER BY COALESCE(generated_at, created_at) DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    ),
    sql.query(`SELECT COUNT(*)::int AS n FROM signals ${whereSql}`, params.slice(0, params.length - 2)),
  ]);
  return {
    rows: rows.map(mapSignalRow).map((s) => ({
      ...s,
      realizedR:
        s.status === 'TP_HIT' && s.rr_ratio != null ? s.rr_ratio
        : s.status === 'SL_HIT' ? -1
        : null,
    })),
    total: countRows[0]?.n ?? 0,
  };
}

/** The article published for a signal (slug + excerpt + full content), or null. */
export async function fetchArticleForSignal(sql, uid) {
  const rows = await sql.query(
    `SELECT slug, excerpt, content FROM articles WHERE signal_uid = $1 AND published = true LIMIT 1`,
    [uid]
  );
  return rows[0] ?? null;
}

/**
 * Latest snapshot price + % change vs the current UTC day's FIRST 1h bar
 * (its open, falling back to its close). changePct is null when today's
 * opening bar or a latest close is missing — callers render "—", never 0.
 */
export async function fetchDailyChanges(sql) {
  const rows = await sql.query(
    `WITH today_first AS (
       SELECT DISTINCT ON (instrument) instrument, COALESCE(open, close) AS day_open
       FROM price_snapshots
       WHERE ts >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
       ORDER BY instrument, ts ASC
     ),
     latest AS (
       SELECT DISTINCT ON (instrument) instrument, close AS last_close, ts AS last_ts
       FROM price_snapshots
       ORDER BY instrument, ts DESC
     )
     SELECT l.instrument, l.last_close, l.last_ts, t.day_open
     FROM latest l
     LEFT JOIN today_first t USING (instrument)`
  );
  const out = {};
  for (const r of rows) {
    const price = num(r.last_close);
    const dayOpen = num(r.day_open);
    out[r.instrument] = {
      price,
      changePct:
        price != null && dayOpen != null && dayOpen !== 0
          ? Math.round(((price - dayOpen) / dayOpen) * 10000) / 100
          : null,
      lastTs: r.last_ts ? new Date(r.last_ts).toISOString() : null,
    };
  }
  return out;
}

/** Close series per symbol over the trailing window, oldest first. */
export async function fetchSparklines(sql, symbols, hours = 24) {
  const rows = await sql.query(
    `SELECT instrument, close
     FROM price_snapshots
     WHERE instrument = ANY($1)
       AND ts >= now() - make_interval(hours => $2)
       AND close IS NOT NULL
     ORDER BY instrument, ts ASC`,
    [symbols, hours]
  );
  const out = Object.fromEntries(symbols.map((s) => [s, []]));
  for (const r of rows) out[r.instrument]?.push(num(r.close));
  return out;
}

/** Latest market_pulse row (bot A0-6), or null if none computed yet. */
export async function fetchMarketPulse(sql) {
  const rows = await sql.query(`SELECT * FROM market_pulse WHERE id = 1`);
  if (rows.length === 0) return null;
  const p = rows[0];
  return {
    dollar_strength: num(p.dollar_strength),
    gold_sentiment: p.gold_sentiment,
    volatility_regime: p.volatility_regime,
    risk_environment: p.risk_environment,
    active_signal_count: num(p.active_signal_count),
    formulas_version: num(p.formulas_version),
    computed_at: p.computed_at ? new Date(p.computed_at).toISOString() : null,
  };
}
