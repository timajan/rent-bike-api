const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bike = sequelize.define('Bike', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  price_per_hour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'rented', 'maintenance', 'inactive'),
    allowNull: false,
    defaultValue: 'available'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'bikes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Bike;