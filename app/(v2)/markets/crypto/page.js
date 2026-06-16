// /v2/markets/crypto — L3 instantiation of the reusable template in
// components/v2/AssetClassPage.js per docs/mockups/L3_Asset_Class.png.

import AssetClassPage from '@/components/v2/AssetClassPage';

export const revalidate = 60;

export const metadata = {
  title: 'Crypto — Markets — MaxTradeFlow',
  description: 'All crypto pairs scanned by Smart Asset Bot: live prices, daily change, active AI signals and market DNA.',
};

export default function CryptoPage() {
  return <AssetClassPage classKey="crypto" />;
}
