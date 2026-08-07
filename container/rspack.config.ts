import * as path from 'path';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import type { Configuration } from '@rspack/cli';

// Must run before anything reads process.env - see the comment on
// createModuleFederationConfig in module-federation.config.ts for why that's
// exported as a function rather than a plain object.
import './load-env';
import { createModuleFederationConfig } from './module-federation.config';

const isDev = process.env.NODE_ENV === 'development';
const moduleFederationConfig = createModuleFederationConfig();

const config: Configuration = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'cheap-module-source-map' : false,
  // `lazyCompilation` is a TOP-LEVEL rspack config field (unlike webpack,
  // where the equivalent lives under `experiments.lazyCompilation` - an easy
  // mix-up). `@rspack/cli serve` force-enables it whenever this field is
  // literally `undefined`, wrapping dynamically-imported modules in a
  // "lazy-compilation-proxy" stand-in that's only compiled once the browser
  // requests it. src/index.ts's `import('./bootstrap')` is exactly that kind
  // of dynamic import - it has to be, so Module Federation can resolve
  // shared singletons before anything else runs. That proxy doesn't survive
  // a hot update cleanly: the HMR runtime ends up trying to patch a proxy
  // module object the hot-update payload expects to already exist, and it
  // doesn't, throwing "Cannot set properties of undefined (setting
  // '...lazy-compilation-proxy')". Explicitly setting this to `false` (not
  // `experiments: { lazyCompilation: false }`, which rspack silently ignores)
  // is what actually turns it off.
  lazyCompilation: false,
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    path: path.resolve(__dirname, '.dist'),
    filename: isDev ? '[name].bundle.js' : '[name].[contenthash].bundle.js',
    // 'auto' lets the same build run correctly whether it's served from `/`
    // or from a sub-path (e.g. behind an API gateway path prefix), which is
    // what every remote should use too.
    publicPath: 'auto',
    clean: true,
    // Must match the Module Federation `name` above, and must be stable
    // across rebuilds. Without an explicit uniqueName, rspack derives one
    // automatically - and if that auto-derived name shifts between a dev
    // server's initial compile and a later hot-update compile, the HMR
    // runtime ends up patching a *different* internal namespace than the one
    // Module Federation actually registered its remote references under.
    // That mismatch is what throws "Cannot set properties of undefined
    // (setting 'webpack/container/reference/Dashboard')" on hot updates.
    uniqueName: moduleFederationConfig.name,
  },
  devServer: {
    static: { directory: path.resolve(__dirname, '.dist') },
    port: 3000,
    open: false,
    hot: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true },
            transform: {
              react: {
                runtime: 'automatic',
                development: isDev,
                refresh: isDev,
              },
            },
            externalHelpers: true,
          },
        },
      },
      {
        test: /\.css$/i,
        use: [rspack.CssExtractRspackPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.s[ca]ss$/i,
        exclude: /\.module\.s[ca]ss$/i,
        use: [rspack.CssExtractRspackPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.module\.s[ca]ss$/i,
        use: [
          rspack.CssExtractRspackPlugin.loader,
          { loader: 'css-loader', options: { modules: { localIdentName: '[name]__[local]--[hash:base64:5]' } } },
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    // The swc-loader options above set `refresh: isDev`, which makes SWC
    // *emit* `$RefreshReg$`/`$RefreshSig$` calls into the compiled output.
    // Without this plugin actually providing those globals at runtime, dev
    // mode crashes with "$RefreshSig$ is not defined" the moment any
    // component module loads. The two must always be added/removed together.
    isDev ? new ReactRefreshPlugin() : undefined,
    new rspack.DefinePlugin({
      'process.env.HOST_API_URL': JSON.stringify(process.env.HOST_API_URL ?? ''),
    }),
    new ModuleFederationPlugin(moduleFederationConfig),
    new rspack.CssExtractRspackPlugin(),
    new rspack.HtmlRspackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      filename: 'index.html',
    }),
  ].filter(Boolean),
};

export default config;
