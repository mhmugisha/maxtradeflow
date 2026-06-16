// /v2/tools/compound-interest — thin server wrapper (Phase A Session 5): sidebar signal
// counts + ToolShell frame around the client calculator. Slug mirrors the
// legacy /tools/compound-interest page for in-place cutover.

import { getSignalCounts } from '@/lib/v2-data';
import { toolBySlug } from '@/components/v2/tools/toolsMeta';
import ToolShell from '@/components/v2/tools/ToolShell';
import CompoundInterestCalculator from '@/components/v2/tools/CompoundInterestCalculator';

export const revalidate = 60;

const tool = toolBySlug('compound-interest');
export const metadata = {
  title: `${tool.name} — MaxTradeFlow`,
  description: tool.short,
};

export default async function Page() {
  const counts = await getSignalCounts();
  return (
    <ToolShell slug="compound-interest" counts={counts}>
      <CompoundInterestCalculator />
    </ToolShell>
  );
}
