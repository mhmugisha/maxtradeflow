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
import { OrganizationJsonLd } from '@/components/v2/JsonLd';

// GA4 for v2 pages only (Task 5d): env-gated — renders nothing unless
// NEXT_PUBLIC_GA4_ID is set. Legacy pages keep their own analytics in the
// root layout, untouched.
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export default function V2Layout({ children }) {
  return (
    <div
      data-v2-shell
      className={`${v2FontVariables} flex min-h-screen flex-col bg-v2-bg font-v2-body text-v2-text antialiased`}
      style={{ paddingBottom: 'var(--v2-ticker-h)' }}
    >
      <OrganizationJsonLd />
      {GA4_ID && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`,
            }}
          />
        </>
      )}
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
