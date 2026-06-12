// /v2/markets — L2 Markets Hub per docs/mockups/L2_Markets_Hub.png (Phase A
// Session 2 Task 2). Server-rendered, ISR 60s. Every number traces to
// lib/v2-data.js (signals/price_snapshots) or lib/market-sessions.js (§0.2).

import Link from 'next/link';
import { INSTRUMENTS, instrumentsByClass, formatInstrumentPrice, displayFor } from '@/lib/instruments';
import { getActiveSignals, getSignalCounts, getDailyChanges, getSparklineData } from '@/lib/v2-data';
import { ASSET_CLASSES } from '@/components/v2/assetClassMeta';
import Breadcrumb from '@/components/v2/Breadcrumb';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import SignalCard from '@/components/v2/SignalCard';
import Sparkline from '@/components/v2/Sparkline';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import LastUpdated from '@/components/v2/LastUpdated';
import PctBadge, { fmtPct } from '@/components/v2/PctBadge';
import ClassCards from '@/components/v2/ClassCards';
import SessionCards from '@/components/v2/SessionCards';

export const revalidate = 60;

export const metadata = {
  title: 'Markets — MaxTradeFlow',
  description: 'Live market overview: forex, indices, commodities and crypto scanned continuously by Smart Asset Bot.',
};

// Mobile rows swipe with snap (§22); desktop is a grid.
const SWIPE_ROW = 'flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 md:grid md:overflow-visible md:pb-0';
const SWIPE_CARD = 'snap-start shrink-0 w-60 md:w-auto';

function SectionHeading({ title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-v2-display text-base font-semibold text-v2-text">{title}</h2>
      {action}
    </div>
  );
}

// Per-class aggregates for the opportunity map — all from real active
// signals + snapshots; "—" when a value has no basis (e.g. no signals).
function classAggregates(signals, changes) {
  return ASSET_CLASSES.map((cls) => {
    const clsSignals = signals.filter((s) => s.assetClass === cls.key);
    const scores = clsSignals.map((s) => s.displayScore).filter((v) => v != null);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
    const hasDerived = clsSignals.some((s) => s.derived && s.displayScore != null);

    const conditions = clsSignals.map((s) => s.market_condition).filter(Boolean);
    const condition = conditions.length
      ? Object.entries(conditions.reduce((m, c) => ((m[c] = (m[c] ?? 0) + 1), m), {}))
          .sort((a, b) => b[1] - a[1])[0][0]
      : null;

    const best = clsSignals
      .filter((s) => s.displayScore != null)
      .sort((a, b) => b.displayScore - a.displayScore)[0] ?? null;

    const clsChanges = instrumentsByClass(cls.key)
      .map((i) => changes[i.symbol]?.changePct)
      .filter((v) => v != null);
    const trendPct = clsChanges.length
      ? Math.round((clsChanges.reduce((a, b) => a + b, 0) / clsChanges.length) * 100) / 100
      : null;

    return { ...cls, count: clsSignals.length, avgScore, hasDerived, condition, best, trendPct };
  });
}

export default async function MarketsHubPage() {
  const [signals, counts, changes, goldSpark] = await Promise.all([
    getActiveSignals(),
    getSignalCounts(),
    getDailyChanges(),
    getSparklineData('XAUUSD', 24),
  ]);
  const aggregates = classAggregates(signals, changes);
  const gold = changes['XAUUSD'] ?? null;
  const goldSignal = signals.find((s) => s.ticker === 'XAUUSD') ?? null;
  const goldPct = fmtPct(gold?.changePct ?? null);

  return (
    <>
      <Breadcrumb items={[{ label: 'Markets' }]} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4">
        <MarketsSidebar active="overview" counts={counts.byClass} />

        <div className="min-w-0 flex-1 space-y-10 py-6">
          <header>
            <h1 className="font-v2-display text-2xl font-bold text-v2-text">Markets</h1>
            <p className="mt-1 text-sm text-v2-text-muted">
              Smart Asset Bot scans <span className="v2-num text-v2-accent">{INSTRUMENTS.length}</span>{' '}
              instruments continuously. <span className="text-v2-accent">Signals publish at TradeFlow Score ≥70 &amp; ADX ≥25.</span>
            </p>
          </header>

          {/* ── Gold featured spotlight ── */}
          <section className="rounded-md border border-v2-gold-border bg-v2-surface p-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-widest text-v2-gold">★ Featured Instrument</div>
                <div className="flex items-baseline gap-2">
                  <span className="v2-num text-3xl font-semibold text-v2-gold">
                    {formatInstrumentPrice(gold?.price, 'XAUUSD')}
                  </span>
                  <PctBadge pct={gold?.changePct ?? null} className="text-sm" />
                </div>
                <div className="mt-1 font-v2-display text-sm font-semibold text-v2-text">Gold — XAUUSD</div>
                <div className="text-xs text-v2-text-faint">Precious metal · Most traded commodity</div>
                <div className="mt-3 flex gap-2">
                  <Link href="/v2/markets/commodities/xauusd" className="rounded bg-v2-gold px-3 py-1.5 text-xs font-medium text-v2-bg transition-opacity hover:opacity-90">
                    View signals
                  </Link>
                  <Link href="/v2/markets/commodities/xauusd" className="rounded border border-v2-gold-border px-3 py-1.5 text-xs text-v2-gold transition-colors hover:bg-v2-gold-soft">
                    Full chart
                  </Link>
                </div>
              </div>

              <div className="rounded-md border border-v2-line bg-v2-bg p-3">
                {goldSignal ? (
                  <>
                    <div className={`mb-2 text-xs font-medium ${goldSignal.direction === 'LONG' ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
                      ● Active Signal — {goldSignal.direction}
                    </div>
                    <dl className="space-y-1.5 text-xs">
                      {[
                        ['Entry', formatInstrumentPrice(goldSignal.entry_price, 'XAUUSD'), 'text-v2-text'],
                        ['SL', formatInstrumentPrice(goldSignal.stop_loss, 'XAUUSD'), 'text-v2-bearish'],
                        ['TP', formatInstrumentPrice(goldSignal.take_profit, 'XAUUSD'), 'text-v2-bullish'],
                        ['TFS', goldSignal.displayScore ?? '—', 'text-v2-text'],
                        ['ADX', goldSignal.adx?.toFixed(1) ?? '—', 'text-v2-text'],
                      ].map(([label, value, tone]) => (
                        <div key={label} className="flex justify-between">
                          <dt className="text-v2-text-faint">{label}</dt>
                          <dd className={`v2-num ${tone}`}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                ) : (
                  <div className="flex h-full flex-col justify-center">
                    <div className="text-xs font-medium text-v2-text-muted">No active Gold signal</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-v2-text-faint">
                      Smart Asset Bot has no open XAUUSD setup right now. New signals appear here the
                      moment they publish.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-md border border-v2-line bg-v2-bg p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] text-v2-text-faint">Gold price — last 24h</span>
                  <LastUpdated timestamp={gold?.lastTs} />
                </div>
                <Sparkline data={goldSpark} variant="line" tone="gold" width={280} height={70} />
              </div>
            </div>
          </section>

          {/* ── Global Opportunity Map ── */}
          <section>
            <SectionHeading title="Global Opportunity Map" />
            <div className={`${SWIPE_ROW} md:grid-cols-5`}>
              {aggregates.map((a) => (
                <div key={a.key} className={`${SWIPE_CARD} rounded-md border border-v2-line bg-v2-surface p-3`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-v2-text">{a.icon} {a.name}</span>
                    <PctBadge pct={a.trendPct} className="text-[11px]" />
                  </div>
                  {a.comingSoon ? (
                    <p className="text-xs text-v2-text-faint">Coming soon</p>
                  ) : (
                    <dl className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <dt className="text-v2-text-faint">Opportunities</dt>
                        <dd className={`v2-num ${a.count > 0 ? 'text-v2-bullish' : 'text-v2-text-faint'}`}>{a.count}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-v2-text-faint">Avg TFS</dt>
                        <dd className="v2-num text-v2-text" title={a.hasDerived ? 'Includes scores derived from legacy 0–10 ratings' : undefined}>
                          {a.avgScore ?? '—'}{a.hasDerived ? '*' : ''}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-v2-text-faint">Condition</dt>
                        <dd className="text-v2-text-muted">{a.condition ?? '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-v2-text-faint">Best</dt>
                        <dd className="v2-num text-v2-accent">
                          {a.best ? `${displayFor(a.best.ticker)} ${a.best.displayScore}` : '—'}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── All Markets class cards ── */}
          <section>
            <SectionHeading title="All Markets" />
            <ClassCards counts={counts.byClass} />
          </section>

          {/* ── Market Sessions ── */}
          <section>
            <SectionHeading
              title="Market Sessions"
              action={<Link href="/v2/tools/session-converter" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">Session converter →</Link>}
            />
            <SessionCards />
          </section>

          {/* ── Active AI Signals strip ── */}
          <section>
            <SectionHeading
              title="Active AI Signals — All Markets"
              action={<Link href="/v2/signals" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">All signals →</Link>}
            />
            {signals.length === 0 ? (
              <p className="text-sm text-v2-text-muted">No active signals right now. The bot publishes only setups scoring at the gate — quiet periods are honest, not hidden.</p>
            ) : (
              <div className={`${SWIPE_ROW} md:grid-cols-4`}>
                {signals.map((s) => (
                  <div key={s.signal_uid} className={SWIPE_CARD}>
                    <SignalCard signal={s} classTag href={`/v2/signals/${s.signal_uid}`} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <RiskDisclaimer variant="compact" />
        </div>
      </div>
    </>
  );
}
