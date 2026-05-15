// app/privacy/page.js
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · MaxTradeFlow",
  description: "How MaxTradeFlow handles user data, cookies, and third-party services.",
};

export default function PrivacyPage() {
  const lastUpdated = "May 15, 2026";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-[#c8dce8]">
      <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#3a6070] mb-10">Last updated: {lastUpdated}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">1. Overview</h2>
        <p className="leading-relaxed mb-3">
          MaxTradeFlow.com is a personal project operated by Mark Hillary as a free, educational resource for traders.
          This Privacy Policy explains what limited information we collect, how it is used, and the third-party services involved when you visit the site.
        </p>
        <p className="leading-relaxed">
          By using MaxTradeFlow, you agree to the practices described here.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">2. Information we collect</h2>
        <p className="leading-relaxed mb-3">
          MaxTradeFlow does not require account registration. We do not maintain user profiles, store passwords, or track individual browsing histories.
        </p>
        <p className="leading-relaxed mb-3">
          The only information we directly collect is what you choose to send us through the contact form: your name, email address, subject, and message.
          This information is used only to respond to your inquiry and is not added to any marketing list.
        </p>
        <p className="leading-relaxed">
          Server logs may temporarily record standard request metadata (IP address, user agent, timestamp) for security and abuse prevention. These logs are not used for analytics or profiling.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">3. Cookies and tracking</h2>
        <p className="leading-relaxed mb-3">
          MaxTradeFlow itself does not set tracking cookies. However, third-party services embedded in the site may set their own cookies — most notably:
        </p>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li>
            <span className="text-[#f1f5f9] font-medium">Google AdSense.</span> Once active, AdSense and its partners (including Google) use cookies to serve ads based on your prior visits to this and other websites.
            Google&apos;s use of the DART cookie enables it to serve ads based on your interests. You can opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" className="text-[#60c8d4] hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
          </li>
          <li>
            <span className="text-[#f1f5f9] font-medium">TradingView</span> charts loaded on instrument pages may set cookies as part of their widget functionality. See <a href="https://www.tradingview.com/policies/" className="text-[#60c8d4] hover:underline" target="_blank" rel="noopener noreferrer">TradingView&apos;s privacy policy</a>.
          </li>
          <li>
            <span className="text-[#f1f5f9] font-medium">Vercel</span> (our host) may set strictly necessary cookies for infrastructure security.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">4. Third-party services</h2>
        <p className="leading-relaxed mb-3">
          MaxTradeFlow integrates with the following third-party services:
        </p>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li><span className="text-[#f1f5f9] font-medium">Resend</span> — used to deliver contact form submissions to our inbox.</li>
          <li><span className="text-[#f1f5f9] font-medium">Finnhub</span> — provides delayed stock price data. No personal information is shared.</li>
          <li><span className="text-[#f1f5f9] font-medium">TradingView</span> — provides chart widgets.</li>
          <li><span className="text-[#f1f5f9] font-medium">Smart Asset Bot</span> — our own backend that generates trading signals; no user data is sent to it.</li>
          <li><span className="text-[#f1f5f9] font-medium">Vercel</span> — hosting infrastructure.</li>
          <li><span className="text-[#f1f5f9] font-medium">Google AdSense</span> — advertising (once active).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">5. What we do not do</h2>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li>We do not sell, rent, or trade personal information.</li>
          <li>We do not use analytics platforms that build behavioral profiles.</li>
          <li>We do not require accounts, passwords, or payment information.</li>
          <li>We do not retain contact form messages longer than necessary to respond.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">6. Children</h2>
        <p className="leading-relaxed">
          MaxTradeFlow is not directed at children under 18. We do not knowingly collect information from minors. If you believe a minor has submitted information through the site, please contact us so it can be removed.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">7. Changes to this policy</h2>
        <p className="leading-relaxed">
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top reflects the most recent revision. Continued use of the site after changes constitutes acceptance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">8. Contact</h2>
        <p className="leading-relaxed">
          Questions about this policy or your data? Reach out via the <Link href="/contact" className="text-[#60c8d4] hover:underline">contact form</Link>.
        </p>
      </section>
    </div>
  );
}