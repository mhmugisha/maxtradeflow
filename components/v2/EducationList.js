'use client';

// components/v2/EducationList.js — client-side filterable article grid for
// the v2 Education hub. Articles are pre-fetched server-side and filtered
// in memory by subcategory; matches the v1 EducationList UX (same All /
// Education / Tool Guides tabs) with v2 styling.

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'education', label: 'Education' },
  { key: 'guide', label: 'Tool Guides' },
];

// 200 wpm — matches the v1 calculation so read times don't drift between
// the two hubs while both exist.
function readTimeMinutes(content) {
  if (!content) return 1;
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function ArticleCard({ article }) {
  const minutes = readTimeMinutes(article.content);
  return (
    <Link
      href={`/education/${article.slug}`}
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

export default function EducationList({ articles }) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all'
    ? articles
    : articles.filter((a) => a.subcategory === filter);

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
