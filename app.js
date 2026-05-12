const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const bikeRoutes = require('./routes/bikes');
const stationRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const statusRoutes = require('./routes/status');
const swaggerRoutes = require('./routes/swagger');
const performanceMiddleware = require('./middleware/performanceMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later',
  },
});

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*'}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(limiter);
app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'combined'));
app.use(performanceMiddleware);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  logger.info('Root endpoint was called');
  res.json({
    message: 'Bike rental API is running',
    docs: '/api-docs',
    status: '/status',
  });
});


app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerRoutes);
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

module.exports = app;
