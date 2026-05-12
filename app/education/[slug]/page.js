import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug } from '@/lib/articles';

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

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href="/" className="text-slate-300 hover:text-white">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/education" className="text-slate-300 hover:text-white">
            Education
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">{article.title}</span>
        </nav>

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

            <section className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-8 prose prose-invert prose-a:text-[#60c8d4] prose-strong:text-white prose-p:leading-relaxed prose-headings:text-white">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </section>
          </main>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-slate-800 bg-slate-950/80 p-6">
              <h2 className="text-xl font-semibold text-white">Tool Guides</h2>
              <ul className="mt-4 space-y-3 text-slate-300">
                <li>
                  <Link href="/analysis" className="text-[#60c8d4] hover:text-white">
                    Market Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/screener" className="text-[#60c8d4] hover:text-white">
                    Asset Screener
                  </Link>
                </li>
                <li>
                  <Link href="/forex" className="text-[#60c8d4] hover:text-white">
                    Forex Signals
                  </Link>
                </li>
                <li>
                  <Link href="/education" className="text-[#60c8d4] hover:text-white">
                    All Education Articles
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
