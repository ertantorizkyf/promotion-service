const City = require('./cityModel');
const Menu = require('./menuModel');
const OrderItem = require('./orderItemModel');
const Order = require('./orderModel');
const PromotionCity = require('./promotionCityModel');
const Promotion = require('./promotionModel');
const User = require('./userModel');

// Relationships
City.hasMany(User, { 
  foreignKey: 'city_id',
  sourceKey: 'id'
});
City.hasMany(PromotionCity, { 
  foreignKey: 'city_id',
  sourceKey: 'id'
});

Menu.hasMany(OrderItem, { 
  foreignKey: 'menu_id',
  sourceKey: 'id'
});

OrderItem.belongsTo(Order, { 
  foreignKey: 'order_id',
  targetKey: 'id'
});
OrderItem.belongsTo(Menu, { 
  foreignKey: 'menu_id',
  targetKey: 'id'
});

Order.belongsTo(User, { 
  foreignKey: 'user_id',
  targetKey: 'id'
});
Order.belongsTo(Promotion, { 
  foreignKey: 'promotion_id',
  targetKey: 'id'
});
Order.hasMany(OrderItem, { 
  foreignKey: 'order_id',
  sourceKey: 'id'
});

PromotionCity.belongsTo(Promotion, { 
  foreignKey: 'promotion_id',
  targetKey: 'id'
});
PromotionCity.belongsTo(City, { 
  foreignKey: 'city_id',
  targetKey: 'id'
});

Promotion.hasMany(PromotionCity, { 
  foreignKey: 'promotion_id',
  sourceKey: 'id'
});
Promotion.hasMany(Order, { 
  foreignKey: 'promotion_id',
  sourceKey: 'id'
});

User.belongsTo(City, { 
  foreignKey: 'city_id',
  targetKey: 'id'
});
User.hasMany(Order, { 
  foreignKey: 'user_id',
  sourceKey: 'id'
});

module.exports = {
  City,
  Menu,
  OrderItem,
  Order,
  PromotionCity,
  Promotion,
  User
};