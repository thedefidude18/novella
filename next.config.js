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
  output: 'standalone',

  // Force transpilation of node_modules (fixes private class field issues)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });
    return config;
  },

  // Modern JavaScript optimizations
  experimental: {
    modern: true, // Enable modern JS
    optimizeCss: true, // Optimize CSS for performance
  },

  // Security headers
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

module.exports = nextConfig;
