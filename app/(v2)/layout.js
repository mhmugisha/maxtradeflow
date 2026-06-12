// app/(v2)/layout.js — v2.1 shell (Phase A Session 1 Task 4).
//
// BUILD-ALONGSIDE: this is a NESTED layout under the untouched root
// app/layout.js. The legacy chrome it inherits (nav, session bar, footer,
// main padding) is neutralized by the body:has([data-v2-shell]) rules in
// app/v2-theme.css — active only while this shell is mounted. The cutover
// session promotes this to the root layout and deletes the neutralizers.
//
// Fonts: Sora/Inter/IBM Plex Mono variables attach to the shell wrapper (not
// <html>), so v2 typography never leaks into existing pages.

import Nav from '@/components/v2/Nav';
import SessionBar from '@/components/v2/SessionBar';
import PriceTicker from '@/components/v2/PriceTicker';
import Footer from '@/components/v2/Footer';
import { v2FontVariables } from '@/components/v2/fonts';

// Pre-cutover /v2/* pages must never be indexed (they would be duplicates of
// the future canonical routes). The cutover session removes this.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }) {
  return (
    <div
      data-v2-shell
      className={`${v2FontVariables} flex min-h-screen flex-col bg-v2-bg font-v2-body text-v2-text antialiased`}
      style={{ paddingBottom: 'var(--v2-ticker-h)' }}
    >
      <Nav />
      <SessionBar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Isolated ticker, pinned to the viewport bottom per the mockups */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <PriceTicker />
      </div>
    </div>
  );
}
