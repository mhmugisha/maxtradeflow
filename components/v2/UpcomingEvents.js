// components/v2/UpcomingEvents.js — compact upcoming-events rows from the
// curated lib/calendar-events.js seed (NOT a live feed — the heading shown
// by callers must say "scheduled"). Used by the home calendar card, the L3
// class-events section and the L4 rail.

import Link from 'next/link';
import { getUpcomingEvents } from '@/lib/calendar-events';
import { getInstrument } from '@/lib/instruments';
import { l4Href } from './assetClassMeta';

const fmtWhen = (iso) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${day} · ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
};

export function ImpactBadge({ impact }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${
        impact === 'high' ? 'bg-v2-bearish-soft text-v2-bearish' : 'bg-v2-gold-soft text-v2-gold'
      }`}
    >
      {impact}
    </span>
  );
}

export default function UpcomingEvents({ symbols = null, days = 14, limit = 5, emptyText }) {
  const events = getUpcomingEvents({ symbols, days, limit });

  if (events.length === 0) {
    return (
      <p className="text-xs text-v2-text-faint">
        {emptyText ?? `No major scheduled events in the next ${days} days.`}
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {events.map((e) => (
        <div key={e.id} className="flex items-center justify-between gap-2 rounded-md border border-v2-line bg-v2-surface px-3 py-2" title={e.source}>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-v2-text">{e.title}</div>
            <div className="v2-num text-[10px] text-v2-text-faint">{fmtWhen(e.datetime)}</div>
          </div>
          <ImpactBadge impact={e.impact} />
        </div>
      ))}
    </div>
  );
}

/** Affected-instrument chips, linking to L4 pages where they exist. */
export function AffectedChips({ affected, max = 5 }) {
  return (
    <span className="flex flex-wrap gap-1">
      {affected.slice(0, max).map((sym) => {
        const inst = getInstrument(sym);
        const href = l4Href(inst);
        const chip = (
          <span className="rounded border border-v2-line px-1.5 py-0.5 text-[9px] text-v2-text-muted">
            {inst?.display ?? sym}
          </span>
        );
        return href ? (
          <Link key={sym} href={href} className="transition-opacity hover:opacity-75">{chip}</Link>
        ) : (
          <span key={sym}>{chip}</span>
        );
      })}
      {affected.length > max && (
        <span className="text-[9px] text-v2-text-faint">+{affected.length - max}</span>
      )}
    </span>
  );
}
