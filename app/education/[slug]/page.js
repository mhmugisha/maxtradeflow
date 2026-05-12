import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, getRecentArticles } from '@/lib/articles';

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

export async function generateMetadata({ params }) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Education Article Not Found',
      description: 'The requested education article could not be found.',
    };
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || 'Education article from MaxTradeFlow.',
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || 'Education article from MaxTradeFlow.',
      type: 'article',
    },
  };
}

export default async function EducationPage({ params }) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const readTime = calculateReadTime(article.content);
  const allRecentArticles = await getRecentArticles(4);
  const relatedArticles = allRecentArticles.filter(a => a.slug !== slug);

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-sm text-slate-400">
          <Link href="/" className="text-[#60c8d4] hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/education" className="text-[#60c8d4] hover:underline">
            Education
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">{article.title}</span>
        </nav>

        <Link href="/education" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: '#60c8d4', fontSize: '13px', marginBottom: '20px',
          textDecoration: 'none'
        }}>
          ← Back to Education
        </Link>

        <div className="grid gap-8 lg:grid-cols-[2fr_0.9fr]">
          <main className="space-y-8">
            <section className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#60c8d4] bg-[#60c8d4]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#60c8d4]">
                  Education
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {article.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{readTime} min read</span>
                {article.updated_at && (
                  <>
                    <span>•</span>
                    <span>Updated {formatDate(article.updated_at)}</span>
                  </>
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-6">
              <div 
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="article-content"
              />
            </section>

            {relatedArticles.length > 0 && (
              <div style={{marginTop: '24px'}}>
                <h3 style={{fontSize: '16px', color: '#c8dce8', marginBottom: '16px'}}>
                  More articles
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  {relatedArticles.map(article => (
                    <Link key={article.slug} href={`/education/${article.slug}`} style={{textDecoration: 'none'}}>
                      <div style={{\n                        background: '#111e2e', border: '0.5px solid #1a2e42',\n                        borderRadius: '8px', padding: '16px',\n                        cursor: 'pointer',\n                        transition: 'border-color 0.2s',\n                      }}>\n                        <div style={{fontSize: '11px', color: '#60c8d4', marginBottom: '6px'}}>\n                          {article.category.toUpperCase()}\n                        </div>\n                        <div style={{fontSize: '13px', color: '#c8dce8', fontWeight: '500', \n                          marginBottom: '4px', lineHeight: '1.4'}}>\n                          {article.title}\n                        </div>\n                        <div style={{fontSize: '11px', color: '#3a6070'}}>\n                          {Math.ceil(article.content.replace(/<[^>]*>/g, '').split(' ').length / 200)} min read\n                        </div>\n                      </div>\n                    </Link>\n                  ))}\n                </div>\n              </div>\n            )}\n          </main>\n\n          <aside className="space-y-6">\n            <div className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-6">\n              <h2 className="text-lg font-semibold text-white">Recent Articles</h2>\n              <ul className="mt-4 space-y-3 text-slate-300">\n                {relatedArticles.slice(0, 3).map(art => (\n                  <li key={art.id}>\n                    <Link href={`/education/${art.slug}`} className="text-[#60c8d4] hover:text-white transition-colors text-sm">\n                      {art.title}\n                    </Link>\n                    <div style={{fontSize: '11px', color: '#60c8d4', marginTop: '4px'}}>\n                      {art.category}\n                    </div>\n                  </li>\n                ))}\n              </ul>\n            </div>\n          </aside>\n        </div>\n      </div>\n    </div>\n  );
}
