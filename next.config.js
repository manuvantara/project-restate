const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
    config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
      new webpack.IgnorePlugin({
        checkResource(resource) {
          return /.*\/wordlists\/(?!english).*\.json/.test(resource);
        },
      }),
    ]);

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
