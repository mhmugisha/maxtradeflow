import { notFound } from 'next/navigation';
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

export async function generateMetadata({ params }) {
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
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

  return (
    <div className={styles.articleContainer}>
      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <div className={styles.articleMeta}>
            <span className={styles.category}>{article.category}</span>
            {article.ticker && (
              <span className={styles.ticker}>{article.ticker}</span>
            )}
            {article.rating && (
              <span
                className={styles.rating}
                style={{ backgroundColor: getRatingColor(article.rating) }}
              >
                {article.rating}
              </span>
            )}
          </div>
          <h1 className={styles.articleTitle}>{article.title}</h1>
          <p className={styles.articleExcerpt}>{article.excerpt}</p>
          <div className={styles.articleStats}>
            <span className={styles.date}>{formatDate(article.created_at)}</span>
            <span className={styles.readTime}>
              {calculateReadTime(article.content)} min read
            </span>
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className={styles.tags}>
              {formatTags(article.tags).map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className={styles.articleContent}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.score !== null && article.score !== undefined && (
          <div className={styles.signalScore}>
            <h3>Signal Score: {article.score}/10</h3>
            <div className={styles.scoreBreakdown}>
              {article.adx !== null && (
                <div className={styles.scoreItem}>
                  <span>ADX</span>
                  <span>{article.adx}</span>
                </div>
              )}
              {article.rsi !== null && (
                <div className={styles.scoreItem}>
                  <span>RSI</span>
                  <span>{article.rsi}</span>
                </div>
              )}
              {article.direction && (
                <div className={styles.scoreItem}>
                  <span>Direction</span>
                  <span>{article.direction}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </article>

      {relatedArticles.length > 0 && (
        <aside className={styles.relatedArticles}>
          <h3>Related Articles</h3>
          <div className={styles.relatedList}>
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/articles/${related.slug}`}
                className={styles.relatedItem}
              >
                <h4>{related.title}</h4>
                <p>{related.excerpt}</p>
                <span className={styles.relatedDate}>
                  {formatDate(related.created_at)}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
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
