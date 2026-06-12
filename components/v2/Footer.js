// components/v2/Footer.js — v2.1 site footer with the full RiskDisclaimer
// block (A-1 / §0.8: footer link + disclaimer site-wide on v2 surfaces).

import Link from 'next/link';
import RiskDisclaimer from './RiskDisclaimer';

const FOOTER_LINKS = [
  { label: 'Markets', href: '/v2/markets' },
  { label: 'Education', href: '/v2/education' },
  { label: 'Tools', href: '/v2/tools' },
  { label: 'AI Trading', href: '/v2/ai-trading' },
  { label: 'News', href: '/v2/news' },
  { label: 'Risk Disclosure', href: '/v2/disclaimer' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-v2-line bg-v2-surface">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-v2-display text-base font-bold text-v2-text">
              Max<span className="text-v2-accent">Trade</span>Flow
            </div>
            <p className="mt-1 text-xs text-v2-text-faint">
              Real-time market signals and analysis from Smart Asset Bot.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-v2-text-muted transition-colors hover:text-v2-accent"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <RiskDisclaimer variant="full" />
        <p className="text-[11px] text-v2-text-faint">© {year} MaxTradeFlow. All rights reserved.</p>
      </div>
    </footer>
  );
}
