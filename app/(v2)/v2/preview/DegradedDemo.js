// Degraded-states demo for /v2/preview only — simulates data age so the
// LiveStatusPill states and the never-blank rule are demonstrable without
// waiting 5 minutes for real staleness.

'use client';

import { useState } from 'react';
import LiveStatusPill from '@/components/v2/LiveStatusPill';
import LastUpdated from '@/components/v2/LastUpdated';

const STATES = [
  { status: 'live', label: 'Live (≤60s)', ageMs: 5_000 },
  { status: 'delayed', label: 'Delayed (>60s)', ageMs: 90_000 },
  { status: 'reconnecting', label: 'Reconnecting (>5min)', ageMs: 360_000 },
];

export default function DegradedDemo() {
  const [selected, setSelected] = useState(STATES[0]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATES.map((s) => (
          <button
            key={s.status}
            onClick={() => setSelected(s)}
            className={`rounded border px-3 py-1.5 text-xs transition-colors ${
              selected.status === s.status
                ? 'border-v2-line-strong bg-v2-accent-soft text-v2-accent'
                : 'border-v2-line text-v2-text-muted hover:text-v2-text'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* The data row: the value NEVER blanks, whatever the staleness */}
      <div className="flex items-center gap-3 rounded-md border border-v2-line bg-v2-surface px-4 py-3">
        <span className="text-xs text-v2-text-muted">EUR/USD</span>
        <span className="v2-num text-sm text-v2-text">1.08760</span>
        <LastUpdated timestamp={Date.now() - selected.ageMs} />
        <LiveStatusPill status={selected.status} />
        {selected.status === 'live' && (
          <span className="text-[11px] text-v2-text-faint">(no pill while live — by design)</span>
        )}
      </div>
      <p className="text-xs text-v2-text-faint">
        Last-known values stay on screen in every state — no blanking, no spinner replacing
        content. The pill is the only thing that changes.
      </p>
    </div>
  );
}
