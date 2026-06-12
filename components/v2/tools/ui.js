// components/v2/tools/ui.js — shared form/result primitives for the v2
// calculators (Calculator_Expanded.png). All controls are ≥44px tall for
// mobile tap targets (§22); numeric output always renders v2-num.

const CONTROL =
  'min-h-11 w-full rounded-md border border-v2-line bg-v2-bg px-3 text-sm text-v2-text outline-none transition-colors focus:border-v2-accent';

export function Field({ label, tone = 'text-v2-text-muted', children }) {
  return (
    <label className="block">
      <span className={`mb-1.5 block text-xs ${tone}`}>{label}</span>
      {children}
    </label>
  );
}

export function NumberInput(props) {
  return <input type="number" inputMode="decimal" className={`${CONTROL} v2-num`} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={CONTROL} {...props}>
      {children}
    </select>
  );
}

export function Card({ children, className = '' }) {
  return (
    <section className={`rounded-md border border-v2-line bg-v2-surface p-4 sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

export function BigResult({ label, value, unit, sub, tone = 'text-v2-accent' }) {
  return (
    <div className="rounded-md border border-v2-line bg-v2-bg p-4 text-center">
      <div className="text-[10px] uppercase tracking-widest text-v2-text-faint">{label}</div>
      <div className={`v2-num mt-1 text-4xl font-bold ${tone}`}>
        {value}
        {unit && <span className="ml-1.5 text-base font-normal text-v2-text-muted">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-xs text-v2-text-muted">{sub}</div>}
    </div>
  );
}

export function Stat({ label, value, tone = 'text-v2-text' }) {
  return (
    <div className="rounded-md border border-v2-line bg-v2-bg px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-v2-text-faint">{label}</div>
      <div className={`v2-num mt-0.5 text-base font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

export function DirectionToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {['LONG', 'SHORT'].map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={`min-h-11 rounded-md border px-6 text-sm font-semibold transition-colors ${
            value === d
              ? d === 'LONG'
                ? 'border-v2-bullish bg-v2-bullish-soft text-v2-bullish'
                : 'border-v2-bearish bg-v2-bearish-soft text-v2-bearish'
              : 'border-v2-line bg-v2-surface text-v2-text-muted hover:text-v2-text'
          }`}
        >
          {d === 'LONG' ? '▲ Long' : '▼ Short'}
        </button>
      ))}
    </div>
  );
}

/** "How it works" prose card with an optional monospace formula block. */
export function HowItWorks({ title = 'How it works', formula, children }) {
  return (
    <Card>
      <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-v2-text-muted">{children}</div>
      {formula && (
        <pre className="v2-num mt-3 overflow-x-auto whitespace-pre-wrap rounded-md bg-v2-bg p-3 text-xs leading-relaxed text-v2-accent">
          {formula}
        </pre>
      )}
    </Card>
  );
}
