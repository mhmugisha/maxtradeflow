import { getArticlesByCategory } from '../../lib/articles';
import Link from 'next/link';

export const metadata = {
  title: 'Tool Guides | MaxTradeFlow',
  description: 'Learn how MaxTradeFlow tools work and how to read our signals',
};

export default async function GuidesPage() {
  const guides = await getArticlesByCategory('guide', 20);
  return (
    <div style={{ minHeight: '100vh', background: '#080d14' }}>
      <div style={{ padding: '40px 24px', textAlign: 'center', background: '#111e2e', borderBottom: '0.5px solid #1a2e42' }}>
        <h1 style={{ fontSize: '32px', color: '#c8dce8', marginBottom: '12px', fontWeight: '600' }}>
          Tool Guides
        </h1>
        <p style={{ color: '#3a6070', fontSize: '15px' }}>
          Learn how MaxTradeFlow tools work and how to read our signals
        </p>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {guides.length === 0 ? (
          <p style={{ color: '#3a6070', textAlign: 'center' }}>No guides found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {guides.map(article => (
              <Link key={article.slug} href={'/guides/' + article.slug} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#111e2e', border: '0.5px solid #1a2e42', borderRadius: '12px', padding: '20px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '11px', color: '#60c8d4', marginBottom: '8px', fontWeight: '500', letterSpacing: '0.05em' }}>
                    GUIDE
                  </div>
                  <h3 style={{ fontSize: '15px', color: '#c8dce8', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4' }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#3a6070', lineHeight: '1.6', marginBottom: '12px' }}>
                    {article.excerpt}
                  </p>
                  <div style={{ fontSize: '11px', color: '#3a6070' }}>
                    {Math.ceil(article.content.replace(/<[^>]*>/g, '').split(' ').length / 200)} min read
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
