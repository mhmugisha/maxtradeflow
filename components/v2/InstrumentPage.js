// components/v2/InstrumentPage.js — reusable L4 template per
// docs/mockups/L4_Instrument.png (Phase A Session 3 Task 1). Instantiated by
// the five thin pages under app/(v2)/v2/markets/*. Server component; every
// number traces to lib/v2-data.js / lib/market-sessions.js (§0.2).
//
// Deviations from the mockup are deliberate and listed in the session
// summary (sidebar variant, decorative timeframe tabs, upcoming events).

import Link from 'next/link';
import { getInstrument, formatInstrumentPrice, displayFor } from '@/lib/instruments';
import {
  getActiveSignals, getSignalCounts, getDailyChanges, getChartData,
  getLatestSignalForInstrument, getSignalHistory, getSignalEvents,
  getInstrumentStatsGate, getArticleForSignal,
} from '@/lib/v2-data';
import { sessionStatuses } from '@/lib/market-sessions';
import { classMeta, l4Href } from './assetClassMeta';
import Breadcrumb from './Breadcrumb';
import MarketsSidebar from './MarketsSidebar';
import SignalCard from './SignalCard';
import SignalJourney from './SignalJourney';
import PriceChart from './PriceChart';
import PctBadge from './PctBadge';
import LastUpdated from './LastUpdated';
import RiskDisclaimer from './RiskDisclaimer';

// Factual instrument descriptions (task: what it is, sessions, drivers —
// no hype). Extend when more L4 pages roll out.
const ABOUT = {
  EURUSD: 'EUR/USD is the exchange rate between the euro and the US dollar and the most traded currency pair in the world. Liquidity is deepest during the London and New York sessions, peaking in their overlap. Typical drivers are ECB and Federal Reserve policy, eurozone and US inflation prints, and US labor data.',
  GBPUSD: 'GBP/USD ("Cable") is the exchange rate between the British pound and the US dollar. It is most liquid during London hours and the London–New York overlap. Typical drivers are Bank of England policy, UK inflation and labor data, and broad US dollar flows.',
  XAUUSD: 'XAU/USD is the spot price of gold quoted in US dollars. It trades nearly around the clock during the week, with the heaviest volume in London and New York hours. Typical drivers are real interest rates, US dollar strength, risk sentiment, and central-bank buying.',
  NAS100: 'NAS100 tracks the NASDAQ-100 — the 100 largest non-financial companies on the Nasdaq exchange, heavily weighted toward technology. Trading is most active during the New York session. Typical drivers are large-cap tech earnings, US interest-rate expectations, and US macro data.',
  US500: 'US500 tracks the S&P 500 — roughly 500 of the largest US-listed companies and the most-followed broad US equity benchmark. Trading is most active during the New York session. Typical drivers are earnings breadth, Federal Reserve policy, and US macro data.',
};

// "Market open" approximation, documented: crypto trades 24/7; everything
// else here follows the FX/CFD week — open whenever any of the four session
// windows in lib/market-sessions.js is open (Sun 21:00 → Fri 21:00 UTC).
function marketOpen(assetClass) {
  if (assetClass === 'crypto') return true;
  return sessionStatuses().some((s) => s.open);
}

const OUTCOME_BADGE = {
  TP_HIT: { label: '✓ TP', cls: 'bg-v2-bullish-soft text-v2-bullish' },
  SL_HIT: { label: '✗ SL', cls: 'bg-v2-bearish-soft text-v2-bearish' },
  EXPIRED: { label: 'EXPIRED', cls: 'border border-v2-line text-v2-text-faint' },
  INVALIDATED: { label: 'INVALIDATED', cls: 'border border-v2-line text-v2-text-faint' },
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : '—';

function StatChip({ label, value, hint }) {
  return (
    <div className="rounded border border-v2-line bg-v2-surface px-2.5 py-1.5" title={hint}>
      <div className="text-[10px] text-v2-text-faint">{label}</div>
      <div className="v2-num text-xs text-v2-text">{value}</div>
    </div>
  );
}

export default async function InstrumentPage({ symbol }) {
  const inst = getInstrument(symbol);
  const cls = classMeta(inst.assetClass);

  const [signals, counts, changes, bars, latestSignal, statsGate, history] = await Promise.all([
    getActiveSignals(),
    getSignalCounts(),
    getDailyChanges(),
    getChartData(symbol, 72),
    getLatestSignalForInstrument(symbol),
    getInstrumentStatsGate(symbol),
    getSignalHistory(symbol, 10),
  ]);
  const active = signals.find((s) => s.ticker === symbol) ?? null;
  const journeySignal = latestSignal;
  const [events, article] = await Promise.all([
    journeySignal ? getSignalEvents(journeySignal.signal_uid) : [],
    journeySignal ? getArticleForSignal(journeySignal.signal_uid) : null,
  ]);

  const change = changes[symbol] ?? null;
  const open = marketOpen(inst.assetClass);

  // 24h high/low from real bars only (falls back to closes when the bot
  // didn't record highs/lows); null → "—".
  const dayBars = bars.filter((b) => Date.now() - new Date(b.ts).getTime() <= 24 * 3600_000);
  const highs = dayBars.map((b) => b.high ?? b.close).filter((v) => v != null);
  const lows = dayBars.map((b) => b.low ?? b.close).filter((v) => v != null);
  const hi24 = highs.length ? Math.max(...highs) : null;
  const lo24 = lows.length ? Math.min(...lows) : null;

  const levels = active
    ? [
        { label: 'TP', value: active.take_profit, tone: 'bullish' },
        { label: 'SL', value: active.stop_loss, tone: 'bearish' },
      ]
    : [];

  const gateReady = (statsGate.stats?.sample_size ?? 0) >= 30;

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Markets', href: '/v2/markets' },
          { label: cls.name, href: cls.href },
          { label: inst.symbol },
        ]}
      />
      <div className="mx-auto flex max-w-7xl gap-6 px-4">
        <MarketsSidebar active={inst.assetClass} counts={counts.byClass} />

        <div className="min-w-0 flex-1 py-6">
          {/* ── Header ── */}
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-v2-display text-2xl font-bold text-v2-text">{inst.symbol}</h1>
                <span className="text-sm text-v2-text-faint">{inst.name}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="v2-num text-3xl font-semibold text-v2-text">
                  {formatInstrumentPrice(change?.price, symbol)}
                </span>
                <PctBadge pct={change?.changePct ?? null} className="text-sm" />
                <LastUpdated timestamp={change?.lastTs} prefix="Last bar" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatChip label="24h High" value={formatInstrumentPrice(hi24, symbol)} />
                <StatChip label="24h Low" value={formatInstrumentPrice(lo24, symbol)} />
                <StatChip
                  label="ADX (latest signal)"
                  value={active?.adx != null ? active.adx.toFixed(1) : '—'}
                  hint="From the instrument's active signal — not a live indicator feed"
                />
                <StatChip
                  label="RSI (latest signal)"
                  value={active?.rsi != null ? active.rsi.toFixed(1) : '—'}
                  hint="From the instrument's active signal — not a live indicator feed"
                />
              </div>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs ${
                open ? 'border-v2-bullish/40 text-v2-bullish' : 'border-v2-line text-v2-text-faint'
              }`}
            >
              ● Market {open ? 'Open' : 'Closed'}
            </span>
          </header>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* ── Main column ── */}
            <div className="min-w-0 flex-1 space-y-8">
              <section className="rounded-md border border-v2-line bg-v2-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded border border-v2-line-strong bg-v2-accent-soft px-2 py-0.5 text-[11px] text-v2-accent">1H</span>
                  <span className="text-[11px] text-v2-text-faint">1h bars · last 72h · UTC</span>
                </div>
                <PriceChart bars={bars} symbol={symbol} levels={levels} />
              </section>

              {/* Active signal strip */}
              {active ? (
                <section className="rounded-md border border-v2-line bg-v2-surface px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-xs font-medium ${active.direction === 'LONG' ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
                      ● Active Signal — {active.direction}
                    </span>
                    <span className="text-[11px] text-v2-text-faint">
                      {active.displayScore != null && <>TFS <span className="v2-num">{active.displayScore}{active.derived ? '*' : ''}</span> · </>}
                      ADX <span className="v2-num">{active.adx?.toFixed(1) ?? '—'}</span> ·
                      RSI <span className="v2-num">{active.rsi?.toFixed(1) ?? '—'}</span> · {fmtDate(active.generated_at)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {[
                      ['Entry', formatInstrumentPrice(active.entry_price, symbol), 'text-v2-text'],
                      ['Stop Loss', formatInstrumentPrice(active.stop_loss, symbol), 'text-v2-bearish'],
                      ['Take Profit', formatInstrumentPrice(active.take_profit, symbol), 'text-v2-bullish'],
                      ['R:R Ratio', active.rr_ratio != null ? `1 : ${active.rr_ratio}` : '—', 'text-v2-accent'],
                    ].map(([label, value, tone]) => (
                      <div key={label} className="rounded border border-v2-line bg-v2-bg px-2.5 py-1.5">
                        <div className="text-[10px] text-v2-text-faint">{label}</div>
                        <div className={`v2-num text-sm ${tone}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="rounded-md border border-v2-line bg-v2-surface px-4 py-3 text-sm text-v2-text-muted">
                  No active signal on {inst.display} right now
                  {journeySignal && (
                    <>
                      {' '}— last signal {fmtDate(journeySignal.generated_at)} (
                      <Link href={`/v2/signals/${journeySignal.signal_uid}`} className="text-v2-accent hover:underline">
                        view
                      </Link>
                      )
                    </>
                  )}
                  .
                </section>
              )}

              {/* Analysis excerpt from the signal's article */}
              {article?.excerpt && (
                <section className="rounded-md border border-v2-line bg-v2-surface p-4">
                  <div className="mb-2 text-[10px] uppercase tracking-widest text-v2-text-faint">Analysis</div>
                  <p className="text-sm leading-relaxed text-v2-text-muted">{article.excerpt}</p>
                  {journeySignal && (
                    <Link href={`/v2/signals/${journeySignal.signal_uid}`} className="mt-2 inline-block text-xs text-v2-accent hover:underline">
                      Read full analysis →
                    </Link>
                  )}
                </section>
              )}

              {/* Signal Journey */}
              {journeySignal && (
                <section>
                  <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">
                    Signal Journey
                    <span className="ml-2 text-xs font-normal text-v2-text-faint">
                      latest signal · {fmtDate(journeySignal.generated_at)} {journeySignal.direction}
                    </span>
                  </h2>
                  <SignalJourney signal={journeySignal} events={events} />
                </section>
              )}

              {/* Signal History */}
              <section>
                <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">Signal History</h2>
                {history.length === 0 ? (
                  <p className="text-sm text-v2-text-muted">
                    No completed signals yet — outcome tracking began June 2026.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-v2-line">
                    <table className="w-full min-w-120 text-left text-xs">
                      <thead>
                        <tr className="border-b border-v2-line text-[10px] uppercase tracking-wide text-v2-text-faint">
                          <th className="px-3 py-2 font-normal">Date</th>
                          <th className="px-3 py-2 font-normal">Direction</th>
                          <th className="px-3 py-2 font-normal">Score</th>
                          <th className="px-3 py-2 font-normal">Entry</th>
                          <th className="px-3 py-2 font-normal">Outcome</th>
                          <th className="px-3 py-2 font-normal">R</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h) => {
                          const badge = OUTCOME_BADGE[h.status] ?? OUTCOME_BADGE.EXPIRED;
                          return (
                            <tr key={h.signal_uid} className="border-b border-v2-line last:border-0">
                              <td className="v2-num px-3 py-2 text-v2-text-muted">{fmtDate(h.generated_at)}</td>
                              <td className={`px-3 py-2 font-medium ${h.direction === 'LONG' ? 'text-v2-bullish' : 'text-v2-bearish'}`}>{h.direction}</td>
                              <td className="v2-num px-3 py-2 text-v2-text-muted">
                                {h.tradeflow_score != null ? h.tradeflow_score : h.score != null ? `${h.score}/10` : '—'}
                              </td>
                              <td className="v2-num px-3 py-2 text-v2-text">{formatInstrumentPrice(h.entry_price, symbol)}</td>
                              <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] ${badge.cls}`}>{badge.label}</span></td>
                              <td className={`v2-num px-3 py-2 ${h.realizedR == null ? 'text-v2-text-faint' : h.realizedR >= 0 ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
                                {h.realizedR == null ? '—' : `${h.realizedR > 0 ? '+' : ''}${h.realizedR}R`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* About */}
              <section>
                <h2 className="mb-2 font-v2-display text-base font-semibold text-v2-text">About {inst.display}</h2>
                <p className="text-sm leading-relaxed text-v2-text-muted">{ABOUT[symbol]}</p>
              </section>

              <RiskDisclaimer variant="compact" />
            </div>

            {/* ── Right rail ── */}
            <aside className="w-full shrink-0 space-y-6 lg:w-72">
              <section>
                <h2 className="mb-2 font-v2-display text-sm font-semibold text-v2-text">Signal Details</h2>
                {active ? (
                  <SignalCard signal={active} detailed href={`/v2/signals/${active.signal_uid}`} />
                ) : (
                  <div className="rounded-md border border-v2-line bg-v2-surface p-4 text-xs text-v2-text-faint">
                    No active signal. This panel fills with full signal details (TFS, confidence,
                    market condition, reasons) when one publishes.
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-2 font-v2-display text-sm font-semibold text-v2-text">
                  Performance — last 30 signals
                </h2>
                <div className="rounded-md border border-v2-line bg-v2-surface p-4">
                  {gateReady ? (
                    <dl className="space-y-1.5 text-xs">
                      {[
                        ['Win rate', `${statsGate.stats.win_rate}%`],
                        ['Avg realized R', statsGate.stats.avg_realized_rr],
                        ['Net R', statsGate.stats.net_r],
                        ['Avg hold', statsGate.stats.avg_hold_minutes != null ? `${Math.round(statsGate.stats.avg_hold_minutes / 60)}h` : '—'],
                        ['Sample', `${statsGate.stats.sample_size} closed signals`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <dt className="text-v2-text-faint">{label}</dt>
                          <dd className="v2-num text-v2-text">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-xs leading-relaxed text-v2-text-faint">
                      Performance stats unlock at 30 closed signals —{' '}
                      <span className="v2-num text-v2-text-muted">{statsGate.closedCount}/30</span> so far.
                      No win-rate numbers are shown below that sample.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="mb-2 font-v2-display text-sm font-semibold text-v2-text">Related instruments</h2>
                <div className="space-y-1.5">
                  {inst.related.map((relSym) => {
                    const rel = getInstrument(relSym);
                    const relChange = changes[relSym] ?? null;
                    const href = l4Href(rel);
                    const row = (
                      <div className="flex items-center justify-between rounded-md border border-v2-line bg-v2-surface px-3 py-2">
                        <span className="text-xs font-medium text-v2-text">{rel?.display ?? relSym}</span>
                        <span className="flex items-center gap-2">
                          <span className="v2-num text-xs text-v2-text-muted">{formatInstrumentPrice(relChange?.price, relSym)}</span>
                          <PctBadge pct={relChange?.changePct ?? null} className="text-[10px]" />
                        </span>
                      </div>
                    );
                    return href ? (
                      <Link key={relSym} href={href} className="block transition-opacity hover:opacity-80">{row}</Link>
                    ) : (
                      <div key={relSym} title="Instrument page coming with the full L4 rollout">{row}</div>
                    );
                  })}
                </div>
              </section>

              <div className="rounded-md border border-dashed border-v2-line p-3 text-[11px] text-v2-text-faint">
                Upcoming economic events for {inst.display} land here in Session 4.
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
