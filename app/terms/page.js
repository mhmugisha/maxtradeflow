// app/terms/page.js
import Link from "next/link";

export const metadata = {
  title: "Terms of Service · MaxTradeFlow",
  description: "Terms governing the use of MaxTradeFlow.com.",
};

export default function TermsPage() {
  const lastUpdated = "May 15, 2026";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-[#c8dce8]">
      <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Terms of Service</h1>
      <p className="text-sm text-[#3a6070] mb-10">Last updated: {lastUpdated}</p>

      {/* Risk banner */}
      <div className="bg-[#3a1818] border border-[#5a2a2a] rounded-lg p-5 mb-10">
        <p className="text-sm leading-relaxed">
          <span className="text-[#ff6b6b] font-semibold uppercase tracking-wide">Important:</span>{" "}
          MaxTradeFlow is an educational resource. <span className="text-[#f1f5f9] font-semibold">Nothing on this site constitutes financial, investment, or trading advice.</span>{" "}
          Trading carries substantial risk of loss. Past performance does not guarantee future results. You are solely responsible for your own decisions.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">1. Acceptance</h2>
        <p className="leading-relaxed">
          By accessing MaxTradeFlow.com you agree to these Terms of Service. If you do not agree, please do not use the site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">2. Nature of the service</h2>
        <p className="leading-relaxed mb-3">
          MaxTradeFlow is a free, personal project operated by Mark Hilary. It publishes educational content, market data, and AI-generated technical signals from the Smart Asset Bot — an automated system that scans technical indicators across forex, indices, commodities, crypto, and stock instruments.
        </p>
        <p className="leading-relaxed">
          All signals, scores, analyses, and articles are produced algorithmically or for educational illustration. They are not personalized recommendations and do not consider your individual financial situation, objectives, or risk tolerance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">3. Not financial advice</h2>
        <p className="leading-relaxed mb-3">
          Mark Hilary is not a licensed financial advisor, broker, or investment professional. Content on MaxTradeFlow is provided for informational and educational purposes only.
        </p>
        <p className="leading-relaxed">
          Before making any trading or investment decision, consult a qualified financial professional and conduct your own independent research.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">4. Trading risks</h2>
        <p className="leading-relaxed mb-3">
          Trading forex, CFDs, derivatives, commodities, cryptocurrencies, and equities involves a high level of risk and may result in the total loss of your capital. Leverage amplifies both gains and losses.
        </p>
        <p className="leading-relaxed">
          Markets can be volatile, illiquid, and subject to sudden price movements. Automated signals can be wrong, delayed, or based on incomplete data. You should not trade with funds you cannot afford to lose.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">5. No warranty</h2>
        <p className="leading-relaxed">
          The site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not guarantee accuracy, completeness, timeliness, or uninterrupted availability of any information, signal, price, or feature on the site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">6. Limitation of liability</h2>
        <p className="leading-relaxed">
          To the maximum extent permitted by law, Mark Hilary and MaxTradeFlow shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from your use of the site — including but not limited to trading losses, missed opportunities, data inaccuracies, or service interruptions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">7. Acceptable use</h2>
        <p className="leading-relaxed mb-3">
          You agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li>Scrape, copy, or redistribute content from the site for commercial purposes without permission.</li>
          <li>Attempt to disrupt, reverse-engineer, or probe the site&apos;s infrastructure.</li>
          <li>Use the site to send spam, conduct fraud, or violate any law.</li>
          <li>Misrepresent any signal or analysis from this site as personalized financial advice you provide to others.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">8. Third-party content</h2>
        <p className="leading-relaxed">
          The site embeds and links to third-party services including TradingView charts, Finnhub data, and Google AdSense advertising. We do not control and are not responsible for third-party content. Your use of those services is subject to their own terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">9. Modifications</h2>
        <p className="leading-relaxed">
          We may modify these Terms at any time by posting an updated version. Continued use of the site after changes constitutes acceptance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">10. Governing law</h2>
        <p className="leading-relaxed">
          These Terms are governed by the laws of Uganda. Any disputes shall be resolved in the courts of Uganda.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">11. Contact</h2>
        <p className="leading-relaxed">
          Questions about these Terms? Reach out via the <Link href="/contact" className="text-[#60c8d4] hover:underline">contact form</Link>.
        </p>
      </section>
    </div>
  );
}