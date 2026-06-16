// / — v2 home with sidebar layout. Server-rendered, ISR 60s. Every number
// traces to lib/v2-data.js or lib/calendar-events.js; null pulse values
// render "—", never invented (§0.2).

import Link from 'next/link';
import { INSTRUMENTS } from '@/lib/instruments';
import { getActiveSignals, getSignalCounts, getMarketPulse } from '@/lib/v2-data';
import { getUpcomingEvents, getNextEvent } from '@/lib/calendar-events';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import SignalCard from '@/components/v2/SignalCard';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import { ImpactBadge } from '@/components/v2/UpcomingEvents';

export const revalidate = 60;

export const metadata = {
  title: 'MaxTradeFlow — AI-Powered Market Signals & Analysis',
  description: 'Real-time trading signals from Smart Asset Bot: continuous scanning across forex, indices, commodities and crypto. Every signal tracked to its outcome.',
};

const STEPS = [
  { n: '1', title: 'Scan', text: `Smart Asset Bot scans ${INSTRUMENTS.length} instruments on a continuous cycle — trend, momentum, structure and volatility on every pass.` },
  { n: '2', title: 'Score', text: 'Each setup gets a TradeFlow Score from weighted factors. Only setups at or above the publication gate are published — the rest are discarded, not hidden.' },
  { n: '3', title: 'Track', text: 'Entry, stop and target touches are detected automatically and recorded as immutable events. Losses are shown identically to wins.' },
];

const CURRENCY_FLAG = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿', CHF: '🇨🇭',
};

function fmtEvent(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${day} · ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
}

function fmtCountdown(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'now';
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${m}m`;
  return `in ${m}m`;
}

function PulseBox({ label, value, tone = 'text-v2-text' }) {
  return (
    <div className="rounded-md border border-v2-line bg-v2-surface px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-v2-text-faint">{label}</div>
      <div className={`v2-num mt-0.5 text-sm font-medium ${tone}`}>{value ?? '—'}</div>
    </div>
  );
}

function SectionHeading({ title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-v2-display text-base font-semibold text-v2-text">{title}</h2>
      {action}
    </div>
  );
}

export default async function HomePage() {
  const [signals, counts, pulse] = await Promise.all([
    getActiveSignals(),
    getSignalCounts(),
    getMarketPulse(),
  ]);

  const latestSignals = [...signals]
    .sort((a, b) => new Date(b.generated_at ?? 0) - new Date(a.generated_at ?? 0))
    .slice(0, 3);

  const nextEvent = getNextEvent();
  const upcomingEvents = getUpcomingEvents({ days: 14, limit: 5 });

  return (
    <div className="grid grid-cols-[224px_1fr]">
      <MarketsSidebar active="home" counts={counts.byClass} />

      <div className="min-w-0 space-y-10 px-6 py-6">
        {/* 1. HERO */}
        <section>
          <p className="text-[11px] uppercase tracking-widest text-v2-accent">● Smart Asset Bot — Live</p>
          <h1 className="mt-2 font-v2-display text-3xl font-bold leading-tight text-v2-text md:text-4xl">
            AI-Powered <span className="text-v2-accent">Market Signals</span> &amp; Analysis
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-v2-text-muted">
            Real-time signals from Smart Asset Bot. Continuous market scanning across forex, indices,
            commodities, and crypto. No opinion — just data.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/markets" className="rounded bg-v2-accent px-4 py-2 text-sm font-medium text-v2-bg transition-opacity hover:opacity-90">
              View Live Signals
            </Link>
            <Link href="#how-it-works" className="rounded border border-v2-line-strong px-4 py-2 text-sm text-v2-accent transition-colors hover:bg-v2-accent-soft">
              How It Works
            </Link>
          </div>
        </section>

        {/* 2. NEXT MAJOR EVENT BANNER */}
        {nextEvent && (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-v2-line border-l-4 border-l-v2-accent bg-v2-surface px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-xl leading-none" aria-hidden>
                {CURRENCY_FLAG[nextEvent.currency] ?? '🌐'}
              </span>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-v2-text-faint">Next major event</div>
                <div className="truncate text-sm font-medium text-v2-text">{nextEvent.title}</div>
                <div className="v2-num text-[11px] text-v2-text-muted">{fmtEvent(nextEvent.datetime)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="v2-num rounded bg-v2-accent-soft px-2 py-0.5 text-[11px] text-v2-accent">
                {fmtCountdown(nextEvent.datetime)}
              </span>
              <ImpactBadge impact={nextEvent.impact} />
            </div>
          </section>
        )}

        {/* 3. MARKET PULSE */}
        <section>
          <SectionHeading title="Market Pulse" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <PulseBox label="Dollar strength" value={pulse?.dollar_strength != null ? `${pulse.dollar_strength}/100` : null} />
            <PulseBox label="Gold sentiment" value={pulse?.gold_sentiment} />
            <PulseBox label="Volatility" value={pulse?.volatility_regime} />
            <PulseBox label="Risk environment" value={pulse?.risk_environment} />
            <PulseBox
              label="Active signals"
              value={counts.total}
              tone={counts.total > 0 ? 'text-v2-bullish' : 'text-v2-text'}
            />
          </div>
        </section>

        {/* 4. LATEST MARKET SIGNALS */}
        <section>
          <SectionHeading
            title="Latest Market Signals"
            action={<Link href="/signals" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">All signals →</Link>}
          />
          {latestSignals.length === 0 ? (
            <p className="text-sm text-v2-text-muted">No active signals right now — quiet periods are shown, not filled.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {latestSignals.map((s) => (
                <SignalCard key={s.signal_uid} signal={s} classTag href={`/signals/${s.signal_uid}`} />
              ))}
            </div>
          )}
        </section>

        {/* 5. UPCOMING EVENTS */}
        <section>
          <SectionHeading
            title="Upcoming Events"
            action={<Link href="/calendar" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">Full calendar →</Link>}
          />
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-v2-text-faint">No major scheduled events in the next 14 days.</p>
          ) : (
            <div className="space-y-1.5">
              {upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-v2-line bg-v2-surface px-3 py-2"
                  title={e.source}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-base leading-none" aria-hidden>
                      {CURRENCY_FLAG[e.currency] ?? '🌐'}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-v2-text">{e.title}</div>
                      <div className="v2-num text-[10px] text-v2-text-faint">{fmtEvent(e.datetime)}</div>
                    </div>
                  </div>
                  <ImpactBadge impact={e.impact} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. HOW IT WORKS */}
        <section id="how-it-works" className="scroll-mt-24">
          <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">How It Works</h2>
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

        {/* 7. RISK DISCLAIMER */}
        <RiskDisclaimer variant="compact" />
      </div>
    </div>
  );
}
