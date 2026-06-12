// components/v2/SignalJourney.js — horizontal lifecycle strip per the
// L4/Signal_Article mockups, driven ONLY by real signal_events rows (plus the
// signal's own real generated_at as the GENERATED fallback for backfilled
// rows that predate event tracking). States not reached render dimmed —
// never faked (§0.2).
//
// Steps: GENERATED → TRIGGERED → outcome. The outcome node takes whichever
// terminal event exists (TP_HIT / SL_HIT / EXPIRED / INVALIDATED); pending
// shows "TP / SL". An EXPIRED/INVALIDATED signal may legitimately skip
// TRIGGERED — that node simply stays dimmed.

import { formatInstrumentPrice } from '@/lib/instruments';

const TERMINALS = {
  TP_HIT: { label: 'TP Hit', cls: 'text-v2-bullish', dot: 'bg-v2-bullish' },
  SL_HIT: { label: 'SL Hit', cls: 'text-v2-bearish', dot: 'bg-v2-bearish' },
  EXPIRED: { label: 'Expired', cls: 'text-v2-text-muted', dot: 'bg-v2-text-faint' },
  INVALIDATED: { label: 'Invalidated', cls: 'text-v2-text-muted', dot: 'bg-v2-text-faint' },
};

const fmtWhen = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
};

function Node({ label, labelCls, dotCls, when, price, symbol, reached, note }) {
  return (
    <div className="flex min-w-24 flex-col items-center gap-1 text-center">
      <span className={`h-2.5 w-2.5 rounded-full ${reached ? dotCls : 'border border-v2-line bg-transparent'}`} aria-hidden />
      <span className={`text-[11px] font-medium ${reached ? labelCls : 'text-v2-text-faint'}`}>{label}</span>
      {reached && when && <span className="v2-num text-[10px] text-v2-text-faint">{fmtWhen(when)}</span>}
      {reached && price != null && (
        <span className="v2-num text-[10px] text-v2-text-muted">{formatInstrumentPrice(price, symbol)}</span>
      )}
      {note && <span className="max-w-40 text-[10px] text-v2-text-faint">{note}</span>}
    </div>
  );
}

export default function SignalJourney({ signal, events = [] }) {
  if (!signal) return null;
  const byType = Object.fromEntries(events.map((e) => [e.event_type, e]));

  const generated = byType.GENERATED ?? (signal.generated_at ? { occurred_at: signal.generated_at, price: null } : null);
  const triggered = byType.TRIGGERED ?? null;
  const terminalType = ['TP_HIT', 'SL_HIT', 'EXPIRED', 'INVALIDATED'].find((t) => byType[t])
    ?? (TERMINALS[signal.status] ? signal.status : null);
  const terminalEvent = terminalType ? byType[terminalType] : null;
  const terminal = terminalType ? TERMINALS[terminalType] : null;

  const Connector = ({ reached }) => (
    <div className={`mt-1 h-px flex-1 self-start ${reached ? 'bg-v2-accent' : 'bg-v2-line'}`} aria-hidden />
  );

  return (
    <div className="flex items-start gap-2 rounded-md border border-v2-line bg-v2-surface px-4 py-3">
      <Node
        label="Generated" labelCls="text-v2-accent" dotCls="bg-v2-accent"
        when={generated?.occurred_at} price={generated?.price} symbol={signal.ticker}
        reached={!!generated}
      />
      <Connector reached={!!triggered} />
      <Node
        label="Triggered" labelCls="text-v2-accent" dotCls="bg-v2-accent"
        when={triggered?.occurred_at} price={triggered?.price} symbol={signal.ticker}
        reached={!!triggered}
      />
      <Connector reached={!!terminal} />
      <Node
        label={terminal?.label ?? 'TP / SL'}
        labelCls={terminal?.cls ?? 'text-v2-text-faint'}
        dotCls={terminal?.dot ?? 'bg-v2-text-faint'}
        when={terminalEvent?.occurred_at} price={terminalEvent?.price} symbol={signal.ticker}
        reached={!!terminal}
        note={terminalType === 'INVALIDATED' ? terminalEvent?.reason ?? null : null}
      />
    </div>
  );
}
