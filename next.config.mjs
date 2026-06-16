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

      { source: '/', destination: '/v2', permanent: true },
      { source: '/markets', destination: '/v2/markets', permanent: true },
      { source: '/ai-trading', destination: '/v2/ai-trading', permanent: true },
      { source: '/signals', destination: '/v2/signals', permanent: true },
      { source: '/calendar', destination: '/v2/calendar', permanent: true },
      { source: '/news', destination: '/v2/news', permanent: true },

      { source: '/markets/:path*', destination: '/v2/markets/:path*', permanent: true },
      { source: '/signals/:path*', destination: '/v2/signals/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
