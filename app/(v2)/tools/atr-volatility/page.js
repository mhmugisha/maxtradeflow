// /v2/tools/atr-volatility — thin server wrapper (Phase A Session 5): sidebar signal
// counts + ToolShell frame around the client calculator. Slug mirrors the
// legacy /tools/atr-volatility page for in-place cutover.

import { getSignalCounts } from '@/lib/v2-data';
import { toolBySlug } from '@/components/v2/tools/toolsMeta';
import ToolShell from '@/components/v2/tools/ToolShell';
import AtrCalculator from '@/components/v2/tools/AtrCalculator';

export const revalidate = 60;

const tool = toolBySlug('atr-volatility');
export const metadata = {
  title: `${tool.name} — MaxTradeFlow`,
  description: tool.short,
};

export default async function Page() {
  const counts = await getSignalCounts();
  return (
    <ToolShell slug="atr-volatility" counts={counts}>
      <AtrCalculator />
    </ToolShell>
  );
}
