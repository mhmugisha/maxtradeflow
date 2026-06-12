// lib/v2-data.js — server-side data helpers for the v2.1 pages (Phase A
// Session 2 Task 1). Every number rendered by /v2/markets* traces to a query
// in lib/v2-data-core.js (§0.2). Helpers are wrapped in unstable_cache with
// 60s revalidate so ISR pages don't hammer Neon per request; tags allow
// on-demand revalidation from publish-signal/signal-event later (A-2).
//
// Semantics (documented in full on the core fetchers):
//   getActiveSignals   GENERATED/TRIGGERED/ACTIVE, deduped to latest per
//                      (ticker, direction) — the bot republishes unchanged
//                      setups each scan; displayScore = tradeflow_score, or
//                      legacy score × 10 with derived:true, or null
//   getDailyChanges    latest close + % vs today's (UTC) first 1h bar;
//                      changePct null when history is insufficient — render
//                      "—", never 0
//   getSparklines      close series per symbol, trailing 24h by default
//   getMarketPulse     latest market_pulse row or null
//
// All NUMERICs are coerced to Number (or null) before leaving this module.

import { neon } from '@neondatabase/serverless';
import { unstable_cache } from 'next/cache';
import {
  fetchActiveSignals,
  fetchDailyChanges,
  fetchSparklines,
  fetchMarketPulse,
  fetchLatestSignalForInstrument,
  fetchSignalByUid,
  fetchSignalHistory,
  fetchSignalEvents,
  fetchInstrumentStatsGate,
  fetchChartData,
  fetchArticleForSignal,
  UUID_RE,
} from './v2-data-core';

export { UUID_RE };

function getDb() {
  return neon(process.env.NEON_DATABASE_URL);
}

export const getActiveSignals = unstable_cache(
  async () => fetchActiveSignals(getDb()),
  ['v2-active-signals'],
  { revalidate: 60, tags: ['signals'] }
);

/** Active (deduped) signal counts per asset class and per instrument. */
export async function getSignalCounts() {
  const signals = await getActiveSignals();
  const byClass = {};
  const byInstrument = {};
  for (const s of signals) {
    if (s.assetClass) byClass[s.assetClass] = (byClass[s.assetClass] ?? 0) + 1;
    byInstrument[s.ticker] = (byInstrument[s.ticker] ?? 0) + 1;
  }
  return { byClass, byInstrument, total: signals.length };
}

export const getDailyChanges = unstable_cache(
  async () => fetchDailyChanges(getDb()),
  ['v2-daily-changes'],
  { revalidate: 60, tags: ['snapshots'] }
);

/** Daily change record for one instrument (or null if no snapshots). */
export async function getDailyChange(instrument) {
  const all = await getDailyChanges();
  return all[instrument] ?? null;
}

export const getSparklines = unstable_cache(
  async (symbols, hours = 24) => fetchSparklines(getDb(), symbols, hours),
  ['v2-sparklines'],
  { revalidate: 60, tags: ['snapshots'] }
);

/** Single-instrument sparkline series (closes, oldest first). */
export async function getSparklineData(instrument, hours = 24) {
  const all = await getSparklines([instrument], hours);
  return all[instrument] ?? [];
}

export const getMarketPulse = unstable_cache(
  async () => fetchMarketPulse(getDb()),
  ['v2-market-pulse'],
  { revalidate: 60, tags: ['pulse'] }
);

// ── Session 3 additions (L4 + signal article) ───────────────────────────────
// unstable_cache keys these by their arguments automatically.

export const getLatestSignalForInstrument = unstable_cache(
  async (ticker) => fetchLatestSignalForInstrument(getDb(), ticker),
  ['v2-latest-signal'],
  { revalidate: 60, tags: ['signals'] }
);

export const getSignalByUid = unstable_cache(
  async (uid) => fetchSignalByUid(getDb(), uid),
  ['v2-signal-by-uid'],
  { revalidate: 60, tags: ['signals'] }
);

export const getSignalHistory = unstable_cache(
  async (ticker, limit = 10) => fetchSignalHistory(getDb(), ticker, limit),
  ['v2-signal-history'],
  { revalidate: 60, tags: ['signals'] }
);

export const getSignalEvents = unstable_cache(
  async (uid) => fetchSignalEvents(getDb(), uid),
  ['v2-signal-events'],
  { revalidate: 60, tags: ['signals'] }
);

export const getInstrumentStatsGate = unstable_cache(
  async (ticker) => fetchInstrumentStatsGate(getDb(), ticker),
  ['v2-instrument-stats'],
  { revalidate: 60, tags: ['signals'] }
);

export const getChartData = unstable_cache(
  async (instrument, hours = 72) => fetchChartData(getDb(), instrument, hours),
  ['v2-chart-data'],
  { revalidate: 60, tags: ['snapshots'] }
);

export const getArticleForSignal = unstable_cache(
  async (uid) => fetchArticleForSignal(getDb(), uid),
  ['v2-article-for-signal'],
  { revalidate: 300, tags: ['signals'] }
);
