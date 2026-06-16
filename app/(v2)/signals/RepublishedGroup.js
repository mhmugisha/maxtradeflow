'use client';
// Display-layer grouping of consecutive republished rows (the Jun 11
// order-handling-bug cluster). The data is untouched and every row stays in
// the SSR HTML and individually linked (§0.2/§0.3) — collapsed rows are
// merely `hidden` until expanded; no refetch.

import { useState } from 'react';
import SignalRow from './SignalRow';

export default function RepublishedGroup({ rows, bugDate }) {
  const [open, setOpen] = useState(false);
  const [representative, ...rest] = rows;
  const n = rows.length;

  return (
    <>
      <SignalRow
        row={representative}
        extra={
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="rounded border border-v2-line bg-v2-bg px-1.5 py-0.5 text-[10px] font-normal text-v2-text-faint">
              ×{n} republished
            </span>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="rounded border border-v2-line px-1.5 py-0.5 text-[10px] font-normal text-v2-text-muted transition-colors hover:text-v2-accent"
            >
              {open ? '▴ hide' : `▾ all ${n}`}
            </button>
          </span>
        }
      />
      {/* Cause wording is generic on purpose: besides the Jun 11
          order-handling loop there is at least one earlier republication
          cluster (Jun 10), and attributing a specific mechanism to every
          group would overstate what's verified (§0.2). */}
      <tr className={open ? 'border-b border-v2-line' : 'hidden'}>
        <td colSpan={7} className="px-3 py-1.5 text-[10px] italic text-v2-text-faint">
          Republished ×{n} by a since-fixed bot bug on {bugDate}. Every row remains in the
          permanent record.
        </td>
      </tr>
      {rest.map((row) => (
        <SignalRow key={row.href} row={row} hidden={!open} />
      ))}
    </>
  );
}
