// /v2/education — Education hub for v2. Reuses lib/articles.getArticlesByCategory
// (same Neon table the legacy /education page reads from), so both surfaces
// stay in sync until cutover. Article detail pages still live at
// /education/[slug] — a v2 article reader is a separate PR.

import { getArticlesByCategory } from '@/lib/articles';
import { getSignalCounts } from '@/lib/v2-data';
import Breadcrumb from '@/components/v2/Breadcrumb';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import EducationList from '@/components/v2/EducationList';

export const revalidate = 60;

export const metadata = {
  title: 'Education — MaxTradeFlow',
  description: 'Trading education and step-by-step tool guides from MaxTradeFlow.',
};

export default async function EducationHubPage() {
  const [articles, counts] = await Promise.all([
    getArticlesByCategory('education', 100),
    getSignalCounts(),
  ]);

  return (
    <>
      <Breadcrumb items={[{ label: 'Education' }]} />
      <div className="grid grid-cols-[224px_1fr]">
        <MarketsSidebar active="education" counts={counts.byClass} />

        <div className="min-w-0 space-y-6 px-6 py-6">
          <header>
            <h1 className="font-v2-display text-2xl font-bold text-v2-text">Education</h1>
            <p className="mt-1 text-sm text-v2-text-muted">
              Trading strategies, market fundamentals and step-by-step tool guides.
            </p>
          </header>

          <EducationList articles={articles} />

          <RiskDisclaimer variant="compact" />
        </div>
      </div>
    </>
  );
}
