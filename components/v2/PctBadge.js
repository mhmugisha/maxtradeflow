// components/v2/PctBadge.js — daily % change with ▲/▼, or an honest "—" when
// changePct is null (insufficient snapshot history — never rendered as 0).

export function fmtPct(pct) {
  if (pct == null) return null;
  return { text: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`, up: pct >= 0 };
}

export default function PctBadge({ pct, className = 'text-xs' }) {
  const f = fmtPct(pct);
  if (!f) return <span className={`v2-num ${className} text-v2-text-faint`}>—</span>;
  return (
    <span className={`v2-num ${className} ${f.up ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
      {f.up ? '▲' : '▼'} {f.text}
    </span>
  );
}
