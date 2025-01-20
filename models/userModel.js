const DataTypes = require('sequelize');
const { sequelize } = require('../configs/dbConfig');
const City = require('./cityModel');
const Order = require('./orderModel');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM,
    values: ['customer','admin'],
    defaultValue: 'customer',
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: City,
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true
});

module.exports = User;
