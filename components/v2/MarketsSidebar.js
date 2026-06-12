// components/v2/MarketsSidebar.js — persistent left sidebar for L2/L3/L4 per
// the mockups (A-2). Client component only for the mobile drawer toggle
// (§22: sidebar → drawer on mobile, tap targets ≥44px); desktop renders a
// sticky column. Signal-count badges arrive via props from getSignalCounts()
// so this component stays render-only.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ASSET_CLASSES } from './assetClassMeta';
import { TOOLS as TOOL_PAGES } from './tools/toolsMeta';

const DISCOVER = [
  { label: 'All Signals', href: '/v2/signals' },
  { label: 'Sessions', href: '/v2/markets/sessions' },
  { label: 'Calendar', href: '/v2/calendar' },
];

// All 8 calculators, from the tools registry. Active key: `tools:<slug>`
// (passed by ToolShell).
const TOOLS = TOOL_PAGES.map((t) => ({
  label: t.sidebarLabel,
  href: `/v2/tools/${t.slug}`,
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
      <Item href="/v2/markets" label="Overview" active={active === 'overview'} />
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
        href="/v2/markets/commodities/xauusd"
        className="flex min-h-11 items-center justify-between gap-2 border-l-2 border-transparent px-3 py-2 text-sm text-v2-gold transition-colors hover:bg-v2-gold-soft md:min-h-0 md:py-1.5"
      >
        <span>🥇 Gold</span>
        <span className="h-1.5 w-1.5 rounded-full bg-v2-gold" aria-hidden />
      </Link>

      <SectionLabel>Discover</SectionLabel>
      {DISCOVER.map((d) => (
        <Item key={d.href} href={d.href} label={d.label} active={false} />
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

  return (
    <>
      {/* Desktop: sticky column */}
      <aside
        className="sticky hidden w-44 shrink-0 self-start border-r border-v2-line md:block"
        style={{ top: 'var(--v2-nav-h)' }}
      >
        <SidebarBody active={active} counts={counts} />
      </aside>

      {/* Mobile: drawer */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-12 left-3 z-40 flex min-h-11 items-center gap-2 rounded-full border border-v2-line-strong bg-v2-surface px-4 text-sm text-v2-text shadow-lg md:hidden"
        aria-label="Open markets menu"
      >
        ☰ Markets
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
