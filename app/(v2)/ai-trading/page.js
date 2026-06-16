// /v2/ai-trading — AI Trading hub per docs/mockups/AI_Trading_Hub.png
// (Phase A Session 4 Task 2). Methodology text is written from the
// EXECUTION_PLAN/spec — factual, no hype, no profit language (§0.8).

import Link from 'next/link';
import { INSTRUMENTS } from '@/lib/instruments';
import { getActiveSignals, getPlatformStatsGate, getSignalCounts, getSignalEvents, getScreener } from '@/lib/v2-data';
import Breadcrumb from '@/components/v2/Breadcrumb';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import SignalCard from '@/components/v2/SignalCard';
import SignalJourney from '@/components/v2/SignalJourney';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';

export const revalidate = 60;

export const metadata = {
  title: 'AI Trading — How Smart Asset Bot Works — MaxTradeFlow',
  description: 'How Smart Asset Bot scans, scores and tracks trading signals: TradeFlow Score weights, publication gate, entry modes, outcome rules and full methodology.',
};

// TradeFlow Score factor weights — locked in the spec (§A0-4), stamped
// tfs_version 1 on every signal.
const TFS_WEIGHTS = [
  ['Trend alignment', 25, 'Direction agreement across the scanned timeframes'],
  ['ADX momentum', 20, 'Strength of directional momentum'],
  ['RSI positioning', 15, 'Favorable RSI zone for the direction, not overextended'],
  ['Structure', 15, 'Entry relative to defined structural levels'],
  ['Session', 15, 'Liquidity/momentum of the session the setup formed in'],
  ['Volatility', 10, 'Volatility within a tradable range'],
];

const SCORE_BANDS = [
  { range: '90–100', label: 'Exceptional', cls: 'text-v2-bullish' },
  { range: '80–89', label: 'Strong', cls: 'text-v2-accent' },
  { range: '70–79', label: 'Moderate', cls: 'text-v2-text' },
  { range: 'Below 70', label: 'Not published', cls: 'text-v2-text-faint' },
];

const FAQ = [
  {
    q: 'Is this financial advice?',
    a: 'No. Signals are informational output from an automated system. Nothing on this site is a recommendation to buy or sell anything. Trading involves substantial risk of loss.',
  },
  {
    q: 'Do all signals win?',
    a: 'No. Losing signals are published, tracked and displayed exactly like winning ones — stop-loss hits appear in every feed and history table. Any service implying otherwise should worry you.',
  },
  {
    q: 'How are outcomes verified?',
    a: 'The bot watches price after publication and records entry, take-profit and stop-loss touches as append-only events with timestamps and prices. Signals are immutable after publication; outcomes are detected from price, not entered by hand.',
  },
  {
    q: 'What happens when TP and SL are ambiguous?',
    a: 'If both levels are touched within one polling interval and the order cannot be determined, the signal is recorded as a stop-loss hit. The platform never resolves ambiguity in its own favor.',
  },
  {
    q: 'Why do signals get invalidated?',
    a: 'If conditions change before entry triggers — structure breaks, momentum dies, or the setup otherwise stops being valid — the bot withdraws the signal with a recorded reason. Invalidated signals stay in the public archive.',
  },
  {
    q: 'What is the track record status?',
    a: 'Signals are currently generated and tracked against demo-account market data. Automated outcome tracking went live in June 2026, so the closed-signal sample is still building. Performance statistics display only once 30 closed signals exist — there are no historical performance claims before that.',
  },
];

// Opportunity Board sort: TRADE first, then WATCH, then AVOID, then
// instruments the bot didn't include this scan. Within each tier, TFS desc.
const ACTION_RANK = { TRADE: 0, WATCH: 1, AVOID: 2 };

export default async function AiTradingPage() {
  const [signals, platformGate, counts, screener] = await Promise.all([
    getActiveSignals(),
    getPlatformStatsGate(),
    getSignalCounts(),
    getScreener(),
  ]);
  const example = signals[0] ?? null;
  const exampleEvents = example ? await getSignalEvents(example.signal_uid) : [];
  const gateReady = (platformGate.stats?.sample_size ?? 0) >= 30;

  // Join all 21 registered instruments with the live screener so the board
  // always renders 21 rows even if a particular instrument is missing from
  // the bot's response (rare; shows score "—").
  const screenerBySymbol = new Map(screener.map((s) => [s.symbol, s]));
  const board = INSTRUMENTS.map((i) => {
    const s = screenerBySymbol.get(i.symbol);
    return {
      symbol: i.symbol,
      display: i.display,
      slug: i.slug,
      assetClass: i.assetClass,
      score: s?.score ?? null,
      adx: s?.adx ?? null,
      direction: s?.direction ?? null,
      action: s?.action ?? null,
    };
  }).sort((a, b) => {
    const ar = ACTION_RANK[a.action] ?? 3;
    const br = ACTION_RANK[b.action] ?? 3;
    if (ar !== br) return ar - br;
    return (b.score ?? -1) - (a.score ?? -1);
  });

  return (
    <>
      <Breadcrumb items={[{ label: 'AI Trading' }]} />
      <div className="grid grid-cols-[224px_1fr]">
        <MarketsSidebar active="ai-trading" counts={counts.byClass} />

        <div className="min-w-0 space-y-8 px-6 py-4">
      {/* ── Hero ── */}
      <header>
        <p className="text-[11px] uppercase tracking-widest text-v2-accent">● Smart Asset Bot — Live</p>
        <h1 className="mt-2 font-v2-display text-3xl font-bold text-v2-text">AI Trading</h1>
        <p className="mt-3 text-sm leading-relaxed text-v2-text-muted">
          Smart Asset Bot scans <span className="v2-num text-v2-accent">{INSTRUMENTS.length}</span> instruments
          — forex, indices, gold and crypto — on a continuous scan cycle. A signal is a complete,
          immutable trade plan: direction, entry, stop loss, take profit and the reasoning behind it,
          published the moment a setup clears the quality gate and tracked automatically until it
          resolves.
        </p>
      </header>

      {/* ── TradeFlow Score guide ── */}
      <section>
        <h2 className="mb-3 font-v2-display text-lg font-semibold text-v2-text">TradeFlow Score guide</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-md border border-v2-line">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-v2-line text-[10px] uppercase tracking-wide text-v2-text-faint">
                  <th className="px-3 py-2 font-normal">Factor</th>
                  <th className="px-3 py-2 text-right font-normal">Weight</th>
                </tr>
              </thead>
              <tbody>
                {TFS_WEIGHTS.map(([name, w, hint]) => (
                  <tr key={name} className="border-b border-v2-line bg-v2-surface last:border-0" title={hint}>
                    <td className="px-3 py-2 text-v2-text-muted">{name}</td>
                    <td className="v2-num px-3 py-2 text-right text-v2-text">{w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2">
            {SCORE_BANDS.map((b) => (
              <div key={b.range} className="flex items-center justify-between rounded-md border border-v2-line bg-v2-surface px-4 py-2.5">
                <span className="v2-num text-sm text-v2-text">{b.range}</span>
                <span className={`text-xs font-medium ${b.cls}`}>{b.label}</span>
              </div>
            ))}
            <p className="text-[11px] leading-relaxed text-v2-text-faint">
              The publication gate is real: setups scoring below 70 are discarded by the bot and
              never appear anywhere on this site. Weights are locked and versioned (tfs_version 1) —
              every published signal records the version that scored it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Opportunity Board ── */}
      <section>
        <div className="mb-3">
          <h2 className="font-v2-display text-lg font-semibold text-v2-text">Opportunity Board</h2>
          <p className="mt-1 text-xs text-v2-text-muted">
            All {INSTRUMENTS.length} instruments ranked by TradeFlow Score™ — updates every 60 seconds.
          </p>
        </div>
        {screener.length === 0 ? (
          <p className="rounded-md border border-v2-line bg-v2-surface p-4 text-sm text-v2-text-muted">
            Scanner refreshes every 60s — data unavailable.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-v2-line">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_88px_88px_72px_88px] items-center gap-2 border-b border-v2-line bg-v2-surface px-3 py-2 text-[10px] uppercase tracking-wide text-v2-text-faint">
              <span>Instrument</span>
              <span>Direction</span>
              <span className="text-right">TFS</span>
              <span className="text-right">ADX</span>
              <span className="text-right">Action</span>
            </div>
            {board.map((r) => {
              const isTrade = r.action === 'TRADE';
              const adxLow = r.adx != null && r.adx < 25;
              return (
                <Link
                  key={r.symbol}
                  href={`/markets/${r.assetClass}/${r.slug}`}
                  className={`grid grid-cols-[1fr_88px_88px_72px_88px] items-center gap-2 border-b border-v2-line px-3 py-2 text-xs transition-colors last:border-0 ${
                    isTrade ? 'bg-v2-accent-soft hover:bg-v2-accent-soft' : 'hover:bg-v2-surface'
                  }`}
                >
                  <span className="font-medium text-v2-text">{r.display}</span>
                  <span
                    className={
                      r.direction === 'LONG'
                        ? 'text-v2-bullish'
                        : r.direction === 'SHORT'
                          ? 'text-v2-bearish'
                          : 'text-v2-text-faint'
                    }
                  >
                    {r.direction ?? '—'}
                  </span>
                  <span className="v2-num text-right font-bold text-v2-text">
                    {r.score != null ? r.score : '—'}
                  </span>
                  <span className={`v2-num text-right ${adxLow ? 'text-v2-bearish' : 'text-v2-text-muted'}`}>
                    {r.adx != null ? r.adx.toFixed(1) : '—'}
                  </span>
                  <span className="text-right">
                    {r.action === 'TRADE' && (
                      <span className="rounded bg-v2-bullish-soft px-1.5 py-0.5 text-[10px] font-medium text-v2-bullish">TRADE</span>
                    )}
                    {r.action === 'WATCH' && (
                      <span className="rounded border border-v2-line-strong px-1.5 py-0.5 text-[10px] font-medium text-v2-text-muted">WATCH</span>
                    )}
                    {(!r.action || r.action === 'AVOID') && (
                      <span className="text-[10px] text-v2-text-faint">—</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Methodology ── */}
      <section>
        <h2 className="mb-3 font-v2-display text-lg font-semibold text-v2-text">Methodology</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ['Entry modes', 'STANDARD enters at the current structure-aligned level. SWEEP waits for a liquidity sweep — a stop-run through a nearby level — before entering on the reclaim. The mode is recorded on every signal.'],
            ['Stops and targets', 'Stop losses are placed at structural invalidation points (e.g. below the structural low for longs) — the recorded sl_reason says where and why. Take profits are set so the risk:reward ratio is known and published up front.'],
            ['Outcome rules — conservative by design', 'First touch decides: whichever of TP or SL trades first closes the signal. If both fall within one polling interval and order is ambiguous, it is recorded as a stop-loss hit. A signal never reopens after closing.'],
            ['Invalidation and expiry', 'A signal whose setup breaks before entry triggers is INVALIDATED with a recorded reason. A signal that never triggers within 7 days EXPIRES. Both remain permanently in the public archive.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-md border border-v2-line bg-v2-surface p-4">
              <h3 className="font-v2-display text-sm font-semibold text-v2-text">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-v2-text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Signal lifecycle ── */}
      <section>
        <h2 className="mb-1 font-v2-display text-lg font-semibold text-v2-text">Signal lifecycle</h2>
        <p className="mb-3 text-xs text-v2-text-faint">
          Every signal moves through these states, recorded as append-only events.
          {example && (
            <>
              {' '}Below: the REAL current state of the most recent signal —{' '}
              <Link href={`/signals/${example.signal_uid}`} className="text-v2-accent hover:underline">
                {example.ticker} {example.direction}
              </Link>
              .
            </>
          )}
        </p>
        {example ? (
          <SignalJourney signal={example} events={exampleEvents} />
        ) : (
          <p className="text-sm text-v2-text-muted">No active signal to illustrate right now — the diagram renders from real events only.</p>
        )}
      </section>

      {/* ── Live proof ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-v2-display text-lg font-semibold text-v2-text">Live right now</h2>
          <Link href="/signals" className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent">All signals →</Link>
        </div>
        {signals.length === 0 ? (
          <p className="text-sm text-v2-text-muted">No active signals at the moment.</p>
        ) : (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
            {signals.slice(0, 4).map((s) => (
              <div key={s.signal_uid} className="w-60 shrink-0 snap-start md:w-auto">
                <SignalCard signal={s} classTag href={`/signals/${s.signal_uid}`} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 rounded-md border border-v2-line bg-v2-surface p-4">
          <div className="text-[10px] uppercase tracking-widest text-v2-text-faint">Platform performance — last 30 closed signals</div>
          {gateReady ? (
            <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-1.5 text-xs">
              {[
                ['Win rate', `${platformGate.stats.win_rate}%`],
                ['Avg realized R', platformGate.stats.avg_realized_rr],
                ['Net R', platformGate.stats.net_r],
                ['Sample', platformGate.stats.sample_size],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="text-v2-text-faint">{label}</dt>
                  <dd className="v2-num text-v2-text">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-v2-text-faint">
              Performance stats unlock at 30 closed signals —{' '}
              <span className="v2-num text-v2-text-muted">{platformGate.closedCount}/30</span> so far.
            </p>
          )}
        </div>
        <div className="mt-3"><RiskDisclaimer variant="compact" /></div>
      </section>

      {/* ── FAQ ── */}
      <section>
        <h2 className="mb-3 font-v2-display text-lg font-semibold text-v2-text">Honest questions, honest answers</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-md border border-v2-line bg-v2-surface px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-medium text-v2-text marker:hidden">
                {f.q}
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-v2-text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
        </div>
      </div>
    </>
  );
}
