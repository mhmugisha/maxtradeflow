// /signals/[uid] — the immutable signal article. Server-rendered from the
// signals table by signal_uid; unknown/malformed uid → 404. Content never
// changes after close (§0.3) — only the status chip reflects the outcome.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInstrument, formatInstrumentPrice, displayFor } from '@/lib/instruments';
import {
  getSignalByUid, getSignalEvents, getActiveSignals, getSignalCounts, UUID_RE,
} from '@/lib/v2-data';
import { classMeta, l4Href } from '@/components/v2/assetClassMeta';
import Breadcrumb from '@/components/v2/Breadcrumb';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import SignalJourney from '@/components/v2/SignalJourney';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import { ArticleJsonLd } from '@/components/v2/JsonLd';
import TradingViewChart from '@/components/TradingViewChart';

export const revalidate = 60;

// Bot-supplied reason labels are preferred when present (e.g. "ADX 30.6
// confirms directional momentum"); these are the fallback for missing
// labels. Codes per §A0-4.
const REASON_SENTENCES = {
  TREND_ALIGNED: 'Price is moving with the prevailing trend across the scanned timeframes.',
  EMA_STACK: 'The EMAs are stacked in trend order, confirming directional structure.',
  ADX_THRESHOLD: 'ADX is above the momentum threshold, confirming directional strength.',
  RSI_FAVORABLE: 'RSI sits in a favorable zone for this direction without being overextended.',
  LIQUIDITY_SWEEP: 'A liquidity sweep preceded entry, clearing resting stops before the move.',
  SESSION_MOMENTUM: 'The setup formed during a high-momentum trading session.',
  STRUCTURE_ENTRY: 'The entry aligns with a defined structural level.',
  VOLATILITY_OK: 'Volatility is within a tradable range for the strategy.',
};

const STATUS_CHIP = {
  GENERATED: { text: 'Awaiting entry trigger', cls: 'border-v2-line text-v2-text-muted' },
  TRIGGERED: { text: 'Active', cls: 'border-v2-line-strong bg-v2-accent-soft text-v2-accent' },
  ACTIVE: { text: 'Active', cls: 'border-v2-line-strong bg-v2-accent-soft text-v2-accent' },
  TP_HIT: { text: 'Closed — TP hit', cls: 'border-v2-bullish bg-v2-bullish-soft text-v2-bullish' },
  SL_HIT: { text: 'Closed — SL hit', cls: 'border-v2-bearish bg-v2-bearish-soft text-v2-bearish' },
  EXPIRED: { text: 'Closed — expired', cls: 'border-v2-line text-v2-text-muted' },
  INVALIDATED: { text: 'Closed — invalidated', cls: 'border-v2-line text-v2-text-muted' },
};

function tierFor(score) {
  if (score == null) return null;
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Moderate';
  return 'Watch';
}

// TradingView symbol mapping — mirrors components/v2/InstrumentPage.js so the
// signal article shows the same chart conventions as the L4 instrument page.
function tradingViewSymbol(inst) {
  if (!inst) return null;
  switch (inst.assetClass) {
    case 'forex': return `FX:${inst.symbol}`;
    case 'indices': {
      const indexMap = { US500: 'OANDA:SPX500USD', NAS100: 'OANDA:NAS100USD', US30: 'OANDA:US30USD' };
      return indexMap[inst.symbol] ?? `OANDA:${inst.symbol}USD`;
    }
    case 'commodities': return `OANDA:${inst.symbol}`;
    case 'crypto': return `BINANCE:${inst.symbol}T`;
    default: return inst.symbol;
  }
}

const fmtDateLong = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '—';

const fmtShortDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : '—';

const fmtTimeUtc = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
};

export async function generateMetadata({ params }) {
  const { uid } = await params;
  if (!UUID_RE.test(uid)) return { title: 'Signal not found — MaxTradeFlow' };
  const signal = await getSignalByUid(uid);
  if (!signal) return { title: 'Signal not found — MaxTradeFlow' };
  return {
    title: `${displayFor(signal.ticker)} ${signal.direction} — Smart Asset Bot Signal, ${fmtDateLong(signal.generated_at)} — MaxTradeFlow`,
    description: `${displayFor(signal.ticker)} ${signal.direction} signal: entry ${signal.entry_price}, SL ${signal.stop_loss}, TP ${signal.take_profit}, R:R 1:${signal.rr_ratio ?? '—'}. Full reasoning and lifecycle.`,
  };
}

function StatRow({ label, value, tone = 'text-v2-text' }) {
  return (
    <div className="flex items-center justify-between border-b border-v2-line py-2 last:border-0">
      <span className="text-xs text-v2-text-muted">{label}</span>
      <span className={`v2-num text-sm font-medium ${tone}`}>{value}</span>
    </div>
  );
}

function RelatedSignalCard({ signal }) {
  const long = signal.direction === 'LONG';
  const tfs = signal.tradeflow_score ?? signal.displayScore;
  return (
    <div className="rounded-md border border-v2-line bg-v2-surface p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-v2-text">{displayFor(signal.ticker)}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
            long ? 'bg-v2-bullish-soft text-v2-bullish' : 'bg-v2-bearish-soft text-v2-bearish'
          }`}
        >
          {signal.direction}
        </span>
      </div>
      <div className="v2-num mb-2 text-[10px] text-v2-text-faint">
        TFS {tfs ?? '—'} · ADX {signal.adx != null ? Number(signal.adx).toFixed(1) : '—'} · {fmtShortDate(signal.generated_at)}
      </div>
      <dl className="space-y-0.5">
        <div className="flex items-center justify-between">
          <dt className="text-[11px] text-v2-text-muted">Entry</dt>
          <dd className="v2-num text-[11px] text-v2-text">{formatInstrumentPrice(signal.entry_price, signal.ticker)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[11px] text-v2-text-muted">SL</dt>
          <dd className="v2-num text-[11px] text-v2-bearish">{formatInstrumentPrice(signal.stop_loss, signal.ticker)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[11px] text-v2-text-muted">TP</dt>
          <dd className="v2-num text-[11px] text-v2-bullish">{formatInstrumentPrice(signal.take_profit, signal.ticker)}</dd>
        </div>
      </dl>
      <Link href={`/signals/${signal.signal_uid}`} className="mt-2 inline-block text-[11px] text-v2-accent hover:underline">
        View signal →
      </Link>
    </div>
  );
}

export default async function SignalArticlePage({ params }) {
  const { uid } = await params;
  if (!UUID_RE.test(uid)) notFound();

  const signal = await getSignalByUid(uid);
  if (!signal) notFound();

  const [events, counts, activeSignals] = await Promise.all([
    getSignalEvents(uid),
    getSignalCounts(),
    getActiveSignals(),
  ]);

  const inst = getInstrument(signal.ticker);
  const cls = inst ? classMeta(inst.assetClass) : null;
  const long = signal.direction === 'LONG';
  const chip = STATUS_CHIP[signal.status] ?? STATUS_CHIP.GENERATED;
  const invalidation = events.find((e) => e.event_type === 'INVALIDATED')?.reason ?? null;
  const instrumentHref = l4Href(inst) ?? cls?.href ?? '/markets';
  const tvSymbol = tradingViewSymbol(inst);
  const displayScore = signal.tradeflow_score ?? signal.displayScore;
  const tier = tierFor(displayScore);

  const relatedSignals = activeSignals
    .filter((s) => s.signal_uid !== uid)
    .sort((a, b) => new Date(b.generated_at ?? 0) - new Date(a.generated_at ?? 0))
    .slice(0, 3);

  return (
    <>
      <ArticleJsonLd signal={signal} path={`/signals/${uid}`} />
      <Breadcrumb
        items={[
          { label: 'Markets', href: '/markets' },
          ...(cls ? [{ label: cls.name, href: cls.href }] : []),
          { label: `${signal.ticker} signal · ${fmtDateLong(signal.generated_at)}` },
        ]}
      />
      <div className="grid grid-cols-[224px_1fr]">
        <MarketsSidebar active={inst?.assetClass ?? 'overview'} counts={counts.byClass} />

        <div className="flex min-w-0 gap-0">
          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-8 px-6 py-6">
            {/* 1. Header */}
            <header className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-v2-display text-2xl font-bold text-v2-text">
                  {displayFor(signal.ticker)}
                </h1>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    long ? 'bg-v2-bullish-soft text-v2-bullish' : 'bg-v2-bearish-soft text-v2-bearish'
                  }`}
                >
                  {signal.direction} {long ? '▲' : '▼'}
                </span>
                <span className={`rounded border px-2 py-0.5 text-xs font-medium ${chip.cls}`}>
                  {chip.text}
                  {invalidation && <span className="font-normal"> — {invalidation}</span>}
                </span>
              </div>
              <p className="text-xs text-v2-text-muted">
                Smart Asset Bot Signal · {fmtDateLong(signal.generated_at)} · <span className="v2-num">{fmtTimeUtc(signal.generated_at)}</span>
              </p>
            </header>

            {/* 2. Hero row */}
            <section className="grid grid-cols-[auto_1fr] gap-4">
              {/* TFS block */}
              <div className="flex w-44 flex-col items-center justify-center rounded-md border border-v2-line bg-v2-surface px-4 py-5 text-center">
                <div className="text-[10px] uppercase tracking-widest text-v2-text-faint">
                  TradeFlow Score™
                </div>
                <div className="v2-num mt-1 text-5xl font-semibold text-v2-accent">
                  {displayScore ?? '—'}
                </div>
                {(signal.confidence != null || tier) && (
                  <div className="mt-1 text-[11px] text-v2-text-muted">
                    {signal.confidence != null && <>Confidence <span className="v2-num text-v2-text">{signal.confidence}</span></>}
                    {signal.confidence != null && tier && ' · '}
                    {tier}
                  </div>
                )}
              </div>

              {/* Stats block — two columns */}
              <div className="rounded-md border border-v2-line bg-v2-surface px-4 py-3">
                <div className="grid gap-x-6 md:grid-cols-2">
                  <div>
                    <StatRow label="Entry" value={formatInstrumentPrice(signal.entry_price, signal.ticker)} />
                    <StatRow label="Stop Loss" value={formatInstrumentPrice(signal.stop_loss, signal.ticker)} tone="text-v2-bearish" />
                    <StatRow label="Take Profit" value={formatInstrumentPrice(signal.take_profit, signal.ticker)} tone="text-v2-bullish" />
                  </div>
                  <div>
                    <StatRow
                      label="R:R Ratio"
                      value={signal.rr_ratio != null ? `1 : ${signal.rr_ratio}` : '—'}
                      tone="text-v2-accent"
                    />
                    <StatRow label="ADX" value={signal.adx != null ? Number(signal.adx).toFixed(1) : '—'} />
                    <StatRow label="Entry Mode" value={signal.entry_mode ?? '—'} tone="text-v2-text-muted" />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Chart */}
            {tvSymbol && (
              <section className="overflow-hidden rounded-md border border-v2-line bg-v2-surface">
                <div className="flex items-center justify-between border-b border-v2-line px-4 py-2">
                  <span className="text-xs font-medium text-v2-text">
                    {displayFor(signal.ticker)} · 1H Chart
                  </span>
                  <span className="text-[10px] text-v2-text-faint">Powered by TradingView</span>
                </div>
                <TradingViewChart symbol={tvSymbol} interval="60" height={300} />
              </section>
            )}

            {/* 4. Why this signal was generated */}
            <section>
              <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">
                Why this signal was generated
              </h2>
              {Array.isArray(signal.reasons) && signal.reasons.length > 0 ? (
                <ul className="space-y-2 rounded-md border border-v2-line bg-v2-surface p-4">
                  {signal.reasons.map((r) => (
                    <li key={r.code} className="flex items-start justify-between gap-3 text-sm text-v2-text-muted">
                      <span className="flex min-w-0 gap-2">
                        <span className="text-v2-accent">•</span>
                        <span>{r.label ?? REASON_SENTENCES[r.code] ?? r.code}</span>
                      </span>
                      <span className="shrink-0 rounded border border-v2-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-v2-text-faint">
                        {r.code}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-v2-text-muted">
                  This signal predates structured reasoning capture (pre-v2) — no reasons were
                  recorded, and none are reconstructed after the fact.
                </p>
              )}
              {(signal.market_condition || signal.session || signal.expected_duration) && (
                <p className="mt-3 text-xs text-v2-text-faint">
                  Context at generation:{' '}
                  {[
                    signal.market_condition && `${signal.market_condition} market`,
                    signal.session && `${signal.session} session`,
                    signal.expected_duration && `expected duration ${signal.expected_duration}`,
                  ].filter(Boolean).join(' · ')}
                  {signal.sl_reason && <> · stop placed {signal.sl_reason}</>}
                </p>
              )}
            </section>

            {/* 5. Signal Journey */}
            <section>
              <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">Signal Journey</h2>
              <SignalJourney signal={signal} events={events} />
            </section>

            <RiskDisclaimer variant="compact" />
          </div>

          {/* ── Right sidebar ── */}
          <aside className="w-56 shrink-0 space-y-4 border-l border-v2-line px-4 py-6">
            <div>
              <h2 className="mb-3 text-[10px] uppercase tracking-widest text-v2-text-faint">
                Related signals
              </h2>
              {relatedSignals.length === 0 ? (
                <p className="text-xs text-v2-text-faint">No other active signals right now.</p>
              ) : (
                <div className="space-y-3">
                  {relatedSignals.map((s) => (
                    <RelatedSignalCard key={s.signal_uid} signal={s} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-v2-line bg-v2-surface p-3">
              <div className="text-[10px] uppercase tracking-widest text-v2-text-faint">Instrument page</div>
              <div className="mt-1 font-v2-display text-sm font-semibold text-v2-text">{displayFor(signal.ticker)}</div>
              {cls && <div className="text-[11px] text-v2-text-muted">{cls.name}</div>}
              <Link href={instrumentHref} className="mt-2 inline-block text-[11px] text-v2-accent hover:underline">
                View full instrument page →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
