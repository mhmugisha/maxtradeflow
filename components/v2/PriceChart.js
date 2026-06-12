// components/v2/PriceChart.js — L4 price chart per L4_Instrument.png: inline
// SVG from price_snapshots 1h bars, no chart library (A-2). Pure server-safe
// component.
//
// Honesty rules:
//   - x position is the bar's REAL timestamp, so missing bars leave visible
//     spatial gaps, and the line additionally BREAKS where consecutive bars
//     are more than GAP_MIN apart — gaps are never interpolated over.
//   - level lines (TP/SL) extend the y-domain so they are always visible.
//
// props: bars [{ts, close}], symbol (for price formatting), levels
// [{label, value, tone: 'bullish'|'bearish'}].

import { formatInstrumentPrice } from '@/lib/instruments';

const GAP_MIN = 90; // minutes — beyond this the line breaks

const TONE = {
  bullish: 'var(--v2-bullish)',
  bearish: 'var(--v2-bearish)',
};

export default function PriceChart({ bars = [], symbol, levels = [], width = 720, height = 260 }) {
  const pts = bars.filter((b) => b.close != null && b.ts);
  if (pts.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-v2-line bg-v2-bg text-sm text-v2-text-faint">
        Not enough price history to chart yet — 1h bars accumulate continuously.
      </div>
    );
  }

  const padL = 56;
  const padR = 64;
  const padY = 18;
  const padB = 30;

  const t0 = new Date(pts[0].ts).getTime();
  const t1 = new Date(pts[pts.length - 1].ts).getTime();
  const values = [...pts.map((p) => p.close), ...levels.map((l) => l.value).filter((v) => v != null)];
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  const padV = (hi - lo || Math.abs(hi) * 0.001 || 1) * 0.06;
  lo -= padV;
  hi += padV;

  const x = (ts) => padL + ((new Date(ts).getTime() - t0) / (t1 - t0 || 1)) * (width - padL - padR);
  const y = (v) => padY + (1 - (v - lo) / (hi - lo)) * (height - padY - padB);

  // Split into segments at gaps so missing hours are not drawn over.
  const segments = [];
  let current = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const dtMin = (new Date(pts[i].ts) - new Date(pts[i - 1].ts)) / 60000;
    if (dtMin > GAP_MIN) {
      segments.push(current);
      current = [];
    }
    current.push(pts[i]);
  }
  segments.push(current);

  // Axis ticks: 4 price lines, ~6 time labels; a tick that starts a new UTC
  // day also shows the date.
  const yTicks = Array.from({ length: 4 }, (_, i) => lo + ((i + 0.5) / 4) * (hi - lo));
  const tickCount = Math.min(6, pts.length);
  const xTicks = Array.from({ length: tickCount }, (_, i) =>
    pts[Math.round((i / (tickCount - 1)) * (pts.length - 1))].ts
  );

  const fmtTime = (ts) => `${String(new Date(ts).getUTCHours()).padStart(2, '0')}:00`;
  const fmtDay = (ts) =>
    new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`${symbol} 1h price chart`}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={padL} y1={y(v)} x2={width - padR} y2={y(v)} stroke="var(--v2-line)" strokeWidth="1" />
          <text x={padL - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="var(--v2-text-faint)" className="v2-num">
            {formatInstrumentPrice(v, symbol)}
          </text>
        </g>
      ))}

      {xTicks.map((ts, i) => {
        const newDay = i === 0 || new Date(ts).getUTCDate() !== new Date(xTicks[i - 1]).getUTCDate();
        return (
          <g key={ts}>
            <text x={x(ts)} y={height - 16} textAnchor="middle" fontSize="10" fill="var(--v2-text-faint)" className="v2-num">
              {fmtTime(ts)}
            </text>
            {newDay && (
              <text x={x(ts)} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--v2-text-faint)">
                {fmtDay(ts)}
              </text>
            )}
          </g>
        );
      })}

      {levels.map((l) =>
        l.value == null ? null : (
          <g key={l.label}>
            <line
              x1={padL} y1={y(l.value)} x2={width - padR} y2={y(l.value)}
              stroke={TONE[l.tone] ?? 'var(--v2-text-faint)'} strokeWidth="1" strokeDasharray="5 4" opacity="0.7"
            />
            <text x={width - padR + 4} y={y(l.value) + 3} fontSize="10" fill={TONE[l.tone] ?? 'var(--v2-text-faint)'} className="v2-num">
              {l.label} {formatInstrumentPrice(l.value, symbol)}
            </text>
          </g>
        )
      )}

      {segments.map((seg, i) =>
        seg.length === 1 ? (
          <circle key={i} cx={x(seg[0].ts)} cy={y(seg[0].close)} r="2" fill="var(--v2-accent)" />
        ) : (
          <polyline
            key={i}
            points={seg.map((p) => `${x(p.ts).toFixed(1)},${y(p.close).toFixed(1)}`).join(' ')}
            fill="none"
            stroke="var(--v2-accent)"
            strokeWidth="1.5"
          />
        )
      )}
    </svg>
  );
}
