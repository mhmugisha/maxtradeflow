// /v2/tools/pip-calculator — thin server wrapper (Phase A Session 5): sidebar signal
// counts + ToolShell frame around the client calculator. Slug mirrors the
// legacy /tools/pip-calculator page for in-place cutover.

import { getSignalCounts } from '@/lib/v2-data';
import { toolBySlug } from '@/components/v2/tools/toolsMeta';
import ToolShell from '@/components/v2/tools/ToolShell';
import PipCalculator from '@/components/v2/tools/PipCalculator';

export const revalidate = 60;

const tool = toolBySlug('pip-calculator');
export const metadata = {
  title: `${tool.name} — MaxTradeFlow`,
  description: tool.short,
};

export default async function Page() {
  const counts = await getSignalCounts();
  return (
    <ToolShell slug="pip-calculator" counts={counts}>
      <PipCalculator />
    </ToolShell>
  );
}
