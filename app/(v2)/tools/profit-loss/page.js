// /v2/tools/profit-loss — thin server wrapper (Phase A Session 5): sidebar signal
// counts + ToolShell frame around the client calculator. Slug mirrors the
// legacy /tools/profit-loss page for in-place cutover.

import { getSignalCounts } from '@/lib/v2-data';
import { toolBySlug } from '@/components/v2/tools/toolsMeta';
import ToolShell from '@/components/v2/tools/ToolShell';
import ProfitLossCalculator from '@/components/v2/tools/ProfitLossCalculator';

export const revalidate = 60;

const tool = toolBySlug('profit-loss');
export const metadata = {
  title: `${tool.name} — MaxTradeFlow`,
  description: tool.short,
};

export default async function Page() {
  const counts = await getSignalCounts();
  return (
    <ToolShell slug="profit-loss" counts={counts}>
      <ProfitLossCalculator />
    </ToolShell>
  );
}
