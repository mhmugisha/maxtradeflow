'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './education-index.module.css';

function calculateReadTime(content) {
  if (!content) return 1;
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const CATEGORIES = {
  all: 'All',
  education: 'Education',
  guide: 'Tool Guides',
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

export default function EducationList({ articles, categoryFilter, tabFilter = false }) {
  const [filteredArticles, setFilteredArticles] = useState(articles);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);

    if (filter === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter((article) => article.subcategory === filter));
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