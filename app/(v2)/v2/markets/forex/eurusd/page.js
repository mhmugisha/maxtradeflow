// /v2/markets/forex/eurusd — L4 instrument page (Phase A Session 3),
// thin instantiation of components/v2/InstrumentPage.js per L4_Instrument.png.

import InstrumentPage from '@/components/v2/InstrumentPage';

export const revalidate = 60;

export const metadata = {
  title: 'EUR/USD — Live Price, AI Signals & History — MaxTradeFlow',
  description: 'EUR/USD live price, daily change, active Smart Asset Bot signal, signal journey and full signal history.',
};

export default function Page() {
  return <InstrumentPage symbol="EURUSD" />;
}
