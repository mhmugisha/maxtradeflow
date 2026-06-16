// components/v2/Nav.js — v2.1 global nav per L1/L2 mockups (A-1).
// Links point at the future v2 routes (/v2/* until cutover); the Pro Trader
// Workspace button renders as "Sign in" until Phase B accounts exist.

import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Markets', href: '/markets' },
  { label: 'Education', href: '/education' },
  { label: 'Tools', href: '/tools' },
  { label: 'AI Trading', href: '/ai-trading' },
  { label: 'News', href: '/news' },
];

export default function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-v2-line bg-v2-surface/95 backdrop-blur"
      style={{ height: 'var(--v2-nav-h)' }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-v2-display text-lg font-bold text-v2-text">
          Max<span className="text-v2-accent">Trade</span>Flow
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded px-3 py-2 text-sm text-v2-text-muted transition-colors hover:text-v2-accent"
            >
              {l.label}
            </Link>
          ))}
        </div>
        {/* Pro Trader Workspace button — "Sign in" until Phase B */}
        <Link
          href="/workspace"
          className="rounded bg-v2-accent px-3.5 py-1.5 text-sm font-medium text-v2-bg transition-opacity hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}
