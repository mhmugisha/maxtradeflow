// components/v2/useLiveData.js — polling hook with honest degraded states
// (EXECUTION_PLAN.md A-1 degraded-state primitives).
//
// Contract: NEVER blank, never spinner-replacing-content. On fetch failure the
// last-known data is kept; only `status` changes, by data age:
//   'connecting'    no successful fetch yet (first load)
//   'live'          age ≤ 60s
//   'delayed'       age > 60s  → show the calm "Live data delayed" pill
//   'reconnecting'  age > 5min → show "Reconnecting"
// Status granularity is the poll interval (each attempt re-renders the owner).

'use client';

import { useEffect, useState } from 'react';

export const DELAYED_MS = 60_000;
export const RECONNECTING_MS = 300_000;

export function useLiveData(url, intervalMs = 5000) {
  const [state, setState] = useState({ data: null, lastSuccessAt: null, lastAttemptAt: null });

  useEffect(() => {
    let alive = true;
    let controller = null;

    async function poll() {
      controller = new AbortController();
      try {
        const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!alive) return;
        setState({ data: json, lastSuccessAt: Date.now(), lastAttemptAt: Date.now() });
      } catch (error) {
        if (!alive || error?.name === 'AbortError') return;
        console.error(`[useLiveData] poll failed (${url}):`, error?.message || error);
        // Keep last-known data; record the attempt so status re-derives.
        setState((s) => ({ ...s, lastAttemptAt: Date.now() }));
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
      controller?.abort();
    };
  }, [url, intervalMs]);

  const age = state.lastSuccessAt == null ? null : Date.now() - state.lastSuccessAt;
  const status =
    age == null ? 'connecting'
    : age > RECONNECTING_MS ? 'reconnecting'
    : age > DELAYED_MS ? 'delayed'
    : 'live';

  return { data: state.data, lastSuccessAt: state.lastSuccessAt, status };
}
