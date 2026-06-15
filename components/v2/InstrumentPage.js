// components/v2/InstrumentPage.js — reusable L4 template per
// docs/mockups/L4_Instrument.png (Phase A Session 3 Task 1). Instantiated by
// the five thin pages under app/(v2)/v2/markets/*. Server component; every
// number traces to lib/v2-data.js / lib/market-sessions.js (§0.2).
//
// Deviations from the mockup are deliberate and listed in the session
// summary (sidebar variant, decorative timeframe tabs, upcoming events).

import Link from 'next/link';
import { getInstrument, instrumentsByClass, formatInstrumentPrice } from '@/lib/instruments';
import {
  getActiveSignals, getSignalCounts, getDailyChanges, getChartData,
  getLatestSignalForInstrument, getSignalHistory, getSignalEvents,
  getInstrumentStatsGate, getArticleForSignal, getScreener,
} from '@/lib/v2-data';
import { sessionStatuses } from '@/lib/market-sessions';
import { stripMarkdownArtifacts } from '@/lib/sanitize-analysis';
import { classMeta } from './assetClassMeta';
import MarketsSidebar from './MarketsSidebar';
import SignalJourney from './SignalJourney';
import TradingViewChart from '../TradingViewChart';
import PctBadge from './PctBadge';
import LastUpdated from './LastUpdated';
import RiskDisclaimer from './RiskDisclaimer';
import UpcomingEvents from './UpcomingEvents';

// Factual instrument descriptions (task: what it is, sessions, drivers —
// no hype). Extend when copy is written for an instrument; the fallback in
// genericAbout() below covers anything not yet in this map.
const ABOUT = {
  EURUSD: 'EUR/USD is the exchange rate between the euro and the US dollar and the most traded currency pair in the world. Liquidity is deepest during the London and New York sessions, peaking in their overlap. Typical drivers are ECB and Federal Reserve policy, eurozone and US inflation prints, and US labor data.',
  GBPUSD: 'GBP/USD ("Cable") is the exchange rate between the British pound and the US dollar. It is most liquid during London hours and the London–New York overlap. Typical drivers are Bank of England policy, UK inflation and labor data, and broad US dollar flows.',
  XAUUSD: 'XAU/USD is the spot price of gold quoted in US dollars. It trades nearly around the clock during the week, with the heaviest volume in London and New York hours. Typical drivers are real interest rates, US dollar strength, risk sentiment, and central-bank buying.',
  NAS100: 'NAS100 tracks the NASDAQ-100 — the 100 largest non-financial companies on the Nasdaq exchange, heavily weighted toward technology. Trading is most active during the New York session. Typical drivers are large-cap tech earnings, US interest-rate expectations, and US macro data.',
  US500: 'US500 tracks the S&P 500 — roughly 500 of the largest US-listed companies and the most-followed broad US equity benchmark. Trading is most active during the New York session. Typical drivers are earnings breadth, Federal Reserve policy, and US macro data.',
};

// Per-class fallback when an instrument-specific entry hasn't been written
// yet. Honest and short — no fabricated specifics; the bot's gate is the only
// concrete claim because it's universally true for every scanned instrument.
function genericAbout(inst) {
  const d = inst.display;
  switch (inst.assetClass) {
    case 'forex':
      return `${d} is a foreign exchange pair. Liquidity is typically deepest during the London and New York sessions. Drivers vary by pair but commonly include central-bank policy on each side of the quote, inflation prints, and labor data.`;
    case 'indices':
      return `${d} is a stock index CFD. Trading is most active during its home equity session. Typical drivers are earnings, central-bank policy, and macro data from the underlying economy.`;
    case 'commodities':
      return `${d} is a commodity quoted in US dollars. Drivers commonly include physical supply and demand, the broad US dollar, and risk sentiment.`;
    case 'crypto':
      return `${d} is a cryptocurrency quoted in US dollars. Crypto trades 24/7 without a session structure. Typical drivers are crypto-market liquidity, regulatory news, and broader risk sentiment.`;
    default:
      return `${d} is scanned continuously by the Smart Asset Bot. Signal publication follows the gate: TradeFlow Score ≥ 70 and ADX ≥ 25.`;
  }
}

// Map an internal symbol to the ticker TradingView's public widget accepts.
// Working public feeds per class (kept narrow on purpose — these are the only
// classes lib/instruments.js registers):
//   forex        FX:EURUSD
//   indices      OANDA:SPX500USD / NAS100USD / US30USD (FOREXCOM:US500 etc.
//                404 on the public widget — verified 2026-06-15)
//   commodities  OANDA:XAUUSD             (same OANDA convention as v1)
//   crypto       BINANCE:BTCUSDT          (USDT is the deepest Binance market;
//                                          our USD-quoted symbols translate by
//                                          appending T)
function tradingViewSymbol(inst) {
  switch (inst.assetClass) {
    case 'forex': return `FX:${inst.symbol}`;
    case 'indices': {
      const indexMap = {
        'US500': 'OANDA:SPX500USD',
        'NAS100': 'OANDA:NAS100USD',
        'US30': 'OANDA:US30USD',
      };
      return indexMap[inst.symbol] ?? `OANDA:${inst.symbol}USD`;
    }
    case 'commodities': return `OANDA:${inst.symbol}`;
    case 'crypto': return `BINANCE:${inst.symbol}T`;
    default: return inst.symbol;
  }
}

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

export default async function InstrumentPage({ symbol }) {
  const inst = getInstrument(symbol);
  const cls = classMeta(inst.assetClass);

  const [signals, counts, changes, bars, latestSignal, statsGate, history, screener] = await Promise.all([
    getActiveSignals(),
    getSignalCounts(),
    getDailyChanges(),
    getChartData(symbol, 72),
    getLatestSignalForInstrument(symbol),
    getInstrumentStatsGate(symbol),
    getSignalHistory(symbol, 10),
    getScreener(),
  ]);
  const active = signals.find((s) => s.ticker === symbol) ?? null;
  const journeySignal = latestSignal;
  const [events, article] = await Promise.all([
    journeySignal ? getSignalEvents(journeySignal.signal_uid) : [],
    journeySignal ? getArticleForSignal(journeySignal.signal_uid) : null,
  ]);

  const change = changes[symbol] ?? null;
  const open = marketOpen(inst.assetClass);
  const analysisExcerpt = stripMarkdownArtifacts(article?.excerpt);

  // 24h high/low from real bars only (falls back to closes when the bot
  // didn't record highs/lows); null → "—".
  const dayBars = bars.filter((b) => Date.now() - new Date(b.ts).getTime() <= 24 * 3600_000);
  const highs = dayBars.map((b) => b.high ?? b.close).filter((v) => v != null);
  const lows = dayBars.map((b) => b.low ?? b.close).filter((v) => v != null);
  const hi24 = highs.length ? Math.max(...highs) : null;
  const lo24 = lows.length ? Math.min(...lows) : null;

  // Scanner rows: every instrument in the current asset class, joined with
  // the live screener, sorted TRADE → WATCH → AVOID (then by TFS desc within
  // each tier). Instruments the bot didn't return rank last with score —.
  const ACTION_RANK = { TRADE: 0, WATCH: 1, AVOID: 2 };
  const screenerBySymbol = new Map(screener.map((s) => [s.symbol, s]));
  const scannerRows = instrumentsByClass(inst.assetClass)
    .map((i) => {
      const s = screenerBySymbol.get(i.symbol);
      return {
        symbol: i.symbol,
        display: i.display,
        slug: i.slug,
        score: s?.score ?? null,
        direction: s?.direction ?? null,
        action: s?.action ?? null,
      };
    })
    .sort((a, b) => {
      const ar = ACTION_RANK[a.action] ?? 3;
      const br = ACTION_RANK[b.action] ?? 3;
      if (ar !== br) return ar - br;
      return (b.score ?? -1) - (a.score ?? -1);
    });

  const gateReady = (statsGate.stats?.sample_size ?? 0) >= 30;

  const breadcrumbItems = [
    { label: 'Markets', href: '/v2/markets' },
    { label: cls.name, href: cls.href },
    { label: inst.symbol },
  ];

  return (
    <>
      {/* ── 4-column edge-to-edge shell (feat/instrument-layout-v2) ──
          Cols: MarketsSidebar | Scanner | Chart | Signal details. Columns
          carry their own dividers; full viewport-fit via min-h-screen. */}
      <div className="grid grid-cols-[176px_216px_minmax(0,1fr)_216px]">
        {/* ── Col 1: existing left nav, flush to viewport edge ── */}
        <div>
          <MarketsSidebar active={inst.assetClass} counts={counts.byClass} />
        </div>

        {/* ── Col 2: breadcrumb + scanner ── */}
        <div className="flex min-w-0 flex-col border-l border-v2-line">
          <div className="border-b border-v2-line bg-v2-surface/60 px-3 py-2 text-[11px]">
            {breadcrumbItems.map((item, i) => {
              const last = i === breadcrumbItems.length - 1;
              return (
                <span key={item.label} className="inline">
                  {i > 0 && <span className="mx-1 text-v2-text-faint">›</span>}
                  {last || !item.href ? (
                    <span className={last ? 'text-v2-text' : 'text-v2-text-muted'}>{item.label}</span>
                  ) : (
                    <Link href={item.href} className="text-v2-text-muted hover:text-v2-accent">{item.label}</Link>
                  )}
                </span>
              );
            })}
          </div>
          <div className="px-3 pb-1.5 pt-3 text-[10px] uppercase tracking-widest text-v2-text-faint">
            Signal scanner — {cls.name}
          </div>
          {screener.length === 0 ? (
            <p className="px-3 py-2 text-[11px] text-v2-text-faint">
              Scanner unavailable — refreshes every 60s.
            </p>
          ) : (
            <div className="flex flex-col">
              {scannerRows.map((r) => {
                const isCurrent = r.symbol === inst.symbol;
                const href = `/v2/markets/${inst.assetClass}/${r.slug}`;
                return (
                  <Link
                    key={r.symbol}
                    href={href}
                    className={`flex items-center justify-between border-b border-v2-line px-3 py-2 transition-colors ${
                      isCurrent
                        ? 'border-l-2 border-l-v2-accent bg-v2-accent-soft'
                        : 'border-l-2 border-l-transparent hover:bg-v2-surface'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-v2-text">{r.display}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="v2-num text-[11px] text-v2-text-muted">{r.score != null ? r.score : '—'}</span>
                      {r.action === 'TRADE' && r.direction === 'LONG' && (
                        <span className="rounded bg-v2-bullish-soft px-1 py-0.5 text-[9px] font-medium text-v2-bullish">LONG</span>
                      )}
                      {r.action === 'TRADE' && r.direction === 'SHORT' && (
                        <span className="rounded bg-v2-bearish-soft px-1 py-0.5 text-[9px] font-medium text-v2-bearish">SHORT</span>
                      )}
                      {r.action === 'WATCH' && (
                        <span className="rounded border border-v2-line-strong px-1 py-0.5 text-[9px] font-medium text-v2-text-muted">WATCH</span>
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
        </div>

        {/* ── Col 3: chart column (top bar / stat chips / chart / active strip) ── */}
        <div className="flex min-w-0 flex-col border-l border-v2-line">
          {/* Row A: top bar */}
          <div className="flex items-center justify-between gap-4 border-b border-v2-line px-4 py-2.5">
            <div className="flex items-baseline gap-3">
              <span className="font-v2-display text-lg font-bold text-v2-text">{inst.display}</span>
              <span className="v2-num text-2xl font-semibold text-v2-text">
                {formatInstrumentPrice(change?.price, symbol)}
              </span>
              <PctBadge pct={change?.changePct ?? null} className="text-sm" />
              <LastUpdated timestamp={change?.lastTs} prefix="Last bar" />
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs ${
                  open ? 'border-v2-bullish/40 text-v2-bullish' : 'border-v2-line text-v2-text-faint'
                }`}
              >
                ● Market {open ? 'Open' : 'Closed'}
              </span>
              <span className="text-[10px] text-v2-text-faint">Powered by TradingView</span>
            </div>
          </div>

          {/* Row B: stat chips bar */}
          <div className="flex items-center gap-5 border-b border-v2-line px-4 py-1.5">
            {[
              ['24h High', formatInstrumentPrice(hi24, symbol)],
              ['24h Low', formatInstrumentPrice(lo24, symbol)],
              ['ADX', active?.adx != null ? active.adx.toFixed(1) : '—'],
              ['RSI', active?.rsi != null ? active.rsi.toFixed(1) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-1.5 text-[11px]">
                <span className="text-v2-text-faint">{label}</span>
                <span className="v2-num text-v2-text">{value}</span>
              </div>
            ))}
          </div>

          {/* Row C: chart */}
          <div className="min-w-0">
            <TradingViewChart symbol={tradingViewSymbol(inst)} interval="60" height={720} />
          </div>

          {/* Row D: active signal strip */}
          {active && (
            <div className="border-t border-v2-line px-4 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className={`text-xs font-semibold ${active.direction === 'LONG' ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
                    ● Active signal — {active.direction}
                  </span>
                  <span className="text-[11px] text-v2-text-faint">
                    {active.displayScore != null && <>TFS <span className="v2-num">{active.displayScore}{active.derived ? '*' : ''}</span> · </>}
                    ADX <span className="v2-num">{active.adx?.toFixed(1) ?? '—'}</span> ·
                    RSI <span className="v2-num">{active.rsi?.toFixed(1) ?? '—'}</span> · {fmtDate(active.generated_at)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    ['Entry', formatInstrumentPrice(active.entry_price, symbol), 'text-v2-text'],
                    ['SL', formatInstrumentPrice(active.stop_loss, symbol), 'text-v2-bearish'],
                    ['TP', formatInstrumentPrice(active.take_profit, symbol), 'text-v2-bullish'],
                    ['R:R', active.rr_ratio != null ? `1:${active.rr_ratio}` : '—', 'text-v2-accent'],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded border border-v2-line bg-v2-bg px-2 py-1">
                      <div className="text-[9px] text-v2-text-faint">{label}</div>
                      <div className={`v2-num text-xs ${tone}`}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Col 4: signal details panel ── */}
        <div className="flex min-w-0 flex-col border-l border-v2-line">
          <div className="border-b border-v2-line px-3 py-2 text-[10px] uppercase tracking-widest text-v2-text-faint">
            Signal details
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-3">
            {active ? (
              <>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-v2-display text-base font-bold text-v2-accent">{inst.display}</span>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-medium ${
                      active.direction === 'LONG'
                        ? 'border-v2-bullish bg-v2-bullish-soft text-v2-bullish'
                        : 'border-v2-bearish bg-v2-bearish-soft text-v2-bearish'
                    }`}
                  >
                    {active.direction}
                  </span>
                </div>

                {/* Large TFS + progress bar — hero number for this column */}
                {active.displayScore != null && (
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-medium text-v2-text-muted">TradeFlow Score™</span>
                      <span className="v2-num text-2xl font-bold text-v2-accent">
                        {active.displayScore}{active.derived ? '*' : ''}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded bg-v2-line">
                      <div
                        className="h-full bg-v2-accent"
                        style={{ width: `${Math.min(100, Math.max(0, active.displayScore))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Session / Duration / Confidence rows */}
                {[
                  ['Session', active.session],
                  ['Duration', active.expected_duration],
                  ['Confidence', active.confidence != null ? `${active.confidence}` : null],
                ].some(([, v]) => v != null) && (
                  <div className="space-y-1.5">
                    {[
                      ['Session', active.session],
                      ['Duration', active.expected_duration],
                      ['Confidence', active.confidence != null ? `${active.confidence}` : null],
                    ]
                      .filter(([, v]) => v != null)
                      .map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-[11px] text-v2-text-muted">{label}</span>
                          <span className="v2-num text-xs text-v2-text">{value}</span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Why this signal exists */}
                {Array.isArray(active.reasons) && active.reasons.length > 0 && (
                  <div className="border-t border-v2-line pt-3">
                    <div className="mb-1.5 text-[10px] uppercase tracking-widest text-v2-text-faint">
                      Why this signal exists
                    </div>
                    <ul className="space-y-1">
                      {active.reasons.map((r) => (
                        <li key={r.code} className="flex gap-1.5 text-[11px] leading-snug text-v2-text-muted">
                          <span className="text-v2-accent">•</span>
                          {r.label ?? r.code}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Performance */}
                <div className="border-t border-v2-line pt-3">
                  <div className="mb-1.5 text-[10px] uppercase tracking-widest text-v2-text-faint">Performance</div>
                  {gateReady ? (
                    <dl className="space-y-1 text-[11px]">
                      {[
                        ['Win rate', `${statsGate.stats.win_rate}%`],
                        ['Avg R', statsGate.stats.avg_realized_rr],
                        ['Net R', statsGate.stats.net_r],
                        ['Sample', `${statsGate.stats.sample_size}`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <dt className="text-v2-text-faint">{label}</dt>
                          <dd className="v2-num text-v2-text">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-[11px] leading-relaxed text-v2-text-faint">
                      Performance stats unlock at 30 closed signals —{' '}
                      <span className="v2-num text-v2-text-muted">{statsGate.closedCount}/30</span> so far.
                      No win-rate numbers are shown below that sample.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-[11px] leading-relaxed text-v2-text-faint">
                No active signal. This panel fills with TFS, confidence, session and reasons when one publishes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Below the fold: existing content kept for context, not in the
          edge-to-edge shell. Stacks below the 4-col viewport so scrolling
          reaches Journey / History / About / Analysis / Events. ── */}
      <div className="grid grid-cols-[176px_216px_minmax(0,1fr)_216px]">
        <div className="border-r border-v2-line" />
        <div className="border-r border-v2-line" />
        <div className="space-y-8 px-6 py-8">
        {!active && journeySignal && (
          <p className="text-sm text-v2-text-muted">
            No active signal on {inst.display} right now — last signal {fmtDate(journeySignal.generated_at)} (
            <Link href={`/v2/signals/${journeySignal.signal_uid}`} className="text-v2-accent hover:underline">view</Link>
            ).
          </p>
        )}

        {analysisExcerpt && (
          <section className="rounded-md border border-v2-line bg-v2-surface p-4">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-v2-text-faint">Analysis</div>
            <p className="text-sm leading-relaxed text-v2-text-muted">{analysisExcerpt}</p>
            {journeySignal && (
              <Link href={`/v2/signals/${journeySignal.signal_uid}`} className="mt-2 inline-block text-xs text-v2-accent hover:underline">
                Read full analysis →
              </Link>
            )}
          </section>
        )}

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

        <section>
          <h2 className="mb-2 font-v2-display text-base font-semibold text-v2-text">About {inst.display}</h2>
          <p className="text-sm leading-relaxed text-v2-text-muted">{ABOUT[symbol] ?? genericAbout(inst)}</p>
        </section>

        <section>
          <h2 className="mb-2 font-v2-display text-base font-semibold text-v2-text">Upcoming scheduled events</h2>
          <UpcomingEvents
            symbols={[symbol]}
            days={14}
            limit={3}
            emptyText={`No major scheduled events for ${inst.display} in the next 14 days.`}
          />
          <Link href="/v2/calendar" className="mt-2 inline-block text-[11px] text-v2-text-muted transition-colors hover:text-v2-accent">
            Full calendar →
          </Link>
        </section>

        <RiskDisclaimer variant="compact" />
        </div>
        <div className="border-l border-v2-line" />
      </div>
    </>
  );
}
