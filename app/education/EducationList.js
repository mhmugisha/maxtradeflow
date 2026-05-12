'use client';

import { useState } from 'react';
import Link from 'next/link';
import { calculateReadTime } from '@/lib/articles';
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

export default function EducationList({ articles }) {
  const [filteredArticles, setFilteredArticles] = useState(articles);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterChange = (category) => {
    setActiveFilter(category);

    if (category === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter((article) => article.category === category));
    }
  };

  return (
    <>
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

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className={styles.articlesGrid}>
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No articles found in this category.</p>
          <Link href="/education" className={styles.resetLink}>
            View all articles
          </Link>
        </div>
      )}
    </>
  );
}