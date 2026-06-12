// components/v2/fonts.js — v2.1 typography via next/font (EXECUTION_PLAN.md §1).
//
// Sora → headlines · Inter → body · IBM Plex Mono → all prices/scores/trading
// data (tabular numerals applied by the `v2-num` utility in app/v2-theme.css).
//
// The variables are attached to the (v2) layout wrapper element (not <html>),
// so they scope to v2 routes and never affect existing pages. Variable names
// are referenced by @theme in app/v2-theme.css. Inter uses a distinct var
// (--font-inter-v2) to stay independent of the legacy root layout's
// --font-inter until cutover.

import { Sora, Inter, IBM_Plex_Mono } from 'next/font/google';

export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

export const interV2 = Inter({
  subsets: ['latin'],
  variable: '--font-inter-v2',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
});

/** className that exposes all three font variables on a wrapper element. */
export const v2FontVariables = `${sora.variable} ${interV2.variable} ${plexMono.variable}`;
