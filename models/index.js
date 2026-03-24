const sequelize = require('../config/database');

const User = require('./User');
const Station = require('./Station');
const Bike = require('./Bike');
const Booking = require('./Booking');
const Payment = require('./Payment');

Station.hasMany(Bike, { foreignKey: 'station_id', onDelete: 'CASCADE' });
Bike.belongsTo(Station, { foreignKey: 'station_id' });

User.hasMany(Booking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

Bike.hasMany(Booking, { foreignKey: 'bike_id', onDelete: 'CASCADE' });
Booking.belongsTo(Bike, { foreignKey: 'bike_id' });

Booking.hasOne(Payment, { foreignKey: 'booking_id', onDelete: 'CASCADE' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

module.exports = {
  sequelize,
  User,
  Station,
  Bike,
  Booking,
  Payment
};