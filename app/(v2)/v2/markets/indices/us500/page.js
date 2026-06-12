// /v2/markets/indices/us500 — L4 instrument page (Phase A Session 3).

import InstrumentPage from '@/components/v2/InstrumentPage';

export const revalidate = 60;

export const metadata = {
  title: 'US500 (S&P 500) — Live Price, AI Signals & History — MaxTradeFlow',
  description: 'S&P 500 live price, daily change, active Smart Asset Bot signal, signal journey and full signal history.',
};

export default function Page() {
  return <InstrumentPage symbol="US500" />;
}
