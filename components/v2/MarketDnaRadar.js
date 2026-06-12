// components/v2/MarketDnaRadar.js — inline-SVG radar for the L3 "Market DNA"
// block (A-2; no chart library). Pure presentational: axis VALUES and their
// derivations live in the caller (AssetClassPage documents each axis — only
// honestly derivable axes are passed in; the spec rule "if an axis can't be
// derived honestly yet, render 4 axes" is enforced there).
//
// axes: [{ label, value 0..1, note }] — note feeds the <title> tooltip so the
// derivation is inspectable in the UI. Renders nothing below 3 axes (a 2-axis
// "radar" is a line and would be misleading).

export default function MarketDnaRadar({ axes = [], size = 230 }) {
  if (axes.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 34; // leave room for labels
  const n = axes.length;

  const point = (i, factor) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(angle) * r * factor, cy + Math.sin(angle) * r * factor];
  };
  const ring = (factor) =>
    Array.from({ length: n }, (_, i) => point(i, factor).map((v) => v.toFixed(1)).join(',')).join(' ');

  const valuePoly = axes
    .map((a, i) => point(i, Math.max(0.04, Math.min(1, a.value))).map((v) => v.toFixed(1)).join(','))
    .join(' ');

  return (
    <svg width={size} height={size} role="img" aria-label="Market DNA radar">
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="var(--v2-line)" strokeWidth="1" />
      ))}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1);
        return <line key={a.label} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--v2-line)" strokeWidth="1" />;
      })}
      <polygon points={valuePoly} fill="var(--v2-accent)" opacity="0.18" />
      <polygon points={valuePoly} fill="none" stroke="var(--v2-accent)" strokeWidth="1.5" />
      {axes.map((a, i) => {
        const [x, y] = point(i, 1.18);
        return (
          <text
            key={a.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="var(--v2-text-muted)"
          >
            <title>{a.note}</title>
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
