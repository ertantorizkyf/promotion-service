const DataTypes = require('sequelize');
const { sequelize } = require('../configs/dbConfig');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  }
}, {
  tableName: 'menus',
  timestamps: true,
  paranoid: true,
  underscored: true
});

module.exports = Menu;
