// components/v2/tools/ToolShell.js — shared server-side frame for the 8
// calculator pages: breadcrumb, sidebar, header, cross-links to related
// calculators (Calculator_Expanded.png "Use with these calculators"), and
// the compact RiskDisclaimer.

import Link from 'next/link';
import Breadcrumb from '../Breadcrumb';
import MarketsSidebar from '../MarketsSidebar';
import RiskDisclaimer from '../RiskDisclaimer';
import { toolBySlug } from './toolsMeta';

export default function ToolShell({ slug, counts, children }) {
  const tool = toolBySlug(slug);
  const related = (tool?.related ?? []).map(toolBySlug).filter(Boolean);

  return (
    <>
      <Breadcrumb items={[{ label: 'Tools', href: '/v2/tools' }, { label: tool.name }]} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4">
        <MarketsSidebar active={`tools:${slug}`} counts={counts?.byClass} />

        <div className="min-w-0 flex-1 space-y-8 py-6">
          <header className="space-y-2">
            <h1 className="font-v2-display text-2xl font-bold text-v2-text">{tool.name}</h1>
            <p className="max-w-xl text-sm text-v2-text-muted">{tool.short}</p>
          </header>

          {children}

          {related.length > 0 && (
            <section>
              <h2 className="mb-3 text-[10px] uppercase tracking-widest text-v2-text-faint">
                Use with these calculators
              </h2>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/v2/tools/${r.slug}`}
                    className="flex min-h-11 items-center gap-2 rounded-md border border-v2-line bg-v2-surface px-3 text-sm text-v2-text-muted transition-colors hover:border-v2-line-strong hover:text-v2-text"
                  >
                    <span aria-hidden>{r.icon}</span>
                    {r.name}
                    <span className="text-v2-accent">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <RiskDisclaimer variant="compact" />
        </div>
      </div>
    </>
  );
}
