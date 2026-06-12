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
    `SELECT DISTINCT ON (ticker, direction)
            signal_uid, ticker, asset_class, direction,
            entry_price, stop_loss, take_profit, rr_ratio,
            score, tradeflow_score, confidence, adx, rsi,
            market_condition, session, expected_duration, status,
            COALESCE(generated_at, created_at) AS generated_at
     FROM signals
     WHERE status = ANY($1)
     ORDER BY ticker, direction, COALESCE(generated_at, created_at) DESC`,
    [ACTIVE_STATUSES]
  );
  return rows
    .map((r) => {
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
        expected_duration: r.expected_duration,
        status: r.status,
        generated_at: r.generated_at ? new Date(r.generated_at).toISOString() : null,
      };
    })
    .sort((a, b) => (b.generated_at ?? '').localeCompare(a.generated_at ?? ''));
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
