// /v2/markets/crypto/[symbol] — dynamic L4 instrument page (fix/l4-dynamic-routes).
// Owns every crypto instrument in lib/instruments.js; unknown slug → 404.

import { notFound } from 'next/navigation';
import { getInstrument, instrumentsByClass } from '@/lib/instruments';
import InstrumentPage from '@/components/v2/InstrumentPage';

export const revalidate = 60;

export function generateStaticParams() {
  return instrumentsByClass('crypto').map((i) => ({ symbol: i.slug }));
}

export async function generateMetadata({ params }) {
  const { symbol } = await params;
  const inst = getInstrument(symbol);
  if (!inst || inst.assetClass !== 'crypto') return { title: 'Not Found' };
  return {
    title: `${inst.display} — Live Price, AI Signals & History — MaxTradeFlow`,
    description: `${inst.display} (${inst.name}) live price, daily change, active Smart Asset Bot signal, signal journey and full signal history.`,
  };
}

export default async function Page({ params }) {
  const { symbol } = await params;
  const inst = getInstrument(symbol);
  if (!inst || inst.assetClass !== 'crypto') notFound();
  return <InstrumentPage symbol={inst.symbol} />;
}
