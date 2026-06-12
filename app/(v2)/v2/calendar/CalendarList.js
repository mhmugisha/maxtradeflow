// Calendar list with client-side impact/currency filter chips per
// Economic_Calendar.png. Data is the serialized curated seed passed from the
// server page — filtering a fixed curated set client-side is exact, not a
// sample.

'use client';

import { useState } from 'react';
import Link from 'next/link';

const IMPACTS = [
  { key: null, label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
];

function dayKey(iso) {
  return iso.slice(0, 10);
}

const fmtDayHeading = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });

const fmtTime = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

export default function CalendarList({ events, currencies, l4Hrefs }) {
  const [impact, setImpact] = useState(null);
  const [currency, setCurrency] = useState(null);

  const visible = events.filter(
    (e) => (!impact || e.impact === impact) && (!currency || e.currency === currency)
  );

  const days = [...new Set(visible.map((e) => dayKey(e.datetime)))];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-v2-text-faint">Impact:</span>
          {IMPACTS.map((i) => (
            <button
              key={i.label}
              onClick={() => setImpact(i.key)}
              className={`min-h-11 rounded-full border px-3 text-xs transition-colors md:min-h-8 ${
                impact === i.key
                  ? 'border-v2-line-strong bg-v2-accent-soft text-v2-accent'
                  : 'border-v2-line text-v2-text-muted hover:text-v2-text'
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-v2-text-faint">Currency:</span>
          {[null, ...currencies].map((c) => (
            <button
              key={c ?? 'all'}
              onClick={() => setCurrency(c)}
              className={`min-h-11 rounded-full border px-3 text-xs transition-colors md:min-h-8 ${
                currency === c
                  ? 'border-v2-line-strong bg-v2-accent-soft text-v2-accent'
                  : 'border-v2-line text-v2-text-muted hover:text-v2-text'
              }`}
            >
              {c ?? 'All'}
            </button>
          ))}
        </div>
      </div>

      {days.length === 0 && (
        <p className="py-6 text-sm text-v2-text-muted">No scheduled events match these filters in this window.</p>
      )}

      {days.map((day) => {
        const dayEvents = visible.filter((e) => dayKey(e.datetime) === day);
        return (
          <section key={day}>
            <h2 className="mb-2 border-b border-v2-line pb-1.5 text-sm font-medium text-v2-text">
              {fmtDayHeading(day)}{' '}
              <span className="text-[11px] font-normal text-v2-text-faint">
                · {dayEvents.length} event{dayEvents.length === 1 ? '' : 's'}
              </span>
            </h2>
            <div className="space-y-1.5">
              {dayEvents.map((e) => (
                <div key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-v2-line bg-v2-surface px-4 py-2.5" title={e.source}>
                  <span className="v2-num w-12 text-xs text-v2-accent">{fmtTime(e.datetime)}</span>
                  <span className="rounded border border-v2-line px-1.5 py-0.5 text-[10px] text-v2-text-muted">{e.currency}</span>
                  <span className="min-w-32 flex-1 text-xs font-medium text-v2-text">{e.title}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${
                      e.impact === 'high' ? 'bg-v2-bearish-soft text-v2-bearish' : 'bg-v2-gold-soft text-v2-gold'
                    }`}
                  >
                    {e.impact}
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {e.affected.slice(0, 5).map((sym) =>
                      l4Hrefs[sym] ? (
                        <Link key={sym} href={l4Hrefs[sym]} className="rounded border border-v2-line px-1.5 py-0.5 text-[9px] text-v2-text-muted transition-colors hover:text-v2-accent">
                          {sym}
                        </Link>
                      ) : (
                        <span key={sym} className="rounded border border-v2-line px-1.5 py-0.5 text-[9px] text-v2-text-faint">
                          {sym}
                        </span>
                      )
                    )}
                    {e.affected.length > 5 && <span className="text-[9px] text-v2-text-faint">+{e.affected.length - 5}</span>}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
