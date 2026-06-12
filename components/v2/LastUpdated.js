// components/v2/LastUpdated.js — relative "Updated Ns ago" timestamp (A-1
// degraded-state primitives). Re-renders itself every 10s; renders nothing if
// no timestamp yet (the owner decides what "no data yet" looks like).

'use client';

import { useEffect, useState } from 'react';

function relativeLabel(ts, now) {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function LastUpdated({ timestamp, prefix = 'Updated' }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  if (!timestamp) return null;
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  return (
    <span className="text-[11px] text-v2-text-faint" suppressHydrationWarning>
      {prefix} {relativeLabel(ts, now)}
    </span>
  );
}
