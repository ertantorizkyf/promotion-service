const DataTypes = require('sequelize');
const { sequelize } = require('../configs/dbConfig');
const Menu = require('./menuModel');
const Order = require('./orderModel');

const OrderItem = sequelize.define('OrderItem', {
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'id'
    },
    primaryKey: true
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Menu,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['order_id', 'menu_id']
    }
  ]
});

module.exports = OrderItem;
