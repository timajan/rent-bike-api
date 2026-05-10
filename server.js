require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const { connectRedis } = require('./utils/cache');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection successful');
    console.log('Database connection successful');

    await sequelize.sync();
    logger.info('Tables synced');
    console.log('Tables synced');

    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Server started on http://localhost:${PORT}`);
      console.log(`Server started on http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Startup error', { message: error.message, stack: error.stack });
    console.error('Startup error:', error);
  }
}

start();
