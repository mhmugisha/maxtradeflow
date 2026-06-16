// /v2/signals/[uid] — the immutable signal article per
// docs/mockups/Signal_Article.png (Phase A Session 3 Task 2). Server-rendered
// from the signals table by signal_uid; unknown/malformed uid → 404. The page
// content never changes after close (§0.3) — only the status banner reflects
// the recorded outcome.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInstrument, formatInstrumentPrice, displayFor } from '@/lib/instruments';
import {
  getSignalByUid, getSignalEvents, getArticleForSignal, getSignalCounts, UUID_RE,
} from '@/lib/v2-data';
import { looksLikeHtml, sanitizeAnalysisHtml, stripMarkdownArtifacts } from '@/lib/sanitize-analysis';
import { classMeta, l4Href } from '@/components/v2/assetClassMeta';
import Breadcrumb from '@/components/v2/Breadcrumb';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import SignalJourney from '@/components/v2/SignalJourney';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import { ArticleJsonLd } from '@/components/v2/JsonLd';

export const revalidate = 60;

// Documented mapping: reasons[] codes → human sentences (task 2). The bot
// usually sends a specific human label with each code (e.g. "ADX 30.6
// confirms directional momentum") — that REAL label is preferred; these
// sentences are the fallback when a label is missing. Codes per §A0-4.
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

const STATUS_BANNER = {
  GENERATED: { text: 'Awaiting entry trigger', cls: 'border-v2-line text-v2-text-muted' },
  TRIGGERED: { text: 'Signal active — outcome pending', cls: 'border-v2-line-strong bg-v2-accent-soft text-v2-accent' },
  ACTIVE: { text: 'Signal active — outcome pending', cls: 'border-v2-line-strong bg-v2-accent-soft text-v2-accent' },
  TP_HIT: { text: 'Outcome: Take Profit hit', cls: 'border-v2-bullish bg-v2-bullish-soft text-v2-bullish' },
  SL_HIT: { text: 'Outcome: Stop Loss hit', cls: 'border-v2-bearish bg-v2-bearish-soft text-v2-bearish' },
  EXPIRED: { text: 'Expired — entry was never triggered within 7 days', cls: 'border-v2-line text-v2-text-muted' },
  INVALIDATED: { text: 'Invalidated — withdrawn before entry', cls: 'border-v2-line text-v2-text-muted' },
};

const fmtDateLong = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '—';

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

function HeroBlock({ label, value, tone = 'text-v2-text', sub }) {
  return (
    <div className="rounded-md border border-v2-line bg-v2-surface px-4 py-3 text-center">
      <div className={`v2-num text-2xl font-semibold ${tone}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-widest text-v2-text-faint">{label}</div>
      {sub && <div className="text-[10px] text-v2-text-faint">{sub}</div>}
    </div>
  );
}

export default async function SignalArticlePage({ params }) {
  const { uid } = await params;
  if (!UUID_RE.test(uid)) notFound();

  const signal = await getSignalByUid(uid);
  if (!signal) notFound();

  const [events, article, counts] = await Promise.all([
    getSignalEvents(uid),
    getArticleForSignal(uid),
    getSignalCounts(),
  ]);

  const inst = getInstrument(signal.ticker);
  const cls = inst ? classMeta(inst.assetClass) : null;
  const long = signal.direction === 'LONG';
  const banner = STATUS_BANNER[signal.status] ?? STATUS_BANNER.GENERATED;
  const invalidation = events.find((e) => e.event_type === 'INVALIDATED')?.reason ?? null;
  const instrumentHref = l4Href(inst) ?? cls?.href ?? '/markets';
  const analysisBody = stripMarkdownArtifacts(article?.content);
  const analysisExcerpt = stripMarkdownArtifacts(article?.excerpt);

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

        <div className="min-w-0 space-y-8 px-6 py-6">
          <header className="space-y-3">
            <h1 className="font-v2-display text-2xl font-bold text-v2-text">
              {displayFor(signal.ticker)}{' '}
              <span className={long ? 'text-v2-bullish' : 'text-v2-bearish'}>{signal.direction}</span>{' '}
              — Smart Asset Bot Signal · {fmtDateLong(signal.generated_at)}
            </h1>
            <div className={`inline-block rounded border px-3 py-1.5 text-xs font-medium ${banner.cls}`}>
              {banner.text}
              {invalidation && <span className="font-normal"> — {invalidation}</span>}
            </div>
          </header>

          {/* ── Hero: TFS / direction / R:R / mode ── */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {signal.tradeflow_score != null ? (
              <HeroBlock label="TradeFlow Score" value={signal.tradeflow_score} tone="text-v2-accent" sub={signal.confidence != null ? `confidence ${signal.confidence}` : null} />
            ) : (
              <HeroBlock label="Score (legacy)" value={signal.score != null ? `${signal.score}/10` : '—'} tone="text-v2-accent" />
            )}
            <HeroBlock label="Direction" value={`${signal.direction} ${long ? '▲' : '▼'}`} tone={long ? 'text-v2-bullish' : 'text-v2-bearish'} />
            <HeroBlock label="Risk : Reward" value={signal.rr_ratio != null ? `1 : ${signal.rr_ratio}` : '—'} />
            <HeroBlock label="Entry mode" value={signal.entry_mode ?? '—'} tone="text-v2-text-muted" />
          </section>

          {/* ── Levels table ── */}
          <section className="overflow-hidden rounded-md border border-v2-line">
            <table className="w-full text-left text-sm">
              <tbody>
                {[
                  ['Entry', formatInstrumentPrice(signal.entry_price, signal.ticker), 'text-v2-text'],
                  ['Stop Loss', formatInstrumentPrice(signal.stop_loss, signal.ticker), 'text-v2-bearish'],
                  ['Take Profit', formatInstrumentPrice(signal.take_profit, signal.ticker), 'text-v2-bullish'],
                  ['ADX', signal.adx?.toFixed(1) ?? '—', 'text-v2-text'],
                  ['RSI', signal.rsi?.toFixed(1) ?? '—', 'text-v2-text'],
                ].map(([label, value, tone]) => (
                  <tr key={label} className="border-b border-v2-line bg-v2-surface last:border-0">
                    <td className="px-4 py-2.5 text-xs text-v2-text-muted">{label}</td>
                    <td className={`v2-num px-4 py-2.5 text-right ${tone}`}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── Why this signal exists ── */}
          <section>
            <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">
              Why this signal was generated
            </h2>
            {Array.isArray(signal.reasons) && signal.reasons.length > 0 ? (
              <ul className="space-y-2 rounded-md border border-v2-line bg-v2-surface p-4">
                {signal.reasons.map((r) => (
                  <li key={r.code} className="flex gap-2 text-sm text-v2-text-muted">
                    <span className="text-v2-accent">•</span>
                    <span>
                      {r.label ?? REASON_SENTENCES[r.code] ?? r.code}
                      <span className="ml-1.5 align-middle text-[10px] uppercase tracking-wide text-v2-text-faint">{r.code}</span>
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

          {/* ── Signal Journey ── */}
          <section>
            <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">Signal Journey</h2>
            <SignalJourney signal={signal} events={events} />
          </section>

          {/* ── Analysis: full article body, falling back to the excerpt for
                 rows without content, then to an honest "none published" line
                 (§0.2) — the box is never empty. ── */}
          <section>
            <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">Analysis</h2>
            <div className="rounded-md border border-v2-line bg-v2-surface p-4">
              {analysisBody ? (
                looksLikeHtml(analysisBody) ? (
                  <div
                    className="v2-prose"
                    dangerouslySetInnerHTML={{ __html: sanitizeAnalysisHtml(analysisBody) }}
                  />
                ) : (
                  <div className="v2-prose">
                    {analysisBody.split(/\n{2,}/).map((para, i) => (
                      <p key={i} className="whitespace-pre-line">{para}</p>
                    ))}
                  </div>
                )
              ) : analysisExcerpt ? (
                <p className="text-sm leading-relaxed text-v2-text-muted">{analysisExcerpt}</p>
              ) : (
                <p className="text-sm text-v2-text-muted">No analysis was published for this signal.</p>
              )}
              <div className="mt-3 text-right">
                <Link href={instrumentHref} className="text-xs text-v2-accent hover:underline">
                  View the {displayFor(signal.ticker)} instrument page →
                </Link>
              </div>
            </div>
          </section>

          <RiskDisclaimer variant="full" />
        </div>
      </div>
    </>
  );
}
