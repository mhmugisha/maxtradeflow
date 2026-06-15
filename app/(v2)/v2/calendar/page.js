// /v2/calendar — economic calendar per docs/mockups/Economic_Calendar.png
// (Phase A Session 4 Task 4), rendered from the CURATED seed in
// lib/calendar-events.js. Clearly labeled "Major scheduled events" — this is
// not a live feed and never pretends to be one.

import Link from 'next/link';
import { getUpcomingEvents, getNextEvent } from '@/lib/calendar-events';
import { getSignalCounts } from '@/lib/v2-data';
import { INSTRUMENTS, getInstrument } from '@/lib/instruments';
import { l4Href } from '@/components/v2/assetClassMeta';
import Breadcrumb from '@/components/v2/Breadcrumb';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import CalendarList from './CalendarList';

export const revalidate = 3600; // curated data — hourly re-render keeps "next event" fresh enough

export const metadata = {
  title: 'Economic Calendar — Major Scheduled Events — MaxTradeFlow',
  description: 'Major scheduled events affecting the instruments Smart Asset Bot trades: FOMC, NFP, CPI, ECB and BoE decisions. All times UTC.',
};

const fmtNext = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
};

export default async function CalendarPage() {
  const counts = await getSignalCounts();
  const events = getUpcomingEvents({ days: 30 });
  const next = getNextEvent();
  const currencies = [...new Set(events.map((e) => e.currency))];
  const l4Hrefs = Object.fromEntries(
    INSTRUMENTS.map((i) => [i.symbol, l4Href(i)]).filter(([, href]) => href)
  );

  return (
    <>
      <Breadcrumb items={[{ label: 'Markets', href: '/v2/markets' }, { label: 'Economic Calendar' }]} />
      <div className="grid grid-cols-[224px_1fr]">
        <MarketsSidebar active="overview" counts={counts.byClass} />

        <div className="min-w-0 space-y-6 px-6 py-6">
          <header>
            <h1 className="font-v2-display text-2xl font-bold text-v2-text">Economic Calendar</h1>
            <p className="mt-1 text-sm text-v2-text-muted">
              Major scheduled events affecting the instruments Smart Asset Bot trades. All times UTC.
            </p>
            <p className="mt-1 text-[11px] text-v2-text-faint">
              Manually curated from official central-bank and statistical release calendars — major
              recurring events only, not a live feed of every release.
            </p>
          </header>

          {next && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-v2-line-strong bg-v2-accent-soft px-4 py-2.5">
              <span className="text-xs text-v2-text">
                <span className="text-v2-accent">● Next event:</span> {next.title}
                {' '}<span className="text-v2-text-faint">— affects {next.affected.slice(0, 4).join(', ')}{next.affected.length > 4 ? '…' : ''}</span>
              </span>
              <span className="v2-num rounded bg-v2-surface px-2 py-0.5 text-[11px] text-v2-accent">{fmtNext(next.datetime)}</span>
            </div>
          )}

          <CalendarList events={events} currencies={currencies} l4Hrefs={l4Hrefs} />

          <p className="text-[11px] text-v2-text-faint">
            Looking for instrument-specific context? Each event row links to the affected
            instrument pages, and every L4 page shows its own upcoming events. Live per-release
            data (forecasts, previous values) arrives with a calendar data source in a later phase.
          </p>
        </div>
      </div>
    </>
  );
}
