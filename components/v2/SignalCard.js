// components/v2/SignalCard.js — the premium signal card per the L2/L3
// mockups, extracted from the Session 1 preview (A-2). Pure server-safe
// component; accepts rows from lib/v2-data getActiveSignals() or raw signals
// rows (NUMERIC strings are coerced here).
//
// Score display honesty: shows the real tradeflow_score when present; pre-v2
// rows show legacy "Score n/10" instead — a derived ×10 number adds no
// information, so it is never presented as a TradeFlow Score.

import Link from 'next/link';
import { formatInstrumentPrice, displayFor } from '@/lib/instruments';
import RiskDisclaimer from './RiskDisclaimer';

const num = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function Row({ label, value, tone = 'text-v2-text' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-v2-text-muted">{label}</span>
      <span className={`v2-num text-sm ${tone}`}>{value}</span>
    </div>
  );
}

// detailed: adds the remaining v2 fields (confidence, market condition,
// session, expected duration, reasons) for the L4 Signal Details panel.
export default function SignalCard({ signal, href, classTag = false, showDisclaimer = false, detailed = false }) {
  if (!signal) return null;
  const long = signal.direction === 'LONG';
  const gold = signal.ticker === 'XAUUSD';
  const tfs = num(signal.tradeflow_score);
  const legacyScore = num(signal.score);
  const adx = num(signal.adx);
  const rr = num(signal.rr_ratio);
  const generatedAt = signal.generated_at ? new Date(signal.generated_at) : null;
  const dateLabel = generatedAt
    ? generatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '—';
  const assetClass = signal.assetClass ?? signal.asset_class;

  const body = (
    <div className="h-full rounded-md border border-v2-line bg-v2-surface p-4 transition-colors hover:border-v2-line-strong">
      {classTag && assetClass && (
        <div className="mb-1 text-[10px] uppercase tracking-widest text-v2-text-faint">
          {assetClass}
        </div>
      )}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={`font-v2-display text-base font-bold ${gold ? 'text-v2-gold' : 'text-v2-accent'}`}>
          {displayFor(signal.ticker)}
        </span>
        <span
          className={`rounded border px-2 py-0.5 text-[11px] font-medium ${
            long
              ? 'border-v2-bullish bg-v2-bullish-soft text-v2-bullish'
              : 'border-v2-bearish bg-v2-bearish-soft text-v2-bearish'
          }`}
        >
          {signal.direction}
        </span>
      </div>
      <div className="mb-3 text-[11px] text-v2-text-faint">
        {tfs != null
          ? <>TFS <span className="v2-num">{tfs}</span></>
          : <>Score <span className="v2-num">{legacyScore ?? '—'}/10</span></>}
        {' · '}ADX <span className="v2-num">{adx != null ? adx.toFixed(1) : '—'}</span>
        {' · '}{dateLabel}
      </div>
      <div className="space-y-1.5 border-t border-v2-line pt-3">
        <Row label="Entry" value={formatInstrumentPrice(signal.entry_price, signal.ticker)} />
        <Row label="SL" value={formatInstrumentPrice(signal.stop_loss, signal.ticker)} tone="text-v2-bearish" />
        <Row label="TP" value={formatInstrumentPrice(signal.take_profit, signal.ticker)} tone="text-v2-bullish" />
        <Row label="R:R" value={rr != null ? `1:${rr}` : '—'} />
      </div>
      {detailed && (
        <div className="mt-3 space-y-1.5 border-t border-v2-line pt-3">
          {[
            ['Confidence', signal.confidence != null ? `${num(signal.confidence)}` : null],
            ['Condition', signal.market_condition],
            ['Session', signal.session],
            ['Duration', signal.expected_duration],
          ]
            .filter(([, v]) => v != null)
            .map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-v2-text-muted">{label}</span>
                <span className="v2-num text-xs text-v2-text">{value}</span>
              </div>
            ))}
          {Array.isArray(signal.reasons) && signal.reasons.length > 0 && (
            <ul className="space-y-1 pt-1">
              {signal.reasons.map((r) => (
                <li key={r.code} className="flex gap-1.5 text-[11px] leading-snug text-v2-text-faint">
                  <span className="text-v2-accent">•</span>
                  {r.label ?? r.code}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {showDisclaimer && (
        <div className="mt-3 border-t border-v2-line pt-3">
          <RiskDisclaimer variant="compact" />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}
