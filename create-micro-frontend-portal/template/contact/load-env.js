const dotenvFlow = require('dotenv-flow');

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development',
  silent: true,
});
