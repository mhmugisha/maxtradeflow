// lib/calendar-events.js — curated economic-calendar data module (Phase A
// Session 4 Task 4).
//
// THIS IS NOT A LIVE FEED. It is a manually curated seed of MAJOR recurring
// scheduled events (central-bank decisions and flagship US releases) with
// their published/rule-determined 2026 dates. The UI labels this "Major
// scheduled events" and must never present it as live coverage. No event in
// here is invented; each series carries its `source` and a verification note.
//
// ⚠ VERIFY BEFORE CUTOVER: dates were entered manually from official
// calendars (Fed/ECB/BoE meeting calendars, BLS release schedule, NFP
// first-Friday rule). Re-check each series against its source before the
// public launch, and whenever a series' institution republishes its calendar.
//
// Replacing with a live API later: keep getUpcomingEvents()/getNextEvent()
// signatures and event shape ({id, title, currency, impact, datetime,
// affected, source}) and swap the internals — no UI changes needed.

const USD_MAJORS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'XAUUSD', 'US500', 'NAS100', 'US30'];

const EVENT_SERIES = [
  {
    id: 'us-nfp',
    title: 'US Non-Farm Payrolls',
    currency: 'USD',
    impact: 'high',
    timeUtc: '12:30',
    affected: USD_MAJORS,
    source: 'BLS Employment Situation — first Friday of each month (rule-determined)',
    dates: ['2026-07-03', '2026-08-07', '2026-09-04', '2026-10-02', '2026-11-06', '2026-12-04'],
  },
  {
    id: 'us-cpi',
    title: 'US CPI Inflation',
    currency: 'USD',
    impact: 'high',
    timeUtc: '12:30',
    affected: USD_MAJORS,
    source: 'BLS CPI release schedule (manually entered — verify against bls.gov/schedule)',
    dates: ['2026-07-14', '2026-08-12', '2026-09-11', '2026-10-13', '2026-11-12', '2026-12-10'],
  },
  {
    id: 'fomc',
    title: 'FOMC Rate Decision',
    currency: 'USD',
    impact: 'high',
    timeUtc: '18:00',
    affected: USD_MAJORS,
    source: 'Federal Reserve 2026 FOMC meeting calendar (decision day of each two-day meeting)',
    dates: ['2026-06-17', '2026-07-29', '2026-09-16', '2026-10-28', '2026-12-09'],
  },
  {
    id: 'ecb',
    title: 'ECB Rate Decision',
    currency: 'EUR',
    impact: 'high',
    timeUtc: '12:15',
    affected: ['EURUSD', 'EURGBP'],
    source: 'ECB Governing Council monetary-policy meeting calendar 2026 (verify against ecb.europa.eu)',
    dates: ['2026-07-23', '2026-09-10', '2026-10-29', '2026-12-17'],
  },
  {
    id: 'boe',
    title: 'BoE Rate Decision',
    currency: 'GBP',
    impact: 'high',
    timeUtc: '11:00',
    affected: ['GBPUSD', 'GBPJPY', 'GBPAUD', 'EURGBP'],
    source: 'Bank of England MPC meeting calendar 2026 (verify against bankofengland.co.uk)',
    dates: ['2026-06-18', '2026-08-06', '2026-09-17', '2026-11-05', '2026-12-17'],
  },
];

/** Every curated event, flattened and sorted ascending by datetime. */
export function allEvents() {
  return EVENT_SERIES.flatMap((s) =>
    s.dates.map((d) => ({
      id: `${s.id}-${d}`,
      title: s.title,
      currency: s.currency,
      impact: s.impact,
      datetime: `${d}T${s.timeUtc}:00Z`,
      affected: s.affected,
      source: s.source,
    }))
  ).sort((a, b) => a.datetime.localeCompare(b.datetime));
}

/**
 * Upcoming events within `days`, optionally only those affecting any of
 * `symbols`. Pure and synchronous (curated data — no I/O).
 */
export function getUpcomingEvents({ days = 14, symbols = null, limit = null, now = new Date() } = {}) {
  const from = now.getTime();
  const to = from + days * 86_400_000;
  let events = allEvents().filter((e) => {
    const t = new Date(e.datetime).getTime();
    return t >= from && t <= to;
  });
  if (symbols?.length) {
    const set = new Set(symbols);
    events = events.filter((e) => e.affected.some((a) => set.has(a)));
  }
  return limit ? events.slice(0, limit) : events;
}

/** The single next upcoming event (any horizon), or null. */
export function getNextEvent(now = new Date()) {
  return allEvents().find((e) => new Date(e.datetime).getTime() >= now.getTime()) ?? null;
}
