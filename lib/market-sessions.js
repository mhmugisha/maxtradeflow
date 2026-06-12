// lib/market-sessions.js — real trading-session hours per market center, in UTC
// (EXECUTION_PLAN.md A-1: replaces the legacy single 9–17 rule).
//
// Windows (UTC), per the v2.1 plan:
//   Sydney    21:00–06:00 (+1 day — wraps midnight UTC)
//   Tokyo     00:00–09:00
//   London    07:00–16:00 (≈ 08:00–16:30 local trading hours)
//   New York  12:30–21:00
//
// Weekend handling: a window counts only if it STARTS on one of the session's
// allowed UTC weekdays (0=Sun … 6=Sat).
//   - Tokyo/London/New York start Mon–Fri.
//   - Sydney's 21:00 UTC start belongs to the NEXT local trading day, so its
//     allowed start days are Sun–Thu: the Sunday 21:00 UTC start opens the FX
//     week (Monday morning in Sydney), and there is no Friday 21:00 UTC start
//     (that would be Saturday in Sydney).
// Net effect: the FX week runs Sunday 21:00 UTC → Friday 21:00 UTC, matching
// reality. DST shifts of ±1h per center are deliberately not modeled (the
// approximation is documented here; revisit if per-center DST accuracy is
// ever required).

const DAY_MS = 86_400_000;

export const MARKET_SESSIONS = [
  { name: 'Sydney',   startMin: 21 * 60,      endMin: 6 * 60,  startDays: [0, 1, 2, 3, 4], pairs: ['AUD/USD', 'NZD/USD'] },
  { name: 'Tokyo',    startMin: 0,            endMin: 9 * 60,  startDays: [1, 2, 3, 4, 5], pairs: ['USD/JPY', 'GBP/JPY'] },
  { name: 'London',   startMin: 7 * 60,       endMin: 16 * 60, startDays: [1, 2, 3, 4, 5], pairs: ['EUR/USD', 'GBP/USD'] },
  { name: 'New York', startMin: 12 * 60 + 30, endMin: 21 * 60, startDays: [1, 2, 3, 4, 5], pairs: ['EUR/USD', 'US500'] },
];

/** True if the session is open at `date` (defaults to now). Pure UTC math. */
export function isSessionOpen(session, date = new Date()) {
  const nowMs = date.getTime();
  const todayUtcMidnight = Date.UTC(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()
  );
  const durationMin = session.endMin > session.startMin
    ? session.endMin - session.startMin
    : session.endMin + 1440 - session.startMin;

  // A window covering `now` started either today or (if it wraps midnight)
  // yesterday — check both candidates.
  for (const offsetDays of [0, 1]) {
    const windowBase = todayUtcMidnight - offsetDays * DAY_MS;
    const start = windowBase + session.startMin * 60_000;
    const end = start + durationMin * 60_000;
    const startDay = new Date(windowBase).getUTCDay();
    if (session.startDays.includes(startDay) && nowMs >= start && nowMs < end) {
      return true;
    }
  }
  return false;
}

/** Open/closed snapshot for all four centers at `date` (defaults to now). */
export function sessionStatuses(date = new Date()) {
  return MARKET_SESSIONS.map((s) => ({
    name: s.name,
    pairs: s.pairs,
    open: isSessionOpen(s, date),
  }));
}
