// app/about/page.js
import Link from "next/link";

export const metadata = {
  title: "About · MaxTradeFlow",
  description: "MaxTradeFlow is a free, AI-powered market analysis platform built by Mark Hilary.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-[#c8dce8]">
      <h1 className="text-3xl font-bold text-[#f1f5f9] mb-3">About MaxTradeFlow</h1>
      <p className="text-lg text-[#94a3b8] mb-10 leading-relaxed">
        A free, AI-powered market analysis platform — built in the open, by a solo developer.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">What is MaxTradeFlow?</h2>
        <p className="leading-relaxed mb-3">
          MaxTradeFlow is a personal project to make systematic trading analysis accessible to everyone. The site publishes live prices, trading signals, technical scores, and educational content across five asset classes: <Link href="/forex" className="text-[#60c8d4] hover:underline">forex</Link>, <Link href="/indices" className="text-[#60c8d4] hover:underline">indices</Link>, <Link href="/commodities" className="text-[#60c8d4] hover:underline">commodities</Link>, <Link href="/crypto" className="text-[#60c8d4] hover:underline">crypto</Link>, and <Link href="/stocks" className="text-[#60c8d4] hover:underline">stocks</Link>.
        </p>
        <p className="leading-relaxed">
          Everything on the site is free. No paywalls, no premium tier, no email gate. The goal is transparency — to show what an AI-driven approach to market analysis actually looks like when shared openly.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">How the signals work</h2>
        <p className="leading-relaxed mb-3">
          A back-end system called the <span className="text-[#60c8d4] font-medium">Smart Asset Bot</span> scans roughly 15 instruments per minute. For each one, it evaluates a basket of technical indicators — including ADX (trend strength), RSI (momentum), structure-based entry zones, and a custom multi-factor score on a 0–10 scale.
        </p>
        <p className="leading-relaxed mb-3">
          When a setup scores 8 or higher with strong trend confirmation, the bot publishes a signal article showing the entry, stop-loss, take-profit, and reward-to-risk ratio. Every signal is timestamped and visible — nothing is hidden, edited after the fact, or shown only to paying users.
        </p>
        <p className="leading-relaxed">
          The bot is not perfect. Some signals work; others don&apos;t. That is the honest reality of any rules-based system, and showing both outcomes openly is the point.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">What this site is not</h2>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li>It is not a brokerage. You cannot execute trades here.</li>
          <li>It is not financial advice. See our <Link href="/terms" className="text-[#60c8d4] hover:underline">Terms of Service</Link>.</li>
          <li>It is not run by a licensed advisor or institutional firm.</li>
          <li>It is not a guarantee of profit. Trading carries real risk of loss.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">Who built this</h2>
        <p className="leading-relaxed mb-3">
          MaxTradeFlow is built and maintained by <span className="text-[#f1f5f9] font-medium">Mark Hilary</span>, a developer and entrepreneur based in Uganda. The site is one of several independent projects he runs alongside property management software and writing.
        </p>
        <p className="leading-relaxed">
          The platform is an evolving experiment. Features are added when they make the site more useful, and removed when they don&apos;t. If something seems broken or could be better, the <Link href="/contact" className="text-[#60c8d4] hover:underline">contact form</Link> goes straight to him.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">How the site is funded</h2>
        <p className="leading-relaxed">
          MaxTradeFlow is supported by display advertising. Running data feeds, hosting infrastructure, and the AI bot has real costs — ads keep the site free for everyone. We do not sell user data, run affiliate funnels disguised as recommendations, or push readers toward any broker.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-[#f1f5f9] mb-3">The stack</h2>
        <p className="leading-relaxed">
          For the technically curious: the frontend is built with Next.js and deployed on Vercel. The Smart Asset Bot runs on Python with FastAPI, hosted on Railway, and writes to a Neon Postgres database. Stock prices come from Finnhub; charts are powered by TradingView. The site is open about its tooling because the tooling matters — building in the open invites scrutiny, and that&apos;s the point.
        </p>
      </section>
    </div>
  );
}