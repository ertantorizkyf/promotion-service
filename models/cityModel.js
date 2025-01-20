const DataTypes = require('sequelize');
const { sequelize } = require('../configs/dbConfig');

const City = sequelize.define('City', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'cities',
  timestamps: false
});

module.exports = City;
