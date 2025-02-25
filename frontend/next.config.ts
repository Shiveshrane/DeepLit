/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/search',
        destination: 'http://localhost:5000/search',
      },
      {
        source: '/paper/:path*',
        destination: 'http://localhost:5000/paper/:path*',
      },
      {
        source: '/analyze',
        destination: 'http://localhost:5000/analyze',
      },
    ];
  },
};

module.exports = nextConfig;