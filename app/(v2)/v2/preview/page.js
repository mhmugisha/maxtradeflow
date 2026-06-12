// /v2/preview — Session 1 acceptance artifact (Phase A Session 1 Task 4).
// Exercises every global component: tokens, typography, live ticker +
// session bar (in the shell), a real recent signal from the DB rendered as a
// token-styled card, LastUpdated + degraded states, both disclaimer variants.

import { neon } from '@neondatabase/serverless';
import { sessionStatuses } from '@/lib/market-sessions';
import RiskDisclaimer from '@/components/v2/RiskDisclaimer';
import LastUpdated from '@/components/v2/LastUpdated';
import SignalCard from '@/components/v2/SignalCard';
import DegradedDemo from './DegradedDemo';

export const revalidate = 60;

export const metadata = {
  title: 'v2.1 Preview — MaxTradeFlow',
};

// Real recent signal, server-rendered (§0.2: every displayed number from real
// data). Returns null on any failure — the page says so instead of inventing.
async function getLatestSignal() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    const rows = await sql`
      SELECT signal_uid, ticker, direction, entry_price, stop_loss, take_profit,
             rr_ratio, score, tradeflow_score, adx, rsi, status,
             COALESCE(generated_at, created_at) AS generated_at
      FROM signals
      ORDER BY COALESCE(generated_at, created_at) DESC
      LIMIT 1`;
    return rows[0] ?? null;
  } catch (error) {
    console.error('[v2/preview] latest-signal query failed:', error?.message || error);
    return null;
  }
}

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="font-v2-display text-lg font-semibold text-v2-text">{title}</h2>
      {children}
    </section>
  );
}

const SWATCHES = [
  ['bg', 'bg-v2-bg border border-v2-line'],
  ['surface', 'bg-v2-surface border border-v2-line'],
  ['accent', 'bg-v2-accent'],
  ['bullish', 'bg-v2-bullish'],
  ['bearish', 'bg-v2-bearish'],
  ['gold', 'bg-v2-gold'],
  ['platinum', 'bg-v2-platinum'],
];

export default async function PreviewPage() {
  const signal = await getLatestSignal();
  const renderedAt = Date.now();
  const sessions = sessionStatuses();

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-10">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-v2-accent">
          Phase A · Session 1 acceptance artifact
        </p>
        <h1 className="font-v2-display text-3xl font-bold text-v2-text">
          v2.1 Component Preview
        </h1>
        <p className="text-sm text-v2-text-muted">
          Live ticker (bottom) and session bar (top) come from the (v2) shell. Server render:{' '}
          <LastUpdated timestamp={renderedAt} prefix="rendered" /> (ISR 60s).
        </p>
      </header>

      <Section title="Design tokens">
        <div className="flex flex-wrap gap-3">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="space-y-1 text-center">
              <div className={`h-12 w-20 rounded ${cls}`} />
              <div className="text-[11px] text-v2-text-faint">{name}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1 rounded-md border border-v2-line bg-v2-surface p-4">
          <p className="font-v2-display text-xl font-semibold text-v2-text">Sora — headlines</p>
          <p className="text-sm text-v2-text-muted">Inter — body copy at comfortable reading weight.</p>
          <p className="v2-num text-sm text-v2-text">
            IBM Plex Mono, tabular numerals: 1.08760 · 21,490.50 · 4,338.00 · +0.74%
          </p>
        </div>
      </Section>

      <Section title="Market sessions (real UTC windows, server snapshot)">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {sessions.map((s) => (
            <div key={s.name} className="rounded-md border border-v2-line bg-v2-surface px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${s.open ? 'bg-v2-bullish' : 'bg-v2-text-faint'}`} />
                <span className="text-sm font-medium text-v2-text">{s.name}</span>
              </div>
              <div className={`mt-1 text-xs ${s.open ? 'text-v2-bullish' : 'text-v2-text-faint'}`}>
                {s.open ? 'Open now' : 'Closed'}
              </div>
              <div className="mt-1 text-[11px] text-v2-text-faint">{s.pairs.join(' · ')}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-v2-text-faint">
          The live strip in the shell header recomputes every 30s client-side; these cards are the
          same logic snapshotted at render.
        </p>
      </Section>

      <Section title="Sample signal card (latest real signal, server-rendered)">
        {signal ? (
          <div className="max-w-sm">
            <SignalCard signal={signal} showDisclaimer />
          </div>
        ) : (
          <p className="text-sm text-v2-text-muted">
            No signals found in the database (or the query failed — see server logs). Nothing is
            fabricated in its place.
          </p>
        )}
      </Section>

      <Section title="Degraded states (simulated age)">
        <DegradedDemo />
      </Section>

      <Section title="Risk disclaimer variants">
        <div className="space-y-3">
          <div className="rounded-md border border-v2-line p-3">
            <div className="mb-1 text-[11px] uppercase tracking-wide text-v2-text-faint">compact</div>
            <RiskDisclaimer variant="compact" />
          </div>
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wide text-v2-text-faint">full</div>
            <RiskDisclaimer variant="full" />
          </div>
        </div>
      </Section>
    </div>
  );
}
