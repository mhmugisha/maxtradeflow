// /v2/news — News hub shell. The 'news' category has no rows in production
// at branch creation (Sep 2026 check: education=14, guide=1, signal=863,
// news=0); this page renders the empty state honestly and closes the
// pre-existing /v2/news link in components/v2/Nav.js. When bot-published
// news arrives with category='news' or 'analysis', the NewsList tabs filter
// it without further changes here.

import { getArticlesByCategory } from '@/lib/articles';
import { getSignalCounts } from '@/lib/v2-data';
import Breadcrumb from '@/components/v2/Breadcrumb';
import MarketsSidebar from '@/components/v2/MarketsSidebar';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import NewsList from '@/components/v2/NewsList';

export const revalidate = 60;

export const metadata = {
  title: 'News — MaxTradeFlow',
  description: 'Market news, analysis and economic events from MaxTradeFlow.',
};

export default async function NewsHubPage() {
  const [news, analysis, counts] = await Promise.all([
    getArticlesByCategory('news', 100),
    getArticlesByCategory('analysis', 100),
    getSignalCounts(),
  ]);
  const articles = [...news, ...analysis]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <>
      <Breadcrumb items={[{ label: 'News' }]} />
      <div className="grid grid-cols-[224px_1fr]">
        <MarketsSidebar active="news" counts={counts.byClass} />

        <div className="min-w-0 space-y-6 px-6 py-4">
          <header>
            <h1 className="font-v2-display text-2xl font-bold text-v2-text">News</h1>
            <p className="mt-1 text-sm text-v2-text-muted">
              Market news, analysis and economic events.
            </p>
          </header>

          <NewsList articles={articles} />

          <RiskDisclaimer variant="compact" />
        </div>
      </div>
    </>
  );
}
