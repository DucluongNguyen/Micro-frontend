import path from 'path';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import type { Configuration } from '@rspack/cli';

require('./load-env');
import { createModuleFederationConfig } from './module-federation.config';

const isDev = process.env.NODE_ENV === 'development';
const moduleFederationConfig = createModuleFederationConfig();

const config: Configuration = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'cheap-module-source-map' : false,
  // `lazyCompilation` is a TOP-LEVEL rspack field, not `experiments.lazyCompilation`
  // (that's webpack's convention) - see the full explanation in
  // container/base/rspack.config.ts. Without this, `@rspack/cli serve`
  // force-enables it and a hot update to the dynamically-imported
  // `./bootstrap` entry throws "Cannot set properties of undefined (setting
  // '...lazy-compilation-proxy')".
  lazyCompilation: false,
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    path: path.resolve(__dirname, '.dist'),
    filename: isDev ? '[name].bundle.js' : '[name].[contenthash].bundle.js',
    publicPath: 'auto',
    clean: true,
    // Must match the Module Federation `name` above and stay stable across
    // rebuilds - see the matching comment in container/base/rspack.config.ts
    // for the HMR crash this prevents.
    uniqueName: moduleFederationConfig.name,
  },
  devServer: {
    static: { directory: path.resolve(__dirname, '.dist') },
    port: 3011,
    open: false,
    hot: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    allowedHosts: 'all',
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
