/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: [
      'orbis.mypinata.cloud',
      'ipfs.io',
      'gateway.ipfs.io'
    ]
  },
  // Modern Next.js deployment configuration
  output: 'standalone',
  
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig