// components/v2/AssetClassPage.js — the reusable L3 template per
// docs/mockups/L3_Asset_Class.png (A-2). Instantiated per class by thin
// pages (app/(v2)/v2/markets/forex/page.js etc.). Server component; every
// number traces to lib/v2-data.js or lib/market-sessions.js (§0.2).

import Link from 'next/link';
import { instrumentsByClass, formatInstrumentPrice } from '@/lib/instruments';
import { getActiveSignals, getSignalCounts, getDailyChanges, getSparklines } from '@/lib/v2-data';
import { classMeta, l4Href } from './assetClassMeta';
import Breadcrumb from './Breadcrumb';
import MarketsSidebar from './MarketsSidebar';
import InstrumentCardGrid from './InstrumentCardGrid';
import SignalCard from './SignalCard';
import MarketDnaRadar from './MarketDnaRadar';
import RiskDisclaimer from './RiskDisclaimer';
import UpcomingEvents from './UpcomingEvents';

const MAX_CARDS = 8; // two rows of four per the mockup

// Gate copy matches the real publication gate (TFS ≥70 + ADX ≥25, live on
// the bot since 2026-06-12) — keep in sync with the /v2/ai-trading guide.
const GATE = 'Signals publish at TradeFlow Score ≥70 and ADX ≥25.';
const SUBTITLES = {
  forex: (n) => `${n} currency pairs scanned continuously. ${GATE}`,
  indices: (n) => `${n} index CFDs scanned continuously. ${GATE}`,
  commodities: (n) => `${n === 1 ? 'Gold, with more commodities coming' : `${n} commodities`} — scanned continuously. ${GATE}`,
  crypto: (n) => `${n} crypto pairs scanned continuously. ${GATE}`,
};

const stdev = (xs) => {
  if (xs.length < 2) return null;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (xs.length - 1));
};

/**
 * Market DNA axes — each derived from real data or omitted (§ task 3 rule:
 * an axis that can't be derived honestly is dropped; liquidity always is,
 * because no volume/spread history exists server-side → 4 axes max today).
 *
 *   Trend       avg |today's % change| across class instruments, capped at
 *               1.5% (a class averaging ±1.5%+ in a day is maximally trendy)
 *   Momentum    avg ADX across the class's ACTIVE signals / 50 (ADX 50+ is
 *               extreme momentum) — omitted with no active signals
 *   Volatility  avg per-instrument stdev of hourly % returns (24h closes),
 *               capped at 0.4%/h — omitted when bars are too few (<6)
 *   Sentiment   share of LONG among the class's active signals (1 = all
 *               long, 0 = all short) — omitted with no active signals
 */
function deriveDnaAxes({ instruments, clsSignals, changes, sparks }) {
  const axes = [];

  const absChanges = instruments
    .map((i) => changes[i.symbol]?.changePct)
    .filter((v) => v != null)
    .map(Math.abs);
  if (absChanges.length) {
    const avg = absChanges.reduce((a, b) => a + b, 0) / absChanges.length;
    axes.push({
      label: 'Trend',
      value: Math.min(1, avg / 1.5),
      note: `Avg |daily change| ${avg.toFixed(2)}% across ${absChanges.length} instruments (cap 1.5%)`,
    });
  }

  const adxs = clsSignals.map((s) => s.adx).filter((v) => v != null);
  if (adxs.length) {
    const avg = adxs.reduce((a, b) => a + b, 0) / adxs.length;
    axes.push({
      label: 'Momentum',
      value: Math.min(1, avg / 50),
      note: `Avg ADX ${avg.toFixed(1)} across ${adxs.length} active signal(s) (cap 50)`,
    });
  }

  const vols = instruments
    .map((i) => {
      const closes = sparks[i.symbol] ?? [];
      if (closes.length < 6) return null;
      const rets = closes.slice(1).map((c, k) => ((c - closes[k]) / closes[k]) * 100);
      return stdev(rets);
    })
    .filter((v) => v != null);
  if (vols.length) {
    const avg = vols.reduce((a, b) => a + b, 0) / vols.length;
    axes.push({
      label: 'Volatility',
      value: Math.min(1, avg / 0.4),
      note: `Avg hourly-return stdev ${avg.toFixed(3)}%/h over 24h (cap 0.4%)`,
    });
  }

  const dirs = clsSignals.map((s) => s.direction).filter(Boolean);
  if (dirs.length) {
    const share = dirs.filter((d) => d === 'LONG').length / dirs.length;
    axes.push({
      label: 'Sentiment',
      value: share,
      note: `${Math.round(share * 100)}% of ${dirs.length} active signal(s) are LONG`,
    });
  }

  // Liquidity: intentionally absent — no volume/spread history to derive it
  // honestly yet (the spec's 4-axis fallback).
  return axes;
}

export default async function AssetClassPage({ classKey }) {
  const meta = classMeta(classKey);
  const instruments = instrumentsByClass(classKey);
  const symbols = instruments.map((i) => i.symbol);

  const [signals, counts, changes, sparks] = await Promise.all([
    getActiveSignals(),
    getSignalCounts(),
    getDailyChanges(),
    getSparklines(symbols, 24),
  ]);
  const clsSignals = signals.filter((s) => s.assetClass === classKey);

  // Latest signal per ticker for card markers.
  const signalByTicker = {};
  for (const s of clsSignals) {
    if (!signalByTicker[s.ticker]) signalByTicker[s.ticker] = s;
  }

  const cards = instruments
    .map((inst, registryIdx) => {
      const change = changes[inst.symbol] ?? null;
      const sig = signalByTicker[inst.symbol] ?? null;
      return {
        symbol: inst.symbol,
        display: inst.display,
        name: inst.name,
        // Only the five built L4 pages link out; the rest render unlinked
        // until the Phase B rollout (Session 3 decision).
        href: l4Href(inst),
        price: formatInstrumentPrice(change?.price, inst.symbol),
        changePct: change?.changePct ?? null,
        spark: sparks[inst.symbol] ?? [],
        signal: sig
          ? { direction: sig.direction, displayScore: sig.displayScore, derived: sig.derived }
          : null,
        registryIdx,
      };
    })
    // Top row prioritized by signal activity: active first, best score first,
    // then biggest movers, then registry order.
    .sort(
      (a, b) =>
        (b.signal ? 1 : 0) - (a.signal ? 1 : 0) ||
        (b.signal?.displayScore ?? 0) - (a.signal?.displayScore ?? 0) ||
        Math.abs(b.changePct ?? 0) - Math.abs(a.changePct ?? 0) ||
        a.registryIdx - b.registryIdx
    )
    .slice(0, MAX_CARDS)
    .map(({ registryIdx, ...card }) => card);

  const dnaAxes = deriveDnaAxes({ instruments, clsSignals, changes, sparks });

  return (
    <>
      <Breadcrumb items={[{ label: 'Markets', href: '/v2/markets' }, { label: meta.name }]} />
      <div className="grid grid-cols-[224px_1fr]">
        <MarketsSidebar active={classKey} counts={counts.byClass} />

        <div className="min-w-0 space-y-10 px-6 py-6">
          <header>
            <h1 className="font-v2-display text-2xl font-bold text-v2-text">{meta.name}</h1>
            <p className="mt-1 text-sm text-v2-text-muted">
              {(SUBTITLES[classKey] ?? SUBTITLES.forex)(instruments.length)}
            </p>
          </header>

          <section>
            <InstrumentCardGrid
              cards={cards}
              viewAllLabel={
                instruments.length > cards.length
                  ? `View all ${instruments.length} ${meta.name} pairs`
                  : null
              }
            />
          </section>

          {/* ── Class signals ── */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-v2-display text-base font-semibold text-v2-text">{meta.name} Signals</h2>
              <Link href="/v2/signals" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">
                All signals →
              </Link>
            </div>
            {clsSignals.length === 0 ? (
              <p className="text-sm text-v2-text-muted">
                No active {meta.name.toLowerCase()} signals right now. The bot publishes only setups
                at the gate — quiet periods are shown, not filled.
              </p>
            ) : (
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
                {clsSignals.slice(0, 3).map((s) => (
                  <div key={s.signal_uid} className="w-64 shrink-0 snap-start md:w-auto">
                    <SignalCard signal={s} href={`/v2/signals/${s.signal_uid}`} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Market DNA ── */}
          <section>
            <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">
              {meta.name} Market DNA
            </h2>
            <div className="flex flex-wrap items-center gap-6 rounded-md border border-v2-line bg-v2-surface p-4">
              {dnaAxes.length >= 3 ? (
                <>
                  <MarketDnaRadar axes={dnaAxes} />
                  <dl className="min-w-0 flex-1 space-y-2">
                    {dnaAxes.map((a) => (
                      <div key={a.label} className="text-xs">
                        <dt className="font-medium text-v2-text">{a.label} — <span className="v2-num text-v2-accent">{Math.round(a.value * 100)}</span></dt>
                        <dd className="text-v2-text-faint">{a.note}</dd>
                      </div>
                    ))}
                    <p className="pt-1 text-[11px] text-v2-text-faint">
                      Liquidity axis omitted — no volume/spread history is collected yet, and this
                      page does not display numbers it cannot derive.
                    </p>
                  </dl>
                </>
              ) : (
                <p className="text-sm text-v2-text-muted">
                  Not enough live data to derive at least three Market DNA axes honestly right now
                  (needs snapshots and/or active signals). The radar appears when the data does.
                </p>
              )}
            </div>
          </section>

          {/* ── Events affecting this class (curated seed — see lib/calendar-events.js) ── */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-v2-display text-base font-semibold text-v2-text">
                Major scheduled events — {meta.name}
              </h2>
              <Link href="/v2/calendar" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">
                Full calendar →
              </Link>
            </div>
            <UpcomingEvents
              symbols={symbols}
              days={14}
              limit={5}
              emptyText={`No major scheduled events for ${meta.name.toLowerCase()} instruments in the next 14 days.`}
            />
          </section>

          <RiskDisclaimer variant="compact" />
        </div>
      </div>
    </>
  );
}
