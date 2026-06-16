// /v2/tools/margin-calculator — thin server wrapper (Phase A Session 5): sidebar signal
// counts + ToolShell frame around the client calculator. Slug mirrors the
// legacy /tools/margin-calculator page for in-place cutover.

import { getSignalCounts } from '@/lib/v2-data';
import { toolBySlug } from '@/components/v2/tools/toolsMeta';
import ToolShell from '@/components/v2/tools/ToolShell';
import MarginCalculator from '@/components/v2/tools/MarginCalculator';

export const revalidate = 60;

const tool = toolBySlug('margin-calculator');
export const metadata = {
  title: `${tool.name} — MaxTradeFlow`,
  description: tool.short,
};

export default async function Page() {
  const counts = await getSignalCounts();
  return (
    <ToolShell slug="margin-calculator" counts={counts}>
      <MarginCalculator />
    </ToolShell>
  );
}
