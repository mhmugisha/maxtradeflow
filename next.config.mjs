/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/forex', destination: '/markets/forex', permanent: true },
      { source: '/indices', destination: '/markets/indices', permanent: true },
      { source: '/commodities', destination: '/markets/commodities', permanent: true },
      { source: '/crypto', destination: '/markets/crypto', permanent: true },
      { source: '/stocks', destination: '/markets/stocks', permanent: true },

      { source: '/forex/:symbol', destination: '/markets/forex/:symbol', permanent: true },
      { source: '/indices/:symbol', destination: '/markets/indices/:symbol', permanent: true },
      { source: '/commodities/:symbol', destination: '/markets/commodities/:symbol', permanent: true },
      { source: '/crypto/:symbol', destination: '/markets/crypto/:symbol', permanent: true },
    ];
  },
};

export default nextConfig;
