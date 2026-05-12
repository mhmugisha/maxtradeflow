'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getArticlesByCategory, getAllArticles, calculateReadTime } from '@/lib/articles';
import styles from './education-index.module.css';

const CATEGORIES = {
  all: 'All',
  education: 'Education',
  guide: 'Tool Guides',
  overview: 'How It Works',
};

function ArticleCard({ article }) {
  const readTime = calculateReadTime(article.content);

  return (
    <Link href={`/education/${article.slug}`} className={styles.articleCard}>
      <div className={styles.cardHeader}>
        <span className={styles.category}>{article.category}</span>
      </div>
      <h3 className={styles.cardTitle}>{article.title}</h3>
      <p className={styles.cardExcerpt}>{article.excerpt || article.title}</p>
      <div className={styles.cardFooter}>
        <span className={styles.readTime}>{readTime} min read</span>
      </div>
    </Link>
  );
}

export default function EducationIndexPage() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const allArticles = await getAllArticles();
        const educationArticles = allArticles.filter(
          (article) =>
            article.category === 'education' ||
            article.category === 'guide' ||
            article.category === 'overview'
        );
        setArticles(educationArticles);
        setFilteredArticles(educationArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const handleFilterChange = (category) => {
    setActiveFilter(category);

    if (category === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter((article) => article.category === category));
    }
  };

  return (
    <div className={styles.educationPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Education & Guides</h1>
          <p>Learn trading strategies, how to use our tools, and market fundamentals</p>
        </div>
      </header>

      <div className={styles.container}>
        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.filterTab} ${activeFilter === key ? styles.active : ''}`}
              onClick={() => handleFilterChange(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && <div className={styles.loading}>Loading articles...</div>}

        {/* Articles Grid */}
        {!loading && filteredArticles.length > 0 ? (
          <div className={styles.articlesGrid}>
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className={styles.emptyState}>
              <p>No articles found in this category.</p>
              <Link href="/education" className={styles.resetLink}>
                View all articles
              </Link>
            </div>
          )
        )}
      </div>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Start Trading?</h2>
          <p>Access our Smart Asset Bot and start receiving real-time trading signals</p>
          <Link href="/screener" className={styles.ctaButton}>
            Open the Screener
          </Link>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: 'Education & Guides - MaxTradeFlow',
    description:
      'Learn trading strategies, how to use our tools, and understand market fundamentals with our comprehensive education and guide articles.',
    keywords: 'trading education, trading guides, market analysis, financial guides',
  };
}
