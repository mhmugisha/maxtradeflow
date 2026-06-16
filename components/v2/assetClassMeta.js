// components/v2/assetClassMeta.js — display metadata for the five asset-class
// surfaces (L2 cards, sidebar, L3 headers). Instrument counts/descriptions
// derive from lib/instruments.js so adding instrument 22 stays a one-file
// change. Accent classes are token utilities only (§0.6); crypto purple and
// stocks pink were added as real tokens (--v2-crypto/--v2-stocks) by decision
// on 2026-06-12 to match the mockup.

import { instrumentsByClass } from '@/lib/instruments';

const forexCount = instrumentsByClass('forex').length;
const indices = instrumentsByClass('indices').map((i) => i.display).join(' · ');
const cryptoTop = instrumentsByClass('crypto').slice(0, 3).map((i) => i.display.slice(0, 3)).join(' · ');
const cryptoMore = instrumentsByClass('crypto').length - 3;

export const ASSET_CLASSES = [
  {
    key: 'forex',
    name: 'Forex',
    icon: '💱',
    accentBar: 'bg-v2-accent',
    desc: `${forexCount} currency pairs`,
    href: '/markets/forex',
  },
  {
    key: 'indices',
    name: 'Indices',
    icon: '📈',
    accentBar: 'bg-v2-bullish',
    desc: indices,
    href: '/markets/indices',
  },
  {
    key: 'commodities',
    name: 'Commodities',
    icon: '🥇',
    accentBar: 'bg-v2-gold',
    desc: 'Gold + more coming',
    href: '/markets/commodities',
  },
  {
    key: 'crypto',
    name: 'Crypto',
    icon: '₿',
    accentBar: 'bg-v2-crypto',
    desc: `${cryptoTop} +${cryptoMore}`,
    href: '/markets/crypto',
  },
  {
    key: 'stocks',
    name: 'Stocks',
    icon: '📊',
    accentBar: 'bg-v2-stocks',
    desc: 'Coming soon',
    comingSoon: true,
    href: '/markets/stocks',
  },
];

export function classMeta(key) {
  return ASSET_CLASSES.find((c) => c.key === key) ?? null;
}

/** Href to an instrument's L4 page. Every registered instrument has one
 *  since fix/l4-dynamic-routes: app/(v2)/v2/markets/<class>/[symbol]/page.js
 *  serves all instruments listed in lib/instruments.js for that class. */
export function l4Href(inst) {
  if (!inst) return null;
  return `/markets/${inst.assetClass}/${inst.slug}`;
}
