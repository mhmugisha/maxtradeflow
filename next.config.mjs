/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/forex', destination: '/v2/markets/forex', permanent: true },
      { source: '/indices', destination: '/v2/markets/indices', permanent: true },
      { source: '/commodities', destination: '/v2/markets/commodities', permanent: true },
      { source: '/crypto', destination: '/v2/markets/crypto', permanent: true },
      { source: '/stocks', destination: '/v2/markets/stocks', permanent: true },
      { source: '/tools', destination: '/v2/tools', permanent: true },
      { source: '/education', destination: '/v2/education', permanent: true },
    ];
  },
};

export default nextConfig;
