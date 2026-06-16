// /v2/markets/forex — first L3 instantiation (Phase A Session 2 Task 3),
// validating the reusable template in components/v2/AssetClassPage.js per
// docs/mockups/L3_Asset_Class.png.

import AssetClassPage from '@/components/v2/AssetClassPage';

export const revalidate = 60;

export const metadata = {
  title: 'Forex — Markets — MaxTradeFlow',
  description: 'All forex pairs scanned by Smart Asset Bot: live prices, daily change, active AI signals and market DNA.',
};

export default function ForexPage() {
  return <AssetClassPage classKey="forex" />;
}
