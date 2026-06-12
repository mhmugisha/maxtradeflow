// /v2/markets/indices/nas100 — L4 instrument page (Phase A Session 3).

import InstrumentPage from '@/components/v2/InstrumentPage';

export const revalidate = 60;

export const metadata = {
  title: 'NAS100 (NASDAQ-100) — Live Price, AI Signals & History — MaxTradeFlow',
  description: 'NASDAQ-100 live price, daily change, active Smart Asset Bot signal, signal journey and full signal history.',
};

export default function Page() {
  return <InstrumentPage symbol="NAS100" />;
}
