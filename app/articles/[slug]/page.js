'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getArticleBySlug, getRelatedArticles, calculateReadTime, formatTags } from '@/lib/articles';
import styles from './article.module.css';

const RATING_COLORS = {
  TRADE: '#1D9E75',
  WATCH: '#f59e0b',
  AVOID: '#e05555',
};

function getRatingColor(rating) {
  return RATING_COLORS[rating] || '#666';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ArticlePage({ params }) {
  const { slug } = params;
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const articleData = await getArticleBySlug(slug);
        if (articleData) {
          setArticle(articleData);
          const related = await getRelatedArticles(articleData.ticker, slug, 3);
          setRelatedArticles(related);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!article) {
    return <div className={styles.container}>Article not found</div>;
  }

  const readTime = calculateReadTime(article.content);
  const tags = formatTags(article.tags);

  return (
    <article className={styles.article}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/articles?category=${article.category}`}>
            {article.category}
          </Link>
          <span>/</span>
          <span>{article.title}</span>
        </nav>

        {/* Header Section */}
        <div className={styles.header}>
          {article.rating && (
            <div
              className={styles.signalBadge}
              style={{ backgroundColor: getRatingColor(article.rating) }}
            >
              {article.rating}
            </div>
          )}

          <h1 className={styles.title}>{article.title}</h1>

          <div className={styles.meta}>
            <span className={styles.date}>
              {formatDate(article.created_at)}
            </span>
            <span className={styles.author}>Smart Asset Bot</span>
            <span className={styles.readTime}>{readTime} min read</span>
          </div>
        </div>

        <div className={styles.mainContent}>
          {/* Sidebar Left */}
          <aside className={styles.sidebarLeft}>
            {article.direction && (
              <div className={styles.signalCard}>
                <h3>Signal Information</h3>
                <div className={styles.signalGrid}>
                  <div>
                    <span className={styles.label}>Direction</span>
                    <span className={styles.value}>{article.direction}</span>
                  </div>
                  <div>
                    <span className={styles.label}>Entry</span>
                    <span className={styles.value}>{article.entry_mode || '-'}</span>
                  </div>
                  {article.score && (
                    <div>
                      <span className={styles.label}>Score</span>
                      <div className={styles.scoreBar}>
                        <div
                          className={styles.scoreValue}
                          style={{
                            width: `${(article.score / 100) * 100}%`,
                            backgroundColor: article.score >= 70 ? '#1D9E75' : '#f59e0b',
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {article.adx && (
                    <div>
                      <span className={styles.label}>ADX</span>
                      <span className={styles.value}>{parseFloat(article.adx).toFixed(2)}</span>
                    </div>
                  )}
                  {article.rsi && (
                    <div>
                      <span className={styles.label}>RSI</span>
                      <span className={styles.value}>{parseFloat(article.rsi).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className={styles.content}>
            {article.excerpt && (
              <p className={styles.excerpt}>{article.excerpt}</p>
            )}

            <div
              className={styles.htmlContent}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {tags && tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map((tag) => (
                  <Link key={tag} href={`/articles?tag=${tag}`} className={styles.tag}>
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </main>

          {/* Sidebar Right */}
          <aside className={styles.sidebarRight}>
            {/* AdSense Placeholder */}
            <div className={styles.adsenseContainer}>
              <div className={styles.adPlaceholder}>
                <p>Advertisement</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>300x250</p>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className={styles.relatedSection}>
                <h3>Related Articles</h3>
                <div className={styles.relatedList}>
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/articles/${related.slug}`}
                      className={styles.relatedItem}
                    >
                      <div className={styles.relatedTitle}>{related.title}</div>
                      <div className={styles.relatedCategory}>{related.category}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Learn More Links */}
            <div className={styles.learnMore}>
              <h3>Learn More</h3>
              <ul>
                <li>
                  <Link href="/education">Trading Guides</Link>
                </li>
                <li>
                  <Link href="/screener">Asset Screener</Link>
                </li>
                <li>
                  <Link href="/analysis">Market Analysis</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        ${styles.toString && styles.toString()}
      `}</style>
    </article>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const article = await getArticleBySlug(slug);
    
    if (!article) {
      return {
        title: 'Article Not Found',
        description: 'The article you are looking for does not exist.',
      };
    }

    return {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || article.title,
      keywords: article.tags?.join(', '),
      openGraph: {
        title: article.title,
        description: article.excerpt,
        type: 'article',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Article',
      description: 'Read our latest article',
    };
  }
}
