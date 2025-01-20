const DataTypes = require('sequelize');
const { sequelize } = require('../configs/dbConfig');
const Promotion = require('./promotionModel');
const User = require('./userModel');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  order_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  promotion_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Promotion,
      key: 'id'
    }
  },
  promotion_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: ['draft','pending_payment', 'processing', 'completed', 'cancelled'],
    defaultValue: 'draft',
    allowNull: false
  }
}, {
  tableName: 'orders',
  timestamps: true,
  paranoid: true,
  underscored: true
});

module.exports = Order;
