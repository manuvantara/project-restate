const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: '**',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        destination: '/marketplace/offers',
        permanent: true,
        source: '/',
      },
    ];
  },
  webpack: (
    config,
    { buildId, defaultLoaders, dev, isServer, nextRuntime, webpack },
  ) => {
    const fallback = config.resolve.fallback || {};

    Object.assign(fallback, {
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      ws: require.resolve('xrpl/dist/npm/client/WSWrapper'),
    });

    config.resolve.fallback = fallback;

    if (!isServer) {
      config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.IgnorePlugin({
          checkResource(resource) {
            return /.*\/wordlists\/(?!english).*\.json/.test(resource);
          },
        }),
      ]);
    }

    const aliases = config.resolve.alias || {};

    Object.assign(aliases, {
      ws: path.resolve(
        __dirname,
        './node_nodules/xrpl/dist/npm/client/WSWrapper.js',
      ),
    });

    config.resolve.alias = aliases;

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
