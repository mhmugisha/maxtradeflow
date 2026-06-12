// components/v2/ClassCards.js — the five asset-class cards (L2 "All Markets"
// + home markets overview). counts = getSignalCounts().byClass.

import Link from 'next/link';
import { ASSET_CLASSES } from './assetClassMeta';

export default function ClassCards({ counts = {} }) {
  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
      {ASSET_CLASSES.map((a) => {
        const n = counts[a.key] ?? 0;
        return (
          <Link
            key={a.key}
            href={a.href}
            className="group w-60 shrink-0 snap-start overflow-hidden rounded-md border border-v2-line bg-v2-surface transition-colors hover:border-v2-line-strong md:w-auto"
          >
            <div className={`h-0.5 ${a.accentBar}`} />
            <div className="p-3">
              <div className="text-xl">{a.icon}</div>
              <div className="mt-1 text-sm font-medium text-v2-text">{a.name}</div>
              <div className="text-[11px] text-v2-text-faint">{a.desc}</div>
              <div className="mt-2">
                {a.comingSoon ? (
                  <span className="rounded-full border border-v2-line px-2 py-0.5 text-[10px] text-v2-text-faint">Coming soon</span>
                ) : n > 0 ? (
                  <span className="rounded-full bg-v2-bullish-soft px-2 py-0.5 text-[10px] text-v2-bullish">● {n} active</span>
                ) : (
                  <span className="rounded-full border border-v2-line px-2 py-0.5 text-[10px] text-v2-text-faint">No signals</span>
                )}
              </div>
              <div className="mt-2 text-[11px] text-v2-text-muted transition-colors group-hover:text-v2-accent">View →</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
