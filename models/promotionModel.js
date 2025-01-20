const DataTypes = require('sequelize');
const { sequelize } = require('../configs/dbConfig');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM,
    values: ['percentage', 'fixed_cut'],
    defaultValue: 'fixed_cut',
    allowNull: false
  },
  target_user: {
    type: DataTypes.ENUM,
    values: ['all', 'new', 'loyal', 'specific_city'],
    defaultValue: 'all',
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  max_discount_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  min_order_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  max_redemptions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_redemptions_per_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'promotions',
  timestamps: true,
  paranoid: true,
  underscored: true
});

module.exports = Promotion;
