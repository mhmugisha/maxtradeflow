// components/v2/SessionBar.js — Open/Closed per market center using the REAL
// UTC session windows in lib/market-sessions.js (A-1). Client component: the
// state depends on wall-clock time, refreshed every 30s.

'use client';

import { useEffect, useState } from 'react';
import { sessionStatuses } from '@/lib/market-sessions';

export default function SessionBar() {
  const [statuses, setStatuses] = useState(() => sessionStatuses());

  useEffect(() => {
    const id = setInterval(() => setStatuses(sessionStatuses()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center justify-center gap-6 border-b border-v2-line bg-v2-bg px-4"
      style={{ height: 'var(--v2-sessionbar-h)' }}
      suppressHydrationWarning
    >
      {statuses.map((s) => (
        <div key={s.name} className="flex items-center gap-1.5 text-[11px]">
          <span
            className={`h-1.5 w-1.5 rounded-full ${s.open ? 'bg-v2-bullish' : 'bg-v2-text-faint'}`}
            aria-hidden
          />
          <span className="text-v2-text-muted">{s.name}</span>
          <span className={s.open ? 'text-v2-bullish' : 'text-v2-text-faint'}>
            {s.open ? 'Open' : 'Closed'}
          </span>
        </div>
      ))}
    </div>
  );
}
