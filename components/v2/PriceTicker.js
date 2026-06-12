// components/v2/PriceTicker.js — fully ISOLATED live price ticker (A-1).
//
// ISOLATION IS THE PRIMARY REQUIREMENT. This component has broken page state
// twice before when wired through layout.js. Hard rules, enforced by
// construction:
//   - takes NO props and reads NO context, so no parent render path exists
//   - all polling/state is internal (useLiveData) — setState here re-renders
//     ONLY this component's subtree, nothing outside it
//   - publishes nothing: no context provider, no module-level mutable state,
//     no events, no callbacks upward
// Any future "share the ticker's data" idea must poll /api/live/prices itself
// (the proxy collapses duplicate polls at the edge) — never lift this state.
//
// Data: /api/live/prices every 5s. All 21 registry instruments, formatted per
// lib/instruments.js decimals. Failure keeps last-known prices and shows the
// calm staleness pill — never blank. % change is a placeholder ("—") until
// price_snapshots wiring in Session 2.

'use client';

import { INSTRUMENTS, formatInstrumentPrice } from '@/lib/instruments';
import { useLiveData } from './useLiveData';
import LiveStatusPill from './LiveStatusPill';

function extractPrices(data) {
  const prices = data?.prices ?? data;
  return prices && typeof prices === 'object' && !Array.isArray(prices) ? prices : {};
}

export default function PriceTicker() {
  const { data, status } = useLiveData('/api/live/prices', 5000);
  const prices = extractPrices(data);

  const items = INSTRUMENTS.map((inst) => {
    const quote = prices[inst.symbol];
    const value = quote?.bid ?? quote?.price ?? null;
    return {
      key: inst.symbol,
      label: inst.display,
      price: formatInstrumentPrice(value, inst.symbol),
      change: '—', // placeholder until price_snapshots wiring (Session 2)
    };
  });

  const row = (dupe) =>
    items.map((it) => (
      <span
        key={`${dupe}-${it.key}`}
        className="flex items-center gap-2 whitespace-nowrap px-4"
        aria-hidden={dupe === 'b' || undefined}
      >
        <span className="text-[11px] text-v2-text-muted">{it.label}</span>
        <span className="v2-num text-xs text-v2-text">{it.price}</span>
        <span className="v2-num text-[11px] text-v2-text-faint">{it.change}</span>
      </span>
    ));

  return (
    <div
      className="relative flex items-center overflow-hidden border-t border-v2-line bg-v2-surface"
      style={{ height: 'var(--v2-ticker-h)' }}
    >
      {/* Two copies of the row, animated -50% for a seamless loop */}
      <div className="v2-marquee">
        {row('a')}
        {row('b')}
      </div>
      <div className="absolute right-2">
        <LiveStatusPill status={status} />
      </div>
    </div>
  );
}
