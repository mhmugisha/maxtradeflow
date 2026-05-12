import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getRecentArticles } from '../../../lib/articles';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Not Found' };
  return {
    title: article.seo_title || article.title + ' | MaxTradeFlow',
    description: article.seo_description || article.excerpt,
  };
}

export default async function GuidesArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  
  const recentArticles = await getRecentArticles(4);
  const related = recentArticles.filter(a => a.slug !== slug).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#080d14', padding: '24px' }}>
      
      <nav style={{ fontSize: '13px', color: '#3a6070', marginBottom: '8px' }}>
        <Link href="/" style={{ color: '#60c8d4', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href="/guides" style={{ color: '#60c8d4', textDecoration: 'none' }}>Guides</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>{article.title}</span>
      </nav>

      <Link href="/guides" style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: '#60c8d4', fontSize: '13px', marginBottom: '20px',
        textDecoration: 'none'
      }}>
        ← Back to Guides
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        
        <main>
          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: '#1a3a4a', borderRadius: '20px', fontSize: '11px', color: '#60c8d4', fontWeight: '500', marginBottom: '12px', letterSpacing: '0.05em' }}>
              {article.category.toUpperCase()}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#c8dce8', marginBottom: '8px', lineHeight: '1.3' }}>
              {article.title}
            </h1>
            <div style={{ fontSize: '13px', color: '#3a6070', display: 'flex', gap: '16px' }}>
              <span>{Math.ceil(article.content.replace(/<[^>]*>/g, '').split(' ').length / 200)} min read</span>
              <span>Updated {new Date(article.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', color: '#c8dce8', marginBottom: '16px', fontWeight: '600' }}>More Articles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {related.map(art => (
                <Link key={art.slug} href={'/guides/' + art.slug} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#60c8d4', marginBottom: '6px' }}>{art.category.toUpperCase()}</div>
                    <div style={{ fontSize: '13px', color: '#c8dce8', fontWeight: '500', marginBottom: '4px', lineHeight: '1.4' }}>{art.title}</div>
                    <div style={{ fontSize: '11px', color: '#3a6070' }}>{Math.ceil(art.content.replace(/<[^>]*>/g, '').split(' ').length / 200)} min read</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        <aside>
          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', color: '#3a6070', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Tool Guides</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/guides" style={{ fontSize: '13px', color: '#c8dce8', textDecoration: 'none' }}>How the scoring system works</Link>
              <Link href="/guides" style={{ fontSize: '13px', color: '#c8dce8', textDecoration: 'none' }}>Sweep vs standard entries</Link>
              <Link href="/guides" style={{ fontSize: '13px', color: '#c8dce8', textDecoration: 'none' }}>Stop loss logic explained</Link>
              <Link href="/education" style={{ fontSize: '13px', color: '#60c8d4', textDecoration: 'none' }}>All Education Articles →</Link>
            </div>
          </div>

          <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', color: '#3a6070', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Recent Articles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {related.map(art => (
                <Link key={art.slug} href={'/guides/' + art.slug} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: '11px', color: '#60c8d4', marginBottom: '2px' }}>{art.category.toUpperCase()}</div>
                  <div style={{ fontSize: '13px', color: '#c8dce8', lineHeight: '1.4' }}>{art.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}