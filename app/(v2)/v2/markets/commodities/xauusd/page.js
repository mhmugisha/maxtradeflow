// /v2/markets/commodities/xauusd — L4 instrument page (Phase A Session 3).

import InstrumentPage from '@/components/v2/InstrumentPage';

export const revalidate = 60;

export const metadata = {
  title: 'Gold (XAU/USD) — Live Price, AI Signals & History — MaxTradeFlow',
  description: 'Spot gold live price, daily change, active Smart Asset Bot signal, signal journey and full signal history.',
};

export default function Page() {
  return <InstrumentPage symbol="XAUUSD" />;
}
