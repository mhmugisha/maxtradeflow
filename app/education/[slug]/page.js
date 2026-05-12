'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getArticleBySlug,
  calculateReadTime,
  extractHeadingsFromHTML,
  formatTags,
} from '@/lib/articles';
import styles from './education.module.css';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function TableOfContents({ headings }) {
  if (!headings || headings.length === 0) return null;

  return (
    <nav className={styles.toc}>
      <h4>Table of Contents</h4>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function EducationPage({ params }) {
  const { slug } = params;
  const [article, setArticle] = useState(null);
  const [headings, setHeadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const articleData = await getArticleBySlug(slug);
        if (articleData) {
          setArticle(articleData);
          const extractedHeadings = extractHeadingsFromHTML(articleData.content);
          setHeadings(extractedHeadings);
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
    <article className={styles.educationArticle}>
      <div className={styles.headerSection}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/education">Education</Link>
          <span>/</span>
          <span>{article.title}</span>
        </nav>
      </div>

      <div className={styles.container}>
        {/* Main Content Area */}
        <div className={styles.contentWrapper}>
          {/* Left Sidebar - Table of Contents */}
          <aside className={styles.tocSidebar}>
            <TableOfContents headings={headings} />
          </aside>

          {/* Center Content */}
          <main className={styles.mainContent}>
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.badge}>Education</div>
              <h1 className={styles.title}>{article.title}</h1>

              <div className={styles.meta}>
                <span className={styles.readTime}>{readTime} min read</span>
                {article.updated_at && (
                  <span className={styles.updated}>
                    Updated: {formatDate(article.updated_at)}
                  </span>
                )}
              </div>
            </header>

            {/* Excerpt */}
            {article.excerpt && (
              <p className={styles.excerpt}>{article.excerpt}</p>
            )}

            {/* Content */}
            <div
              className={styles.htmlContent}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map((tag) => (
                  <Link key={tag} href={`/education?tag=${tag}`} className={styles.tag}>
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className={styles.rightSidebar}>
            {/* AdSense Placeholder */}
            <div className={styles.adsenseContainer}>
              <div className={styles.adPlaceholder}>
                <p>Advertisement</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>300x250</p>
              </div>
            </div>

            {/* Tool Guide Links */}
            <div className={styles.toolGuides}>
              <h3>Tool Guides</h3>
              <ul>
                <li>
                  <Link href="/analysis">Market Analysis</Link>
                </li>
                <li>
                  <Link href="/screener">Asset Screener</Link>
                </li>
                <li>
                  <Link href="/forex">Forex Signals</Link>
                </li>
              </ul>
            </div>

            {/* CTA Section */}
            <div className={styles.ctaSection}>
              <h3>Ready to Trade?</h3>
              <p>Start using our Smart Asset Bot to get real-time signals.</p>
              <Link href="/screener" className={styles.ctaButton}>
                Open Screener
              </Link>
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
        title: 'Education Article Not Found',
        description: 'The education article you are looking for does not exist.',
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
      title: 'Education',
      description: 'Learn about trading with our guides',
    };
  }
}
