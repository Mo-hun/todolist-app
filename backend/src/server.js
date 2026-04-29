const app = require('./app');
const env = require('./config/env');
const { checkConnection } = require('./config/db');

async function start() {
  await checkConnection();

  return app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

async function run() {
  try {
    return await start();
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
    return null;
  }
}

/* istanbul ignore next */
if (require.main === module) {
  run();
}

module.exports = {
  start,
  run,
};
