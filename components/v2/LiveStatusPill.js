// components/v2/LiveStatusPill.js — calm staleness indicator (A-1 degraded
// states). Renders NOTHING while live/connecting; data itself stays visible
// (the owner keeps last-known values via useLiveData).

export default function LiveStatusPill({ status }) {
  if (status !== 'delayed' && status !== 'reconnecting') return null;
  const label = status === 'reconnecting' ? 'Reconnecting' : 'Live data delayed';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-v2-line bg-v2-surface px-2 py-0.5 text-[11px] text-v2-text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-v2-gold" aria-hidden />
      {label}
    </span>
  );
}
