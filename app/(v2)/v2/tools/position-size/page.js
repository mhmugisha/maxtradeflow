// /v2/tools/position-size — thin server wrapper (Phase A Session 5): sidebar signal
// counts + ToolShell frame around the client calculator. Slug mirrors the
// legacy /tools/position-size page for in-place cutover.

import { getSignalCounts } from '@/lib/v2-data';
import { toolBySlug } from '@/components/v2/tools/toolsMeta';
import ToolShell from '@/components/v2/tools/ToolShell';
import PositionSizeCalculator from '@/components/v2/tools/PositionSizeCalculator';

export const revalidate = 60;

const tool = toolBySlug('position-size');
export const metadata = {
  title: `${tool.name} — MaxTradeFlow`,
  description: tool.short,
};

export default async function Page() {
  const counts = await getSignalCounts();
  return (
    <ToolShell slug="position-size" counts={counts}>
      <PositionSizeCalculator />
    </ToolShell>
  );
}
