// /v2/markets/forex/gbpusd — L4 instrument page (Phase A Session 3).

import InstrumentPage from '@/components/v2/InstrumentPage';

export const revalidate = 60;

export const metadata = {
  title: 'GBP/USD — Live Price, AI Signals & History — MaxTradeFlow',
  description: 'GBP/USD live price, daily change, active Smart Asset Bot signal, signal journey and full signal history.',
};

export default function Page() {
  return <InstrumentPage symbol="GBPUSD" />;
}
