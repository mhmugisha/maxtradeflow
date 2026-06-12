// components/v2/Breadcrumb.js — thin breadcrumb strip under the nav per the
// L2/L3 mockups. items: [{ label, href? }] — the last item is the current
// page (no link, brighter text).

import Link from 'next/link';
import { BreadcrumbJsonLd } from './JsonLd';

export default function Breadcrumb({ items }) {
  return (
    <div className="border-b border-v2-line bg-v2-surface/60">
      <BreadcrumbJsonLd items={items} />
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-2 text-xs">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <span key={item.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-v2-text-faint">›</span>}
              {last || !item.href ? (
                <span className={last ? 'text-v2-text' : 'text-v2-text-muted'}>{item.label}</span>
              ) : (
                <Link href={item.href} className="text-v2-text-muted transition-colors hover:text-v2-accent">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
