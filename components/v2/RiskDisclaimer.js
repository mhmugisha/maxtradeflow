// components/v2/RiskDisclaimer.js — compliance component (A-1 / §0.8).
// Required on every surface showing a signal, score, or performance stat.
//   compact — one line, for signal cards/pages
//   full    — footer block

const DISCLAIMER_TEXT =
  'Trading involves substantial risk of loss. Past performance does not indicate future results. Signals are informational, not financial advice.';

export default function RiskDisclaimer({ variant = 'compact' }) {
  if (variant === 'full') {
    return (
      <div className="rounded-md border border-v2-line bg-v2-surface px-4 py-3">
        <div className="mb-1 font-v2-display text-xs font-semibold tracking-wide text-v2-text-muted uppercase">
          Risk Disclaimer
        </div>
        <p className="text-xs leading-relaxed text-v2-text-faint">{DISCLAIMER_TEXT}</p>
      </div>
    );
  }
  return <p className="text-[11px] leading-snug text-v2-text-faint">{DISCLAIMER_TEXT}</p>;
}
