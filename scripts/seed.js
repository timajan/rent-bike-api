require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User, Station, Bike } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const adminPassword = await bcrypt.hash('admin123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  const [admin] = await User.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  const [client] = await User.findOrCreate({
    where: { email: 'client@example.com' },
    defaults: {
      name: 'Client User',
      email: 'client@example.com',
      password: clientPassword,
      role: 'client',
    },
  });

  const [station] = await Station.findOrCreate({
    where: { name: 'Central Station' },
    defaults: {
      name: 'Central Station',
      address: 'Khreshchatyk St, Kyiv',
      latitude: 50.4501,
      longitude: 30.5234,
    },
  });

  await Bike.findOrCreate({
    where: { title: 'City Bike' },
    defaults: {
      title: 'City Bike',
      type: 'city',
      price_per_hour: 80,
      status: 'available',
      description: 'Comfortable bike for city trips',
      station_id: station.id,
    },
  });

  await Bike.findOrCreate({
    where: { title: 'Mountain Bike' },
    defaults: {
      title: 'Mountain Bike',
      type: 'mountain',
      price_per_hour: 120,
      status: 'available',
      description: 'Bike for rough roads and longer trips',
      station_id: station.id,
    },
  });

  console.log('Seed completed');
  console.log('Admin login: admin@example.com / admin123');
  console.log('Client login: client@example.com / client123');
  console.log(`Created users: admin=${admin.id}, client=${client.id}`);

  await sequelize.close();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await sequelize.close();
  process.exit(1);
});
