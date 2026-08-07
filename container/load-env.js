// Loaded from rspack.config.ts before anything else touches process.env.
// Kept as plain JS (not compiled) since it must run before ts-node registers.
const dotenvFlow = require('dotenv-flow');

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development',
  silent: true,
});
