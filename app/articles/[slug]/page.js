import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, getRelatedArticles } from '@/lib/articles';

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function calculateReadTime(content) {
  if (!content) return 1;
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function normalizeScore(score) {
  const value = Number(score ?? 0);
  if (Number.isNaN(value)) return 0;
  if (value <= 10) return Math.min(100, Math.max(0, value * 10));
  return Math.min(100, Math.max(0, value));
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || 'Trading article from MaxTradeFlow.',
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || 'Trading article from MaxTradeFlow.',
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.ticker, slug, 3);
  const readTime = calculateReadTime(article.content);
  const scorePercent = normalizeScore(article.score);
  const signalBadgeColor = article.rating === 'TRADE' ? '#1D9E75' : article.rating === 'AVOID' ? '#e05555' : '#60c8d4';
  const entryValue = article.entry_mode || article.entry || '-';
  const stopLossValue = article.stop_loss || article.sl || '-';
  const takeProfitValue = article.take_profit || article.tp || '-';
  const rrValue = article.rr_ratio || article.rr || '-';

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href="/" className="text-slate-300 hover:text-white">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/articles" className="text-slate-300 hover:text-white">
            Articles
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">{article.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <main className="space-y-8">
            <section className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#60c8d4] bg-[#60c8d4]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#60c8d4]">
                  Signal
                </span>
                {article.rating && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase"
                    style={{ backgroundColor: signalBadgeColor, color: '#0b1120' }}
                  >
                    {article.rating}
                  </span>
                )}
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {article.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span>{formatDate(article.created_at)}</span>
                <span>•</span>
                <span>{readTime} min read</span>
                {article.ticker && (
                  <>
                    <span>•</span>
                    <span className="text-[#60c8d4]">{article.ticker}</span>
                  </>
                )}
              </div>

              {article.excerpt && <p className="mt-6 max-w-3xl text-slate-300">{article.excerpt}</p>}

              {article.tags && article.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-sm text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {article.ticker && (
              <section className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Signal Card</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">Trade details</h2>
                  </div>
                  <div className={`rounded-full px-4 py-2 text-sm font-semibold ${article.direction === 'Bearish' ? 'bg-[#e05555]/15 text-[#e05555]' : 'bg-[#1D9E75]/15 text-[#1D9E75]'}`}>
                    {article.direction || 'Neutral'}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[#0d1220]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Entry</p>
                    <p className="mt-2 text-lg font-semibold text-white">{entryValue}</p>
                  </div>
                  <div className="rounded-3xl bg-[#0d1220]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stop Loss</p>
                    <p className="mt-2 text-lg font-semibold text-white">{stopLossValue}</p>
                  </div>
                  <div className="rounded-3xl bg-[#0d1220]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Take Profit</p>
                    <p className="mt-2 text-lg font-semibold text-white">{takeProfitValue}</p>
                  </div>
                  <div className="rounded-3xl bg-[#0d1220]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">RR Ratio</p>
                    <p className="mt-2 text-lg font-semibold text-white">{rrValue}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-[#0d1220]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ADX</p>
                    <p className="mt-2 text-lg font-semibold text-white">{article.adx ?? '-'}</p>
                  </div>
                  <div className="rounded-3xl bg-[#0d1220]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">RSI</p>
                    <p className="mt-2 text-lg font-semibold text-white">{article.rsi ?? '-'}</p>
                  </div>
                  <div className="rounded-3xl bg-[#0d1220]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Score</p>
                    <p className="mt-2 text-lg font-semibold text-white">{article.score ?? '-'}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-slate-900/90 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                    <span>Signal strength</span>
                    <span>{scorePercent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${scorePercent}%`,
                        backgroundColor: scorePercent >= 70 ? '#1D9E75' : '#e05555',
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            <section className="prose prose-invert max-w-none rounded-[32px] border border-slate-800 bg-slate-950/80 p-8 text-slate-200 prose-a:text-[#60c8d4] prose-strong:text-white prose-p:leading-relaxed prose-h2:text-white prose-h3:text-white prose-img:rounded-3xl">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </section>
          </main>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="text-xl font-semibold text-white">Related Articles</h2>
              <div className="mt-4 space-y-4">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/articles/${related.slug}`}
                      className="block rounded-3xl border border-slate-800 bg-[#0d1220]/80 p-4 transition hover:border-[#60c8d4] hover:bg-[#0f1622]"
                    >
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{related.category}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{related.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">{related.excerpt || 'Read more about this topic.'}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No related articles available.</p>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="text-xl font-semibold text-white">Learn More</h2>
              <ul className="mt-4 space-y-3 text-slate-300">
                <li>
                  <Link href="/education" className="text-[#60c8d4] hover:text-white">
                    Education & Guides
                  </Link>
                </li>
                <li>
                  <Link href="/screener" className="text-[#60c8d4] hover:text-white">
                    Asset Screener
                  </Link>
                </li>
                <li>
                  <Link href="/analysis" className="text-[#60c8d4] hover:text-white">
                    Market Analysis
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
