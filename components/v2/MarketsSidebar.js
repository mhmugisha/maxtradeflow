// components/v2/MarketsSidebar.js — persistent left sidebar for L2/L3/L4 per
// the mockups (A-2). Client component only for the mobile drawer toggle
// (§22: sidebar → drawer on mobile, tap targets ≥44px); desktop renders a
// sticky column. Signal-count badges arrive via props from getSignalCounts()
// so this component stays render-only.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ASSET_CLASSES } from './assetClassMeta';
import { TOOLS as TOOL_PAGES } from './tools/toolsMeta';

const DISCOVER = [
  { label: 'All Signals', href: '/signals', key: 'signals' },
  { label: 'AI Trading', href: '/ai-trading', key: 'ai-trading' },
  { label: 'Sessions', href: '/tools/session-converter' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Education', href: '/education', key: 'education' },
  { label: 'News', href: '/news', key: 'news' },
];

// All 8 calculators, from the tools registry. Active key: `tools:<slug>`
// (passed by ToolShell).
const TOOLS = TOOL_PAGES.map((t) => ({
  label: t.sidebarLabel,
  href: `/tools/${t.slug}`,
  key: `tools:${t.slug}`,
}));

function SectionLabel({ children }) {
  return (
    <div className="px-3 pb-1 pt-4 text-[10px] uppercase tracking-widest text-v2-text-faint">
      {children}
    </div>
  );
}

function Item({ href, label, active, badge, badgeTone }) {
  return (
    <Link
      href={href}
      className={`flex min-h-11 items-center justify-between gap-2 border-l-2 px-3 py-2 text-sm transition-colors md:min-h-0 md:py-1.5 ${
        active
          ? 'border-v2-accent bg-v2-accent-soft text-v2-text'
          : 'border-transparent text-v2-text-muted hover:bg-v2-surface hover:text-v2-text'
      }`}
    >
      <span>{label}</span>
      {badge != null && (
        <span className={`v2-num rounded px-1.5 py-0.5 text-[10px] ${badgeTone}`}>{badge}</span>
      )}
    </Link>
  );
}

function SidebarBody({ active, counts }) {
  return (
    <nav className="pb-4">
      <SectionLabel>Markets</SectionLabel>
      <Item href="/markets" label="Overview" active={active === 'overview'} />
      {ASSET_CLASSES.map((c) => {
        const n = counts?.[c.key] ?? 0;
        return (
          <Item
            key={c.key}
            href={c.href}
            label={c.name}
            active={active === c.key}
            badge={c.comingSoon ? '—' : n > 0 ? n : '—'}
            badgeTone={
              !c.comingSoon && n > 0
                ? 'bg-v2-bullish-soft text-v2-bullish'
                : 'text-v2-text-faint'
            }
          />
        );
      })}

      <SectionLabel>Featured</SectionLabel>
      <Link
        href="/markets/commodities/xauusd"
        className="flex min-h-11 items-center justify-between gap-2 border-l-2 border-transparent px-3 py-2 text-sm text-v2-gold transition-colors hover:bg-v2-gold-soft md:min-h-0 md:py-1.5"
      >
        <span>🥇 Gold</span>
        <span className="h-1.5 w-1.5 rounded-full bg-v2-gold" aria-hidden />
      </Link>

      <SectionLabel>Discover</SectionLabel>
      {DISCOVER.map((d) => (
        <Item
          key={d.href}
          href={d.href}
          label={d.label}
          active={d.key ? active === d.key : false}
        />
      ))}

      <SectionLabel>Tools</SectionLabel>
      {TOOLS.map((t) => (
        <Item key={t.href} href={t.href} label={t.label} active={active === t.key} />
      ))}
    </nav>
  );
}

export default function MarketsSidebar({ active = 'overview', counts = {} }) {
  const [open, setOpen] = useState(false);
  // Mobile drawer button auto-hides while scrolling down so it never sits on
  // top of the content being read, and reappears on the first scroll up.
  const [buttonHidden, setButtonHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setButtonHidden(y > lastY && y > 64);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Desktop: sticky column */}
      <aside
        className="sticky hidden w-56 shrink-0 self-start border-r border-v2-line md:block"
        style={{ top: 'var(--v2-nav-h)' }}
      >
        <SidebarBody active={active} counts={counts} />
      </aside>

      {/* Mobile: drawer. Compact circular trigger bottom-right, clear of the
          fixed price ticker; auto-hides on scroll-down. */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed right-3 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-v2-line-strong bg-v2-surface text-lg text-v2-text shadow-lg transition-all duration-200 md:hidden ${
          buttonHidden ? 'pointer-events-none translate-y-4 opacity-0' : ''
        }`}
        style={{ bottom: 'calc(var(--v2-ticker-h) + 0.75rem)' }}
        aria-label="Open markets menu"
      >
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-v2-bg/80"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 top-0 w-64 overflow-y-auto border-r border-v2-line bg-v2-surface">
            <div className="flex items-center justify-between border-b border-v2-line px-3 py-3">
              <span className="font-v2-display text-sm font-semibold text-v2-text">Markets</span>
              <button
                onClick={() => setOpen(false)}
                className="flex min-h-11 min-w-11 items-center justify-center text-v2-text-muted"
                aria-label="Close markets menu"
              >
                ✕
              </button>
            </div>
            <div onClick={() => setOpen(false)}>
              <SidebarBody active={active} counts={counts} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
