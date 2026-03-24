const express = require('express');
require('dotenv').config();

const { sequelize } = require('./models');
const bikeRoutes = require('./routes/bikes');
const stationRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Bike rental API is running' });
});

app.use('/bikes', bikeRoutes);
app.use('/stations', stationRoutes);
app.use('/bookings', bookingRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');

    await sequelize.sync();
    console.log('Tables synced');

    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
  }
}

start();