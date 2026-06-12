// /v2/tools/session-converter — thin server wrapper (Phase A Session 5): sidebar signal
// counts + ToolShell frame around the client calculator. Slug mirrors the
// legacy /tools/session-converter page for in-place cutover.

import { getSignalCounts } from '@/lib/v2-data';
import { toolBySlug } from '@/components/v2/tools/toolsMeta';
import ToolShell from '@/components/v2/tools/ToolShell';
import SessionConverter from '@/components/v2/tools/SessionConverter';

export const revalidate = 60;

const tool = toolBySlug('session-converter');
export const metadata = {
  title: `${tool.name} — MaxTradeFlow`,
  description: tool.short,
};

export default async function Page() {
  const counts = await getSignalCounts();
  return (
    <ToolShell slug="session-converter" counts={counts}>
      <SessionConverter />
    </ToolShell>
  );
}
