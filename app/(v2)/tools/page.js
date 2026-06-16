// /v2/tools — calculators hub per docs/mockups/Tools_Hub.png (Phase A
// Session 5 Task 2). A grid of the 8 calculators; slugs mirror the legacy
// /tools/* pages exactly so cutover replaces them in place.

import Link from 'next/link';
import { getSignalCounts } from '@/lib/v2-data';
import { TOOLS } from '@/components/v2/tools/toolsMeta';
import Breadcrumb from '@/components/v2/Breadcrumb';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';

export const revalidate = 60;

export const metadata = {
  title: 'Trading Calculators — MaxTradeFlow',
  description:
    'Free trading calculators: position size, pip value, risk/reward, margin, P&L, compounding, ATR volatility and session times.',
};

export default async function ToolsHubPage() {
  const counts = await getSignalCounts();

  return (
    <>
      <Breadcrumb items={[{ label: 'Tools' }]} />
      <div className="grid grid-cols-[224px_1fr]">
        <MarketsSidebar active="tools" counts={counts.byClass} />

        <div className="min-w-0 space-y-6 px-6 py-6">
          <header className="space-y-2">
            <h1 className="font-v2-display text-2xl font-bold text-v2-text">Trading Calculators</h1>
            <p className="max-w-xl text-sm text-v2-text-muted">
              Free tools to plan your trades before you place them. Know your risk, your
              position size, and your potential reward before you enter the market.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col rounded-md border border-v2-line bg-v2-surface p-4 transition-colors hover:border-v2-line-strong"
              >
                <div className="mb-2 flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-v2-line bg-v2-bg text-lg"
                    aria-hidden
                  >
                    {tool.icon}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-v2-accent">{tool.category}</div>
                    <h2 className="font-v2-display text-sm font-semibold text-v2-text">{tool.name}</h2>
                  </div>
                </div>
                <p className="mb-3 flex-1 text-xs leading-relaxed text-v2-text-muted">{tool.short}</p>
                <div className="text-xs text-v2-accent group-hover:underline">Open calculator →</div>
              </Link>
            ))}
          </div>

          <RiskDisclaimer variant="compact" />
        </div>
      </div>
    </>
  );
}
