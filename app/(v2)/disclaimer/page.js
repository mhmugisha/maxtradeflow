// /v2/disclaimer — full risk disclosure page (Phase A Session 4 Task 5c).
// Honest about the current state: demo-account data, outcome tracking new,
// no performance claims below the 30-closed gate.

import Link from 'next/link';

export const metadata = {
  title: 'Risk Disclosure & Disclaimer — MaxTradeFlow',
  description: 'Risk disclosure, not-financial-advice statement, and track-record status for MaxTradeFlow signals.',
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-v2-display text-2xl font-bold text-v2-text">Risk Disclosure &amp; Disclaimer</h1>
        <p className="mt-1 text-xs text-v2-text-faint">Applies to every page, signal, score and statistic on this site.</p>
      </header>

      {[
        {
          title: 'Trading risk',
          body: 'Trading foreign exchange, indices, commodities and cryptocurrencies involves substantial risk of loss and is not suitable for every investor. Leverage magnifies both gains and losses; you can lose more than your initial deposit. Never trade with money you cannot afford to lose. Past performance does not indicate future results.',
        },
        {
          title: 'Not financial advice',
          body: 'Nothing on MaxTradeFlow is investment advice, a personal recommendation, or an offer or solicitation to buy or sell any financial instrument. Signals are informational output from an automated system (Smart Asset Bot) and are published for educational and research purposes. You are solely responsible for your own trading decisions. If you require advice, consult a licensed financial adviser in your jurisdiction.',
        },
        {
          title: 'Track-record status — read this',
          body: 'Signals are currently generated against demo-account market data, and the automated outcome-tracking system went live in June 2026. No live-account track record exists yet. Performance statistics on this site appear only once at least 30 closed signals exist for the relevant scope, and are computed automatically from recorded events — they are never entered by hand. Until that sample exists, no win rate or performance figure is displayed anywhere, and any you believe you saw, you did not see here.',
        },
        {
          title: 'How outcomes are recorded',
          body: 'Signals are immutable once published — never edited or deleted. Entry, stop-loss and take-profit touches are detected automatically from price and stored as append-only events. Where the order of a take-profit and stop-loss touch is ambiguous within one polling interval, the signal is recorded as a loss. Invalidated and expired signals remain permanently in the public archive.',
        },
        {
          title: 'Data and availability',
          body: 'Prices, scores and statistics are produced by automated systems and may be delayed, interrupted or contain errors. The site indicates data staleness where it can. MaxTradeFlow accepts no liability for losses arising from the use of, or inability to use, any information on this site.',
        },
      ].map((s) => (
        <section key={s.title}>
          <h2 className="mb-2 font-v2-display text-base font-semibold text-v2-text">{s.title}</h2>
          <p className="text-sm leading-relaxed text-v2-text-muted">{s.body}</p>
        </section>
      ))}

      <p className="border-t border-v2-line pt-4 text-xs text-v2-text-faint">
        Questions about how a number on this site was computed? Every statistic names its source
        and sample. Start at <Link href="/ai-trading" className="text-v2-accent hover:underline">How It Works</Link>.
      </p>
    </div>
  );
}
