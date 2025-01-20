const { sequelize } = require('../configs/dbConfig');

const logHelper = require('../helpers/logHelper');
const menuRepository = require('../repositories/menuRepository');
const orderRepository = require('../repositories/orderRepository');
const promotionRepository = require('../repositories/promotionRepository');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');
const PROMOTION_TYPE_CONSTANT = require('../constants/promotionTypeConstant');
const ORDER_STATUS_CONSTANT = require('../constants/orderStatusConstant');

const fileName = 'menuHelper.js';

const __getDraftOrders = async (menuID) => {
  const orders = await orderRepository.getOrders({
    status: ORDER_STATUS_CONSTANT.DRAFT
  });

  const orderIDs = [];
  const orderPromotionIDs = [];
  orders.forEach((order) => {
    orderIDs.push(order.id);
    if (order.promotion_id !== null && order.promotion_id > 0) {
      orderPromotionIDs.push(order.promotion_id);
    }
  });

  const orderItems = await orderRepository.getOrderItems({
    orderIDs,
    menuID
  });
  const promotions = await promotionRepository.getPromotions({
    ids: orderPromotionIDs
  });

  return {
    orders,
    orderItems,
    promotions
  };
};

const __recalculateDraftOrderItemsAmount = async (dataObject) => {
  const { menuID, newPrice, orderItems, transaction } = dataObject;

  const currentMenuOrderItems = orderItems.filter((orderItem) => Number(orderItem.menu_id) === Number(menuID));
  currentMenuOrderItems.map((orderItem) => {
    orderItem.total_amount = orderItem.quantity * newPrice;

    return orderItem;
  });

  await orderRepository.bulkUpdateOrderItemsByMenuID({ 
    orderItems: currentMenuOrderItems, 
    menuID, 
    transaction 
  });  
};

const __recalculateDraftOrdersAmount = async (dataObject) => {
  const { orders, orderItems, promotions, transaction } = dataObject;

  orders.map(order => {
    let newOrderAmount = 0;
    currentOrderItems = orderItems.filter((orderItem) => orderItem.order_id === order.id);
    currentOrderItems.forEach((orderItem) => {
      newOrderAmount += orderItem.total_amount
    });
    order.order_amount = newOrderAmount;

    order.promotion_amount = 0;
    if (order.promotion_id !== null && order.promotion_id > 0) {
      currentPromotion = promotions.find((promotion) => promotion.id === order.promotion_id);
      if (order.order_amount > currentPromotion.min_order_amount) {
        if (currentPromotion.type === PROMOTION_TYPE_CONSTANT.FIXED) {
          order.promotion_amount = currentPromotion.discount_amount;
        } else {
          order.promotion_amount = order.order_amount * currentPromotion.discount_amount;
          if (order.promotion_amount > currentPromotion.max_discount_amount) {
            order.promotion_amount = currentPromotion.max_discount_amount;
          }
        }
      }
    }

    order.total_amount = order.order_amount + order.promotion_amount;

    return order;
  });

  await orderRepository.bulkUpdateOrders({ orders, transaction });
};

const createMenu = async (payload) => {
  const transaction = await sequelize.transaction();
  
  try {
    const menu = await menuRepository.createMenu({ payload, transaction });
    
    await transaction.commit();

    return menu;
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'createMenu',
      logObj: error
    });

    throw error;
  }
};

const updateMenu = async (id, payload) => {
  const transaction = await sequelize.transaction();
    
  try {
    await menuRepository.getMenuByID(id);
    await menuRepository.updateMenu({ id, payload, transaction });

    // UPDATE ORDER AND ORDER ITEM AMOUNT
    const { orders, orderItems, promotions } = await __getDraftOrders(id);
    await __recalculateDraftOrderItemsAmount({
      menuID: id, 
      newPrice: payload.price, 
      orderItems,
      transaction
    });
    await __recalculateDraftOrdersAmount({ 
      orders, 
      orderItems, 
      promotions,
      transaction
    });
    
    await transaction.commit();

    const response = payload;
    response.id = id;
    
    return response;
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'updateMenu',
      logObj: error.stack
    });

    throw error;
  }
};

module.exports = {
  createMenu,
  updateMenu
};
