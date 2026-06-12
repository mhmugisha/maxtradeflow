// lib/redirects-map.js — the complete v1→v2.1 301 map per EXECUTION_PLAN §7.
//
// ⚠ BUILT DORMANT (Phase A Session 4 Task 5a): nothing imports this yet and
// next.config.mjs is untouched. The cutover session wires it in — same
// release as the new routes going live at their final (non-/v2) paths.
//
// Destinations are the FINAL post-cutover paths. Note one open item for the
// cutover review: the plan maps /economic-calendar → /markets/economic-calendar,
// but the v2 calendar was built at /v2/calendar (→ final /calendar). Either
// move the page or update this row at cutover — flagged in the Session 4
// summary, do not resolve silently.
//
// Routes deliberately ABSENT from this map:
//   - /education, /guides, /about, /contact, /privacy, /terms KEEP their
//     paths and get wrapped in the v2 shell at cutover (cutover-session task).
//   - /tools and /tools/* are replaced in place at identical slugs by the
//     /v2/tools pages (Phase A Session 5) — no redirect needed.
//
// How it will be applied at cutover (next.config.mjs):
//
//   import { REDIRECTS_301 } from './lib/redirects-map.js';
//
//   const nextConfig = {
//     async redirects() {
//       return REDIRECTS_301.map(({ source, destination }) => ({
//         source,
//         destination,
//         permanent: true, // 301/308 — these URLs are moving for good
//       }));
//     },
//   };

export const REDIRECTS_301 = [
  // Asset-class hubs and instrument pages → /markets/*
  { source: '/forex', destination: '/markets/forex' },
  { source: '/forex/:symbol', destination: '/markets/forex/:symbol' },
  { source: '/indices', destination: '/markets/indices' },
  { source: '/indices/:symbol', destination: '/markets/indices/:symbol' },
  { source: '/commodities', destination: '/markets/commodities' },
  { source: '/commodities/:symbol', destination: '/markets/commodities/:symbol' },
  { source: '/crypto', destination: '/markets/crypto' },
  { source: '/crypto/:symbol', destination: '/markets/crypto/:symbol' },
  { source: '/stocks', destination: '/markets/stocks' },
  { source: '/stocks/:symbol', destination: '/markets/stocks/:symbol' },

  // Articles and analysis → /ai-trading
  { source: '/articles', destination: '/ai-trading' },
  { source: '/articles/:slug', destination: '/ai-trading/:slug' },
  { source: '/analysis/:slug', destination: '/ai-trading/:slug' },

  // Calendar (see header note about the /calendar vs /markets/economic-calendar decision)
  { source: '/economic-calendar', destination: '/markets/economic-calendar' },

  // Subscribe page is retired at cutover — send to home
  { source: '/subscribe', destination: '/' },
];
