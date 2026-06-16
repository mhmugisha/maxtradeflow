'use client';

// components/v2/NewsList.js — client-side filterable article grid for the
// v2 News hub. Mirrors EducationList structurally (same card design + 200wpm
// read-time calc) so the two hubs stay visually consistent until cutover.
// Filters by article.category. The 'news' category is empty in the DB as of
// branch creation — the empty state renders honestly until content arrives;
// the Market News / Analysis tabs scaffold for the eventual split.

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'news', label: 'Market News' },
  { key: 'analysis', label: 'Analysis' },
];

function readTimeMinutes(content) {
  if (!content) return 1;
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function ArticleCard({ article }) {
  const minutes = readTimeMinutes(article.content);
  return (
    <Link
      href={`/news/${article.slug}`}
      className="flex h-full flex-col rounded-md border border-v2-line bg-v2-surface p-4 transition-colors hover:border-v2-line-strong"
    >
      {article.category && (
        <div className="mb-2 text-[10px] uppercase tracking-widest text-v2-accent">
          {article.category}
        </div>
      )}
      <h2 className="font-v2-display text-sm font-semibold leading-snug text-v2-text">
        {article.title}
      </h2>
      {article.excerpt && (
        <p className="mt-2 flex-1 text-xs leading-relaxed text-v2-text-muted">
          {article.excerpt}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px] text-v2-text-faint">
        <span className="v2-num">{minutes} min read</span>
        <span className="text-v2-accent">Read →</span>
      </div>
    </Link>
  );
}

export default function NewsList({ articles }) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all'
    ? articles
    : articles.filter((a) => a.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-v2-line pb-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`min-h-11 rounded-full border px-3 text-xs transition-colors md:min-h-8 ${
              filter === c.key
                ? 'border-v2-line-strong bg-v2-accent-soft text-v2-accent'
                : 'border-v2-line text-v2-text-muted hover:text-v2-text'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-v2-line bg-v2-surface p-6 text-center text-sm text-v2-text-muted">
          No articles in this category yet — new ones publish continuously.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((a) => (
            <ArticleCard key={a.id ?? a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
