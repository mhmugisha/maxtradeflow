// lib/featured-events.js
// Compute the next 3 upcoming high-impact economic events using recurring patterns.
// No external API — pure date math + hardcoded central bank schedule.

// 2026 FOMC meeting dates (decision day at 18:00 UTC)
const FOMC_2026 = [
  '2026-01-28', '2026-03-18', '2026-04-29', '2026-06-17',
  '2026-07-29', '2026-09-16', '2026-10-28', '2026-12-09',
];

// 2026 ECB Governing Council meeting dates (rate decision at 12:15 UTC)
const ECB_2026 = [
  '2026-01-22', '2026-03-05', '2026-04-16', '2026-06-04',
  '2026-07-23', '2026-09-10', '2026-10-29', '2026-12-17',
];

function pad(n) { return String(n).padStart(2, '0'); }

// First Friday of a given year/month at 13:30 UTC (NFP)
function nfpForMonth(year, month) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const dow = firstOfMonth.getUTCDay(); // 0=Sun, 5=Fri
  const offset = (5 - dow + 7) % 7;
  const day = 1 + offset;
  return new Date(Date.UTC(year, month, day, 13, 30, 0));
}

// US CPI release: typically 8:30am ET on second Tuesday-ish of the month
// We approximate as the 13th of the month at 13:30 UTC
function cpiForMonth(year, month) {
  return new Date(Date.UTC(year, month, 13, 13, 30, 0));
}

// Get the next NFP from a reference date (default: now)
function nextNFP(now = new Date()) {
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth();
  let candidate = nfpForMonth(year, month);
  if (candidate <= now) {
    month += 1;
    if (month > 11) { month = 0; year += 1; }
    candidate = nfpForMonth(year, month);
  }
  return {
    code: 'USD',
    flag: '🇺🇸',
    name: 'Non-Farm Payrolls',
    short: 'NFP',
    datetime: candidate,
    impact: 'HIGH',
    slug: 'nfp-explained',
  };
}

function nextCPI(now = new Date()) {
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth();
  let candidate = cpiForMonth(year, month);
  if (candidate <= now) {
    month += 1;
    if (month > 11) { month = 0; year += 1; }
    candidate = cpiForMonth(year, month);
  }
  return {
    code: 'USD',
    flag: '🇺🇸',
    name: 'CPI Inflation Data',
    short: 'CPI',
    datetime: candidate,
    impact: 'HIGH',
    slug: 'cpi-explained',
  };
}

function nextFromList(list, now, label) {
  for (const dateStr of list) {
    const d = new Date(`${dateStr}T${label.time}Z`);
    if (d > now) {
      return {
        code: label.code,
        flag: label.flag,
        name: label.name,
        short: label.short,
        datetime: d,
        impact: 'HIGH',
        slug: label.slug,
      };
    }
  }
  return null;
}

function nextFOMC(now = new Date()) {
  return nextFromList(FOMC_2026, now, {
    code: 'USD', flag: '🇺🇸', name: 'FOMC Rate Decision',
    short: 'FOMC', time: '18:00:00', slug: 'fomc-explained',
  });
}

function nextECB(now = new Date()) {
  return nextFromList(ECB_2026, now, {
    code: 'EUR', flag: '🇪🇺', name: 'ECB Rate Decision',
    short: 'ECB', time: '12:15:00', slug: null,
  });
}

// Return the 3 nearest upcoming high-impact events, sorted by datetime
export function getUpcomingEvents(now = new Date()) {
  const candidates = [
    nextNFP(now),
    nextCPI(now),
    nextFOMC(now),
    nextECB(now),
  ].filter(Boolean);
  candidates.sort((a, b) => a.datetime - b.datetime);
  return candidates.slice(0, 3);
}

// Format a datetime for display: "Tue 13:30 UTC" or "Jun 4 12:15 UTC"
export function formatEventTime(date, now = new Date()) {
  const dayMs = 24 * 60 * 60 * 1000;
  const diffMs = date - now;
  const diffDays = Math.round(diffMs / dayMs);
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());

  // If within 7 days, show day-of-week
  if (diffDays >= 0 && diffDays <= 7) {
    const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getUTCDay()];
    return `${dow} ${hh}:${mm} UTC`;
  }
  // Otherwise show month + day
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getUTCMonth()];
  return `${mon} ${date.getUTCDate()} ${hh}:${mm} UTC`;
}

// Format "in 2d 4h" countdown for the NEXT MAJOR EVENT badge
export function formatCountdown(date, now = new Date()) {
  const ms = date - now;
  if (ms <= 0) return 'now';
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = totalMinutes % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
}
