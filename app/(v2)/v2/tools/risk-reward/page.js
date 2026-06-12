// /v2/tools/risk-reward — thin server wrapper (Phase A Session 5): sidebar signal
// counts + ToolShell frame around the client calculator. Slug mirrors the
// legacy /tools/risk-reward page for in-place cutover.

import { getSignalCounts } from '@/lib/v2-data';
import { toolBySlug } from '@/components/v2/tools/toolsMeta';
import ToolShell from '@/components/v2/tools/ToolShell';
import RiskRewardCalculator from '@/components/v2/tools/RiskRewardCalculator';

export const revalidate = 60;

const tool = toolBySlug('risk-reward');
export const metadata = {
  title: `${tool.name} — MaxTradeFlow`,
  description: tool.short,
};

export default async function Page() {
  const counts = await getSignalCounts();
  return (
    <ToolShell slug="risk-reward" counts={counts}>
      <RiskRewardCalculator />
    </ToolShell>
  );
}
