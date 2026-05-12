export const revalidate = 0;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles } from '../../../lib/articles';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Not Found' };
  return {
    title: article.seo_title || article.title + ' | MaxTradeFlow',
    description: article.seo_description || article.excerpt,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.ticker, slug, 3);

  const ratingColor = article.rating === 'TRADE' ? '#1D9E75' : 
                      article.rating === 'WATCH' ? '#EF9F27' : '#e05555';
  
  const directionColor = article.direction === 'LONG' ? '#1D9E75' : '#e05555';
  const directionArrow = article.direction === 'LONG' ? '▲' : '▼';

  return (
    <div style={{ minHeight: '100vh', background: '#080d14', padding: '24px' }}>

      <nav style={{ fontSize: '13px', color: '#3a6070', marginBottom: '8px' }}>
        <Link href="/" style={{ color: '#60c8d4', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href="/articles" style={{ color: '#60c8d4', textDecoration: 'none' }}>Signals</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>{article.ticker}</span>
      </nav>

      <Link href="/articles" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: '#60c8d4', fontSize: '13px', marginBottom: '20px',
        textDecoration: 'none'
      }}>
        ← Back to Signals
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>

        <main>
          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {article.rating && (
                <div style={{ padding: '4px 12px', background: ratingColor, borderRadius: '20px', fontSize: '11px', color: '#fff', fontWeight: '600' }}>
                  {article.rating}
                </div>
              )}
              {article.ticker && (
                <div style={{ padding: '4px 12px', background: '#1a2e42', borderRadius: '20px', fontSize: '11px', color: '#60c8d4', fontWeight: '500' }}>
                  {article.ticker}
                </div>
              )}
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#c8dce8', marginBottom: '8px', lineHeight: '1.3' }}>
              {article.title}
            </h1>
            <div style={{ fontSize: '13px', color: '#3a6070', display: 'flex', gap: '16px' }}>
              <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>Smart Asset Bot</span>
              <span>{Math.ceil(article.content.replace(/<[^>]*>/g, '').split(' ').length / 200)} min read</span>
            </div>
          </div>

          {article.ticker && (
            <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#c8dce8' }}>
                  Live Signal — {article.ticker}
                </span>
                {article.score && (
                  <span style={{ background: '#1a2e42', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', color: '#c8dce8', fontWeight: '500' }}>
                    {article.score} / 10
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {[
                  { label: 'Direction', value: article.direction ? `${directionArrow} ${article.direction}` : '—', color: directionColor },
                  { label: 'Entry Mode', value: article.entry_mode || '—', color: '#c8dce8' },
                  { label: 'ADX', value: article.adx || '—', color: '#c8dce8' },
                  { label: 'RSI', value: article.rsi || '—', color: '#c8dce8' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px', background: '#0d1520', borderRadius: '6px' }}>
                    <span style={{ color: '#3a6070' }}>{label}</span>
                    <span style={{ color, fontWeight: '500' }}>{value}</span>
                  </div>
                ))}
              </div>
              {article.score && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#3a6070', marginBottom: '4px' }}>
                    <span>Signal Score</span>
                    <span style={{ color: ratingColor, fontWeight: '500' }}>{article.score}/10</span>
                  </div>
                  <div style={{ background: '#0d1520', borderRadius: '4px', height: '6px' }}>
                    <div style={{ width: `${article.score * 10}%`, height: '6px', borderRadius: '4px', background: ratingColor }} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {article.tags && article.tags.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {article.tags.map(tag => (
                <span key={tag} style={{ display: 'inline-block', padding: '4px 12px', background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '20px', fontSize: '12px', color: '#3a6070', margin: '0 6px 6px 0' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#c8dce8', marginBottom: '16px', fontWeight: '600' }}>Related Signals</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {related.map(art => (
                  <Link key={art.slug} href={'/articles/' + art.slug} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#60c8d4', marginBottom: '6px' }}>{art.ticker}</div>
                      <div style={{ fontSize: '13px', color: '#c8dce8', fontWeight: '500', lineHeight: '1.4' }}>{art.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside>
          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', color: '#3a6070', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>AdSense</h3>
            <div style={{ background: '#0d1520', border: '0.5px dashed #1a2e42', borderRadius: '8px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#3a6070' }}>
              300×250
            </div>
          </div>

          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', color: '#3a6070', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Related Signals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {related.map(art => (
                <Link key={art.slug} href={'/articles/' + art.slug} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '11px', color: art.rating === 'TRADE' ? '#1D9E75' : art.rating === 'WATCH' ? '#EF9F27' : '#e05555', marginBottom: '2px' }}>{art.rating}</div>
                  <div style={{ fontSize: '13px', color: '#c8dce8', lineHeight: '1.4' }}>{art.title}</div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', color: '#3a6070', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Learn More</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/guides/what-is-signal-score" style={{ fontSize: '13px', color: '#c8dce8', textDecoration: 'none' }}>How signal scores work</Link>
              <Link href="/guides" style={{ fontSize: '13px', color: '#c8dce8', textDecoration: 'none' }}>Sweep vs standard entries</Link>
              <Link href="/education" style={{ fontSize: '13px', color: '#60c8d4', textDecoration: 'none' }}>All Education Articles →</Link>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
