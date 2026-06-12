// components/v2/Sparkline.js — dependency-free inline-SVG mini charts from
// price_snapshots close series (A-2: no chart library).
//
//   bars — the L3 instrument-card style per the mockup: one bar per close,
//          colored bullish/bearish vs the previous close
//   line — the L2 gold-spotlight style: stroke + soft area fill
//
// Pure (no hooks/state) so it renders in both server and client components.
// Empty/short series render an honest "no data" dash, never a fake flat line.

const TONES = {
  gold: 'var(--v2-gold)',
  accent: 'var(--v2-accent)',
};

export default function Sparkline({
  data = [],
  width = 96,
  height = 28,
  variant = 'bars',
  tone = 'accent',
  maxBars = 14,
}) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} aria-label="No price history yet">
        <line
          x1="4" y1={height / 2} x2={width - 4} y2={height / 2}
          stroke="var(--v2-text-faint)" strokeWidth="1" strokeDasharray="2 4"
        />
      </svg>
    );
  }

  const series = variant === 'bars' ? data.slice(-maxBars) : data;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;

  if (variant === 'line') {
    const stroke = TONES[tone] ?? TONES.accent;
    const pad = 2;
    const pts = series.map((v, i) => [
      pad + (i / (series.length - 1)) * (width - pad * 2),
      pad + (1 - (v - min) / span) * (height - pad * 2),
    ]);
    const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = `M${pts[0][0]},${height} L${poly.replace(/ /g, ' L')} L${pts[pts.length - 1][0]},${height} Z`;
    return (
      <svg width={width} height={height} aria-hidden>
        <path d={area} fill={stroke} opacity="0.12" />
        <polyline points={poly} fill="none" stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  }

  // bars
  const gap = 2;
  const barW = Math.max(2, (width - gap * (series.length - 1)) / series.length);
  return (
    <svg width={width} height={height} aria-hidden>
      {series.map((v, i) => {
        const h = Math.max(2, ((v - min) / span) * (height - 4) + 2);
        const up = i === 0 ? null : v >= series[i - 1];
        const fill =
          up == null ? 'var(--v2-text-faint)' : up ? 'var(--v2-bullish)' : 'var(--v2-bearish)';
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            rx="1"
            fill={fill}
            opacity="0.85"
          />
        );
      })}
    </svg>
  );
}
