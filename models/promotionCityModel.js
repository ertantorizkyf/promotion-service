const DataTypes = require('sequelize');
const { sequelize } = require('../configs/dbConfig');
const City = require('./cityModel');
const Promotion = require('./promotionModel');

const PromotionCity = sequelize.define('PromotionCity', {
  promotion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Promotion,
      key: 'id'
    },
    primaryKey: true
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
  tableName: 'promotion_cities',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['promotion_id', 'city_id']
    }
  ]
});

module.exports = PromotionCity;
