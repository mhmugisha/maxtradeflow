// /v2 — the new L1 home per docs/mockups/L1_Home.png (Phase A Session 4
// Task 1). Server-rendered, ISR 60s. Every number traces to lib/v2-data.js;
// null pulse/stat values render "—" / gated states, never invented (§0.2).
// The "This Week" calendar card is added with Task 4 (calendar module).

import Link from 'next/link';
import { INSTRUMENTS } from '@/lib/instruments';
import { getActiveSignals, getSignalCounts, getMarketPulse, getPlatformStatsGate } from '@/lib/v2-data';
import SignalCard from '@/components/v2/SignalCard';
import ClassCards from '@/components/v2/ClassCards';
import SessionCards from '@/components/v2/SessionCards';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import LastUpdated from '@/components/v2/LastUpdated';
import { getUpcomingEvents, getNextEvent } from '@/lib/calendar-events';
import { ImpactBadge } from '@/components/v2/UpcomingEvents';

export const revalidate = 60;

export const metadata = {
  title: 'MaxTradeFlow — AI-Powered Market Signals & Analysis',
  description: 'Real-time trading signals from Smart Asset Bot: continuous scanning across forex, indices, commodities and crypto. Every signal tracked to its outcome.',
};

// The real pipeline, one honest line per step (Task 1 "How It Works").
const STEPS = [
  { n: '1', title: 'Scan', text: `Smart Asset Bot scans ${INSTRUMENTS.length} instruments on a continuous cycle — trend, momentum, structure and volatility on every pass.` },
  { n: '2', title: 'Score', text: 'Each setup gets a TradeFlow Score from weighted factors. Only setups at or above the publication gate are published — the rest are discarded, not hidden.' },
  { n: '3', title: 'Track', text: 'Entry, stop and target touches are detected automatically and recorded as immutable events. Losses are shown identically to wins.' },
];

function PulseBox({ label, value, tone = 'text-v2-text' }) {
  return (
    <div className="rounded-md border border-v2-line bg-v2-surface px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-v2-text-faint">{label}</div>
      <div className={`v2-num mt-0.5 text-sm font-medium ${tone}`}>{value ?? '—'}</div>
    </div>
  );
}

export default async function HomePage() {
  const [signals, counts, pulse, platformGate] = await Promise.all([
    getActiveSignals(),
    getSignalCounts(),
    getMarketPulse(),
    getPlatformStatsGate(),
  ]);
  const topSignals = [...signals]
    .sort((a, b) => (b.displayScore ?? 0) - (a.displayScore ?? 0))
    .slice(0, 4);
  const gateReady = (platformGate.stats?.sample_size ?? 0) >= 30;

  const weekEvents = getUpcomingEvents({ days: 10, limit: 6 });
  const nextEvent = getNextEvent();
  const fmtEvent = (iso) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10">
      {/* ── Hero (left: pitch, right: calendar card per the mockup) ── */}
      <section className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)]">
        <div>
        <p className="text-[11px] uppercase tracking-widest text-v2-accent">Smart Asset Bot — Live</p>
        <h1 className="mt-2 max-w-2xl font-v2-display text-3xl font-bold leading-tight text-v2-text md:text-4xl">
          AI-Powered <span className="text-v2-accent">Market Signals</span> &amp; Analysis
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-v2-text-muted">
          Real-time signals from Smart Asset Bot. Continuous market scanning across forex, indices,
          commodities, and crypto. No opinion — just data.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/v2/markets" className="rounded bg-v2-accent px-4 py-2 text-sm font-medium text-v2-bg transition-opacity hover:opacity-90">
            View Live Signals
          </Link>
          <Link href="/v2/ai-trading" className="rounded border border-v2-line-strong px-4 py-2 text-sm text-v2-accent transition-colors hover:bg-v2-accent-soft">
            How It Works
          </Link>
        </div>

        {/* Proof strip: live Market Pulse + active count */}
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <PulseBox label="Dollar strength" value={pulse?.dollar_strength != null ? `${pulse.dollar_strength}/100` : null} />
            <PulseBox label="Gold sentiment" value={pulse?.gold_sentiment} />
            <PulseBox label="Volatility" value={pulse?.volatility_regime} />
            <PulseBox label="Risk environment" value={pulse?.risk_environment} />
            <PulseBox label="Active signals" value={counts.total} tone={counts.total > 0 ? 'text-v2-bullish' : 'text-v2-text'} />
          </div>
          <div className="mt-1.5">
            {pulse?.computed_at ? (
              <LastUpdated timestamp={pulse.computed_at} prefix="Pulse computed" />
            ) : (
              <span className="text-[11px] text-v2-text-faint">Market Pulse not yet computed — values appear when the bot publishes them.</span>
            )}
          </div>

          {/* Next event bar (mockup) — curated seed, see lib/calendar-events.js */}
          {nextEvent && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-v2-line bg-v2-surface px-3 py-2">
              <span className="text-xs text-v2-text-muted">
                <span className="text-v2-accent">●</span> Next event: <span className="text-v2-text">{nextEvent.title}</span>
              </span>
              <span className="v2-num rounded bg-v2-accent-soft px-2 py-0.5 text-[11px] text-v2-accent">{fmtEvent(nextEvent.datetime)}</span>
            </div>
          )}
        </div>
        </div>

        {/* This Week — Economic Calendar card (curated seed) */}
        <div className="rounded-md border border-v2-line bg-v2-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-v2-text">Ahead — Major Scheduled Events</h2>
            <Link href="/v2/calendar" className="text-[11px] text-v2-text-muted transition-colors hover:text-v2-accent">Full calendar →</Link>
          </div>
          {weekEvents.length === 0 ? (
            <p className="text-xs text-v2-text-faint">No major scheduled events in the next 10 days.</p>
          ) : (
            <div className="divide-y divide-v2-line">
              {weekEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2 py-2" title={e.source}>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-v2-text">{e.currency} {e.title}</div>
                    <div className="v2-num text-[10px] text-v2-text-faint">{fmtEvent(e.datetime)}</div>
                  </div>
                  <ImpactBadge impact={e.impact} />
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-[10px] text-v2-text-faint">Curated from official calendars — not a live feed.</p>
        </div>
      </section>

      {/* ── Live signals preview ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-v2-text-faint">Auto-published by Smart Asset Bot</p>
            <h2 className="font-v2-display text-lg font-semibold text-v2-text">Latest Market Signals</h2>
          </div>
          <Link href="/v2/signals" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">All signals →</Link>
        </div>
        {topSignals.length === 0 ? (
          <p className="text-sm text-v2-text-muted">No active signals right now — quiet periods are shown, not filled.</p>
        ) : (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
            {topSignals.map((s) => (
              <div key={s.signal_uid} className="w-60 shrink-0 snap-start md:w-auto">
                <SignalCard signal={s} classTag href={`/v2/signals/${s.signal_uid}`} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-3"><RiskDisclaimer variant="compact" /></div>
      </section>

      {/* ── How It Works ── */}
      <section>
        <h2 className="mb-3 font-v2-display text-lg font-semibold text-v2-text">How It Works</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-md border border-v2-line bg-v2-surface p-4">
              <div className="v2-num text-xs text-v2-accent">{s.n}</div>
              <div className="mt-1 font-v2-display text-sm font-semibold text-v2-text">{s.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-v2-text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Markets overview ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-v2-display text-lg font-semibold text-v2-text">Markets</h2>
          <Link href="/v2/markets" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">Markets hub →</Link>
        </div>
        <ClassCards counts={counts.byClass} />
      </section>

      {/* ── Trust / transparency ── */}
      <section className="rounded-md border border-v2-line bg-v2-surface p-5">
        <h2 className="font-v2-display text-lg font-semibold text-v2-text">Transparency, built in</h2>
        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <ul className="space-y-2 text-sm text-v2-text-muted">
            <li className="flex gap-2"><span className="text-v2-accent">•</span> Signals are immutable once published — never edited, never deleted.</li>
            <li className="flex gap-2"><span className="text-v2-accent">•</span> Outcomes are detected automatically from price and recorded as append-only events. Stop-loss hits are published identically to take-profit hits.</li>
            <li className="flex gap-2"><span className="text-v2-accent">•</span> Ambiguous outcomes are recorded as losses — the platform never errs in its own favor.</li>
          </ul>
          <div className="rounded-md border border-v2-line bg-v2-bg p-4">
            <div className="text-[10px] uppercase tracking-widest text-v2-text-faint">Platform performance — last 30 closed signals</div>
            {gateReady ? (
              <dl className="mt-2 space-y-1.5 text-xs">
                {[
                  ['Win rate', `${platformGate.stats.win_rate}%`],
                  ['Avg realized R', platformGate.stats.avg_realized_rr],
                  ['Net R', platformGate.stats.net_r],
                  ['Sample', `${platformGate.stats.sample_size} closed signals`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-v2-text-faint">{label}</dt>
                    <dd className="v2-num text-v2-text">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-v2-text-faint">
                Performance stats unlock at 30 closed signals —{' '}
                <span className="v2-num text-v2-text-muted">{platformGate.closedCount}/30</span> so far.
                Outcome tracking is new; numbers appear here when the sample is real, not before.
              </p>
            )}
            <Link href="/v2/ai-trading" className="mt-3 inline-block text-xs text-v2-accent hover:underline">
              How signals are scored and tracked →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sessions ── */}
      <section>
        <h2 className="mb-3 font-v2-display text-lg font-semibold text-v2-text">Market Sessions</h2>
        <SessionCards />
      </section>
    </div>
  );
}
