const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize } = require('./models');
const bikeRoutes = require('./routes/bikes');
const stationRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const statusRoutes = require('./routes/status');
const performanceMiddleware = require('./middleware/performanceMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();
const path = require('path');
app.use(express.json());
app.use(morgan('combined'));
app.use(performanceMiddleware);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  logger.info('Root endpoint was called');
  res.json({ message: 'Bike rental API is running' });
});

app.use('/auth', authRoutes);
app.use('/bikes', bikeRoutes);
app.use('/stations', stationRoutes);
app.use('/bookings', bookingRoutes);
app.use(uploadRoutes);
app.use(statusRoutes);

app.get('/test-error', (req, res, next) => {
  next(new Error('Test server error'));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection successful');
    console.log('Database connection successful');

    await sequelize.sync();
    logger.info('Tables synced');
    console.log('Tables synced');

    app.listen(PORT, () => {
      logger.info(`Server started on http://localhost:${PORT}`);
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Startup error', { message: error.message, stack: error.stack });
    console.error('Startup error:', error);
  }
}

start();