// Archive filter chips (client) — they write URL search params so filtering
// and pagination happen server-side over the FULL archive, not just the
// loaded page. Chips are the only client state here.

'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const CLASS_CHIPS = [
  { key: null, label: 'All markets' },
  { key: 'forex', label: 'Forex' },
  { key: 'indices', label: 'Indices' },
  { key: 'commodities', label: 'Commodities' },
  { key: 'crypto', label: 'Crypto' },
];

const STATUS_CHIPS = [
  { key: null, label: 'All statuses' },
  { key: 'active', label: 'Active' },
  { key: 'tp', label: 'TP hit' },
  { key: 'sl', label: 'SL hit' },
  { key: 'expired', label: 'Expired' },
  { key: 'invalidated', label: 'Invalidated' },
];

function ChipRow({ chips, param, current, onSet }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={() => onSet(param, c.key)}
          className={`min-h-11 rounded-full border px-3 text-xs transition-colors md:min-h-8 ${
            current === c.key
              ? 'border-v2-line-strong bg-v2-accent-soft text-v2-accent'
              : 'border-v2-line text-v2-text-muted hover:text-v2-text'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

export default function ArchiveFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const cls = params.get('class');
  const status = params.get('status');

  const set = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // filters reset pagination
    router.replace(`/signals${next.size ? `?${next}` : ''}`);
  };

  return (
    <div className="space-y-2">
      <ChipRow chips={CLASS_CHIPS} param="class" current={cls} onSet={set} />
      <ChipRow chips={STATUS_CHIPS} param="status" current={status} onSet={set} />
    </div>
  );
}
