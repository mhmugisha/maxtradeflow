// One archive table row. Shared by the server page (single rows) and the
// RepublishedGroup client component (grouped rows) so the markup cannot
// drift between the two. Presentational only: every value arrives as a
// precomputed display string from the page.

import Link from 'next/link';

export default function SignalRow({ row, extra = null, hidden = false }) {
  return (
    <tr
      className={`border-b border-v2-line transition-colors last:border-0 hover:bg-v2-surface${hidden ? ' hidden' : ''}`}
    >
      <td className="v2-num px-3 py-2 text-v2-text-faint">
        <Link href={row.href} className="block">{row.when}</Link>
      </td>
      <td className="px-3 py-2 font-medium text-v2-accent">
        {extra ? (
          <div className="flex items-center gap-2">
            <Link href={row.href}>{row.instrument}</Link>
            {extra}
          </div>
        ) : (
          <Link href={row.href} className="block">{row.instrument}</Link>
        )}
      </td>
      <td className={`px-3 py-2 font-medium ${row.dirCls}`}>{row.direction}</td>
      <td className="v2-num px-3 py-2 text-v2-text-muted" title={row.tfsTitle}>{row.tfs}</td>
      <td className="v2-num px-3 py-2 text-v2-text">{row.entry}</td>
      <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] ${row.badgeCls}`}>{row.badgeLabel}</span></td>
      <td className={`v2-num px-3 py-2 ${row.rCls}`}>{row.r}</td>
    </tr>
  );
}
