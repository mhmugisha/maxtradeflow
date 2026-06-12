// components/v2/SessionCards.js — the four market-session cards (L2 hub +
// home), real UTC windows from lib/market-sessions.js. Server snapshot;
// the live 30s-refreshing strip stays in the shell's SessionBar.

import { sessionStatuses } from '@/lib/market-sessions';

export default function SessionCards() {
  const sessions = sessionStatuses();
  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
      {sessions.map((s) => (
        <div
          key={s.name}
          className={`w-60 shrink-0 snap-start rounded-md border bg-v2-surface px-4 py-3 md:w-auto ${
            s.open ? 'border-v2-bullish/40' : 'border-v2-line'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${s.open ? 'bg-v2-bullish' : 'bg-v2-text-faint'}`} aria-hidden />
            <span className="text-sm font-medium text-v2-text">{s.name}</span>
          </div>
          <div className={`mt-0.5 text-xs ${s.open ? 'text-v2-bullish' : 'text-v2-text-faint'}`}>
            {s.open ? 'Open now' : 'Closed'}
          </div>
          <div className="mt-1 text-[11px] text-v2-text-faint">{s.pairs.join(' · ')}</div>
        </div>
      ))}
    </div>
  );
}
