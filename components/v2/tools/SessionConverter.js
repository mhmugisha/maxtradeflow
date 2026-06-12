'use client';
// Session windows come from lib/market-sessions.js — the single source of
// truth (Session 5 spec; the legacy page carried its own, older copy of the
// hours). Overlap windows are COMPUTED from those sessions, not hardcoded.
// Open/closed status uses the lib's isSessionOpen and only renders after
// mount (it depends on the visitor's clock — rendering it on the server
// would hydrate stale).

import { useEffect, useState } from 'react';
import { MARKET_SESSIONS, isSessionOpen } from '@/lib/market-sessions';
import { Field, Select, Card, HowItWorks } from './ui';

const TIMEZONES = [
  { label: 'UTC', offset: 0 },
  { label: 'Kampala / Nairobi (EAT)', offset: 3 },
  { label: 'London (GMT/BST)', offset: 1 },
  { label: 'New York (EST/EDT)', offset: -4 },
  { label: 'Dubai (GST)', offset: 4 },
  { label: 'Mumbai (IST)', offset: 5.5 },
  { label: 'Singapore (SGT)', offset: 8 },
  { label: 'Tokyo (JST)', offset: 9 },
  { label: 'Sydney (AEST)', offset: 10 },
  { label: 'Los Angeles (PST/PDT)', offset: -7 },
];

// Display-only metadata; the windows themselves live in lib/market-sessions.
const SESSION_META = {
  Sydney: { flag: '🇦🇺', tone: 'text-v2-accent', desc: 'Low volatility, AUD and NZD pairs active' },
  Tokyo: { flag: '🇯🇵', tone: 'text-v2-gold', desc: 'JPY pairs most active, moderate volatility' },
  London: { flag: '🇬🇧', tone: 'text-v2-bullish', desc: 'Highest volume session, EUR and GBP pairs' },
  'New York': { flag: '🇺🇸', tone: 'text-v2-bearish', desc: 'High volatility, overlaps London in the early hours' },
};

/** A session's minute intervals within one UTC day (wrapping windows → two). */
function sessionIntervals(s) {
  if (s.endMin > s.startMin) return [[s.startMin, s.endMin]];
  return [[s.startMin, 1440], [0, s.endMin]];
}

function overlapIntervals(a, b) {
  const out = [];
  for (const [as, ae] of sessionIntervals(a)) {
    for (const [bs, be] of sessionIntervals(b)) {
      const start = Math.max(as, bs);
      const end = Math.min(ae, be);
      if (end > start) out.push([start, end]);
    }
  }
  return out;
}

const OVERLAP_PAIRS = [
  ['Sydney', 'Tokyo'],
  ['Tokyo', 'London'],
  ['London', 'New York'],
];

/** Minutes-of-day (+timezone offset) → "h:mm AM/PM". */
function fmtLocal(min, offsetHours) {
  const m = (((min + offsetHours * 60) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

function fmtUtc(min) {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export default function SessionConverter() {
  const [timezone, setTimezone] = useState('3');
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const offset = parseFloat(timezone);

  return (
    <div className="space-y-6">
      <Card>
        <div className="max-w-sm">
          <Field label="Your Timezone">
            <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {TIMEZONES.map((tz) => (
                <option key={tz.label} value={tz.offset}>
                  {tz.label} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {MARKET_SESSIONS.map((session) => {
          const meta = SESSION_META[session.name];
          const open = now ? isSessionOpen(session, now) : false;
          return (
            <div
              key={session.name}
              className={`relative rounded-md border bg-v2-surface p-4 ${
                open ? 'border-v2-line-strong' : 'border-v2-line'
              }`}
            >
              {open && (
                <span className="absolute right-3 top-3 rounded-full border border-v2-bullish bg-v2-bullish-soft px-2 py-0.5 text-[10px] font-semibold text-v2-bullish">
                  OPEN
                </span>
              )}
              <div className="text-xl" aria-hidden>{meta.flag}</div>
              <h3 className={`mt-1 font-v2-display text-base font-semibold ${meta.tone}`}>{session.name}</h3>
              <div className="v2-num mt-1 text-lg font-semibold text-v2-text">
                {fmtLocal(session.startMin, offset)} – {fmtLocal(session.endMin, offset)}
              </div>
              <div className="v2-num text-[10px] text-v2-text-faint">
                UTC {fmtUtc(session.startMin)} – {fmtUtc(session.endMin)}
              </div>
              <p className="mt-2 text-xs text-v2-text-muted">{meta.desc}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {session.pairs.map((p) => (
                  <span key={p} className="rounded border border-v2-line bg-v2-bg px-1.5 py-0.5 text-[10px] text-v2-text-muted">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">
          Session overlaps
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {OVERLAP_PAIRS.map(([aName, bName]) => {
            const a = MARKET_SESSIONS.find((s) => s.name === aName);
            const b = MARKET_SESSIONS.find((s) => s.name === bName);
            const windows = overlapIntervals(a, b);
            return (
              <div key={`${aName}+${bName}`} className="rounded-md border border-v2-line bg-v2-bg p-3">
                <div className="text-xs font-semibold text-v2-accent">⚡ {aName} + {bName}</div>
                {windows.length > 0 ? (
                  windows.map(([s, e]) => (
                    <div key={s}>
                      <div className="v2-num mt-1 text-base font-semibold text-v2-text">
                        {fmtLocal(s, offset)} – {fmtLocal(e, offset)}
                      </div>
                      <div className="v2-num text-[10px] text-v2-text-faint">
                        UTC {fmtUtc(s)} – {fmtUtc(e)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="mt-1 text-xs text-v2-text-faint">No overlap</div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-v2-text-muted">
          The London + New York overlap carries the highest trading volume of the day.
        </p>
      </Card>

      <HowItWorks title="How session times work">
        <p>
          Session windows are defined in UTC and converted to your selected timezone with a
          fixed offset. The FX week runs Sunday 21:00 UTC (Sydney&apos;s Monday-morning open)
          through Friday 21:00 UTC. Per-center daylight-saving shifts of ±1 hour are not
          modeled — times can be off by an hour around DST transitions.
        </p>
      </HowItWorks>
    </div>
  );
}
