// /v2/signals — public immutable archive (Phase A Session 4 Task 3 / plan
// A-2 "/signals"). ALL signals ever published, newest first, nothing curated
// out (§0.2/§0.3): invalidated and expired rows are as visible as wins.
// Server-side pagination + filtering via search params; chips are client.

import Link from 'next/link';
import { displayFor, formatInstrumentPrice, instrumentsByClass } from '@/lib/instruments';
import { getSignalsPage, getPlatformStatsGate } from '@/lib/v2-data';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import ArchiveFilters from './ArchiveFilters';

export const metadata = {
  title: 'Signal Archive — Every Signal Ever Published — MaxTradeFlow',
  description: 'The complete, immutable archive of Smart Asset Bot signals — wins, losses, expiries and invalidations, nothing curated out.',
};

const PER_PAGE = 20;

const STATUS_BADGE = {
  GENERATED: { label: 'AWAITING', cls: 'border border-v2-line text-v2-text-muted' },
  TRIGGERED: { label: 'ACTIVE', cls: 'bg-v2-accent-soft text-v2-accent' },
  ACTIVE: { label: 'ACTIVE', cls: 'bg-v2-accent-soft text-v2-accent' },
  TP_HIT: { label: '✓ TP', cls: 'bg-v2-bullish-soft text-v2-bullish' },
  SL_HIT: { label: '✗ SL', cls: 'bg-v2-bearish-soft text-v2-bearish' },
  EXPIRED: { label: 'EXPIRED', cls: 'border border-v2-line text-v2-text-faint' },
  INVALIDATED: { label: 'INVALIDATED', cls: 'border border-v2-line text-v2-text-faint' },
};

const fmtWhen = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit', timeZone: 'UTC' })} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

export default async function SignalsArchivePage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const assetClass = ['forex', 'indices', 'commodities', 'crypto'].includes(sp.class) ? sp.class : null;
  const status = ['active', 'tp', 'sl', 'expired', 'invalidated'].includes(sp.status) ? sp.status : null;

  const [{ rows, total }, platformGate] = await Promise.all([
    getSignalsPage({
      page,
      perPage: PER_PAGE,
      assetClass,
      status,
      classTickers: assetClass ? instrumentsByClass(assetClass).map((i) => i.symbol) : null,
    }),
    getPlatformStatsGate(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const sinceLabel = platformGate.earliest
    ? new Date(platformGate.earliest).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    : '—';

  const pageHref = (p) => {
    const q = new URLSearchParams();
    if (assetClass) q.set('class', assetClass);
    if (status) q.set('status', status);
    if (p > 1) q.set('page', String(p));
    return `/v2/signals${q.size ? `?${q}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header>
        <h1 className="font-v2-display text-2xl font-bold text-v2-text">Signal Archive</h1>
        <p className="mt-1 text-sm text-v2-text-muted">
          <span className="v2-num text-v2-accent">{platformGate.totalCount}</span> signals tracked
          since {sinceLabel}. Every signal ever published — wins, losses, expiries and
          invalidations. Nothing is curated out.
        </p>
      </header>

      <ArchiveFilters />

      {rows.length === 0 ? (
        <p className="py-8 text-sm text-v2-text-muted">No signals match these filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-v2-line">
          <table className="w-full min-w-130 text-left text-xs">
            <thead>
              <tr className="border-b border-v2-line text-[10px] uppercase tracking-wide text-v2-text-faint">
                <th className="px-3 py-2 font-normal">Time (UTC)</th>
                <th className="px-3 py-2 font-normal">Instrument</th>
                <th className="px-3 py-2 font-normal">Direction</th>
                <th className="px-3 py-2 font-normal">TFS</th>
                <th className="px-3 py-2 font-normal">Entry</th>
                <th className="px-3 py-2 font-normal">Status</th>
                <th className="px-3 py-2 font-normal">R</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.GENERATED;
                return (
                  <tr key={s.signal_uid} className="border-b border-v2-line transition-colors last:border-0 hover:bg-v2-surface">
                    <td className="v2-num px-3 py-2 text-v2-text-faint">
                      <Link href={`/v2/signals/${s.signal_uid}`} className="block">{fmtWhen(s.generated_at)}</Link>
                    </td>
                    <td className="px-3 py-2 font-medium text-v2-accent">
                      <Link href={`/v2/signals/${s.signal_uid}`} className="block">{displayFor(s.ticker)}</Link>
                    </td>
                    <td className={`px-3 py-2 font-medium ${s.direction === 'LONG' ? 'text-v2-bullish' : 'text-v2-bearish'}`}>{s.direction}</td>
                    <td className="v2-num px-3 py-2 text-v2-text-muted" title={s.derived ? 'Derived from legacy 0–10 score' : undefined}>
                      {s.displayScore != null ? `${s.displayScore}${s.derived ? '*' : ''}` : '—'}
                    </td>
                    <td className="v2-num px-3 py-2 text-v2-text">{formatInstrumentPrice(s.entry_price, s.ticker)}</td>
                    <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] ${badge.cls}`}>{badge.label}</span></td>
                    <td className={`v2-num px-3 py-2 ${s.realizedR == null ? 'text-v2-text-faint' : s.realizedR >= 0 ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
                      {s.realizedR == null ? '—' : `${s.realizedR > 0 ? '+' : ''}${s.realizedR}R`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-v2-text-faint">
          Page <span className="v2-num">{page}</span> of <span className="v2-num">{pages}</span>
          {' '}· <span className="v2-num">{total}</span> signals match
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="min-h-11 rounded border border-v2-line px-3 py-2 text-v2-text-muted transition-colors hover:text-v2-accent md:min-h-8 md:py-1.5">
              ← Newer
            </Link>
          )}
          {page < pages && (
            <Link href={pageHref(page + 1)} className="min-h-11 rounded border border-v2-line px-3 py-2 text-v2-text-muted transition-colors hover:text-v2-accent md:min-h-8 md:py-1.5">
              Older →
            </Link>
          )}
        </div>
      </div>

      <RiskDisclaimer variant="compact" />
    </div>
  );
}
