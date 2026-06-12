// components/v2/assetClassMeta.js — display metadata for the five asset-class
// surfaces (L2 cards, sidebar, L3 headers). Instrument counts/descriptions
// derive from lib/instruments.js so adding instrument 22 stays a one-file
// change. Accent classes are token utilities only (§0.6); the mockup's purple
// (crypto) and pink (stocks) are not in the §1 palette, so platinum and a
// muted tone stand in — flagged as a deviation in the session summary.

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
    href: '/v2/markets/forex',
  },
  {
    key: 'indices',
    name: 'Indices',
    icon: '📈',
    accentBar: 'bg-v2-bullish',
    desc: indices,
    href: '/v2/markets/indices',
  },
  {
    key: 'commodities',
    name: 'Commodities',
    icon: '🥇',
    accentBar: 'bg-v2-gold',
    desc: 'Gold + more coming',
    href: '/v2/markets/commodities',
  },
  {
    key: 'crypto',
    name: 'Crypto',
    icon: '₿',
    accentBar: 'bg-v2-platinum',
    desc: `${cryptoTop} +${cryptoMore}`,
    href: '/v2/markets/crypto',
  },
  {
    key: 'stocks',
    name: 'Stocks',
    icon: '📊',
    accentBar: 'bg-v2-text-faint',
    desc: 'Coming soon',
    comingSoon: true,
    href: '/v2/markets/stocks',
  },
];

export function classMeta(key) {
  return ASSET_CLASSES.find((c) => c.key === key) ?? null;
}
