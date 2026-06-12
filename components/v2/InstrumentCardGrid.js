// components/v2/InstrumentCardGrid.js — L3 instrument cards with client-side
// filter chips per L3_Asset_Class.png (A-2). Client component only for the
// filter state; all data arrives pre-computed and serializable from the
// server template (AssetClassPage).
//
// Card data shape: { symbol, display, name, href, price (formatted string),
// changePct, spark: number[], signal: { direction, displayScore, derived } | null }
//
// Filters:
//   all       every card
//   signals   cards with an active signal
//   trending  |daily change| ≥ TRENDING_PCT — the only sensible "trending"
//             definition available from snapshots alone; threshold documented

'use client';

const TRENDING_PCT = 0.3;

import { useState } from 'react';
import Link from 'next/link';
import Sparkline from './Sparkline';
import PctBadge from './PctBadge';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'signals', label: 'With signals' },
  { key: 'trending', label: 'Trending' },
];

function matches(card, filter) {
  if (filter === 'signals') return card.signal != null;
  if (filter === 'trending') return card.changePct != null && Math.abs(card.changePct) >= TRENDING_PCT;
  return true;
}

function InstrumentCard({ card }) {
  const s = card.signal;
  const long = s?.direction === 'LONG';
  return (
    <Link
      href={card.href}
      className="relative block min-h-11 overflow-hidden rounded-md border border-v2-line bg-v2-surface p-3 transition-colors hover:border-v2-line-strong"
    >
      {/* corner triangle marks an active-signal card (mockup) */}
      {s && (
        <span
          className="absolute right-0 top-0 h-0 w-0 border-l-[18px] border-t-[18px] border-l-transparent"
          style={{ borderTopColor: long ? 'var(--v2-bullish)' : 'var(--v2-bearish)' }}
          aria-hidden
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-v2-text">{card.display}</div>
          <div className="text-[10px] text-v2-text-faint">{card.name}</div>
        </div>
        {s?.displayScore != null && (
          <span
            className="v2-num pr-2 text-[11px] text-v2-text-muted"
            title={s.derived ? 'Derived from legacy 0–10 score' : 'TradeFlow Score'}
          >
            TFS {s.displayScore}{s.derived ? '*' : ''}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="v2-num text-lg font-medium text-v2-text">{card.price}</span>
        <PctBadge pct={card.changePct} className="text-[11px]" />
      </div>
      <div className="mt-2">
        <Sparkline data={card.spark} variant="bars" width={120} height={24} />
      </div>
      {s && (
        <div className={`mt-1.5 text-[10px] font-medium ${long ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
          ● {s.direction} active
        </div>
      )}
    </Link>
  );
}

export default function InstrumentCardGrid({ cards, viewAllLabel }) {
  const [filter, setFilter] = useState('all');
  const visible = cards.filter((c) => matches(c, filter));

  return (
    <div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        {visible.map((c) => (
          <div key={c.symbol} className="w-56 shrink-0 snap-start md:w-auto">
            <InstrumentCard card={c} />
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-4 text-sm text-v2-text-muted">
            No instruments match this filter right now.
          </p>
        )}
      </div>

      {/* action row below the grid per the mockup */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-v2-line pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-v2-text-faint">Filter:</span>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`min-h-11 rounded-full border px-3 text-xs transition-colors md:min-h-8 ${
                filter === f.key
                  ? 'border-v2-line-strong bg-v2-accent-soft text-v2-accent'
                  : 'border-v2-line text-v2-text-muted hover:text-v2-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {viewAllLabel && (
          <button
            disabled
            title="Full instrument pages arrive with the L4 rollout"
            className="min-h-11 cursor-not-allowed rounded border border-v2-line px-3 text-xs text-v2-text-faint md:min-h-8"
          >
            {viewAllLabel} →
          </button>
        )}
      </div>
    </div>
  );
}
