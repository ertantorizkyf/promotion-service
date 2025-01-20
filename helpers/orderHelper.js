const { sequelize } = require('../configs/dbConfig');

const logHelper = require('../helpers/logHelper');
const menuRepository = require('../repositories/menuRepository');
const orderRepository = require('../repositories/orderRepository');
const promotionRepository = require('../repositories/promotionRepository');

const DRAFT_ORDER_ACTION_CONSTANT = require('../constants/draftOrderActionConstant');
const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');
const ORDER_STATUS_CONSTANT = require('../constants/orderStatusConstant');
const PROMOTION_TYPE_CONSTANT = require('../constants/promotionTypeConstant');

const fileName = 'orderHelper.js';

const __getDraftOrder = async (dataObject) => {
  const { userID, action, payload, transaction } = dataObject;
  let isNewDraft = false;
  let showOrderItem = false;
  let allowFailure = false;
  if (action === DRAFT_ORDER_ACTION_CONSTANT.UPSERT) {
    allowFailure = true;
  }

  let order = await orderRepository.getCurrentDraftOrder({
    userID, 
    showOrderItem, 
    allowFailure
  });

  if (action === DRAFT_ORDER_ACTION_CONSTANT.UPSERT && !order) {
    isNewDraft = true;
    const orderPayload = {
      user_id: userID,
      order_amount: payload.total_amount,
      promotion_id: null,
      promotion_amount: 0,
      total_amount: payload.total_amount,
      status: ORDER_STATUS_CONSTANT.DRAFT
    };

    order = await orderRepository.createOrder({
      payload: orderPayload,
      transaction
    });
  }

  return {
    order,
    isNewDraft
  };
};

const __recalculateDraftOrderAmount = async (dataObject) => {
  const { order, orderItem, action, transaction } = dataObject;

  // ORDER AMOUNT
  if (action === DRAFT_ORDER_ACTION_CONSTANT.UPSERT) {
    const orderItems = await orderRepository.getOrderItems({ 
      orderID: order.id, 
      notMenuID:  orderItem.menu_id
    });

    order.order_amount = 0;
    orderItems.forEach((orderItemElement) => {
      order.order_amount = Number(order.order_amount) + Number(orderItemElement.total_amount);
    });

    order.order_amount = Number(order.order_amount) + Number(orderItem.total_amount);
  } else {
    order.order_amount = Number(order.order_amount) - Number(orderItem.total_amount);
  }

  // PROMOTION AMOUNT
  if (order.promotion_id !== null && order.promotion_id > 0) { 
    const promotion = await promotionRepository.getPromotionByID({ id: order.promotion_id });
    if (order.order_amount > promotion.min_order_amount) {
      if (promotion.type === PROMOTION_TYPE_CONSTANT.FIXED) {
        order.promotion_amount = Number(promotion.discount_amount);
      } else {
        order.promotion_amount = Number(order.order_amount) * Number(promotion.discount_amount);
        if (order.promotion_amount > promotion.max_discount_amount) {
          order.promotion_amount = Number(promotion.max_discount_amount);
        }
      }
    }
  }

  order.total_amount = Number(order.order_amount) + Number(order.promotion_amount);

  await orderRepository.updateOrder({
    id: order.id, 
    payload: order.dataValues,
    transaction
  });
};

const upsertOrderItem = async (userID, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const menu = await menuRepository.getMenuByID(payload.menu_id);
    
    payload.total_amount = menu.price * payload.quantity;
    const { order, isNewDraft } = await __getDraftOrder({
      userID, 
      action: DRAFT_ORDER_ACTION_CONSTANT.UPSERT, 
      payload,
      transaction
    });
    payload.order_id = order.id;
    
    await orderRepository.upsertOrderItem({
      orderID: payload.order_id, 
      menuID: payload.menu_id, 
      payload, 
      transaction
    });

    if (!isNewDraft) {
      await __recalculateDraftOrderAmount({ 
        order, 
        orderItem: payload,
        action: DRAFT_ORDER_ACTION_CONSTANT.UPSERT, 
        transaction 
      });
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'upsertOrderItem',
      logObj: error
    });

    throw error;
  }
};

const deleteOrderItem = async (userID, menuID) => {
  const transaction = await sequelize.transaction();

  try {
    const { order } = await __getDraftOrder({
      userID, 
      action: DRAFT_ORDER_ACTION_CONSTANT.DELETE_ITEM, 
      transaction
    });
    const orderID = order.id;

    const orderItem = await orderRepository.getOrderItemByCompositeID(orderID, menuID);
    
    await menuRepository.getMenuByID(menuID);
    await orderRepository.deleteOrderItem({ orderID, menuID, transaction });
    await __recalculateDraftOrderAmount({ 
      order, 
      orderItem,
      action: DRAFT_ORDER_ACTION_CONSTANT.DELETE_ITEM, 
      transaction 
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'upsertOrderItem',
      logObj: error
    });

    throw error;
  }
};

const updateOrderStatus = async (id, status) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await orderRepository.getOrderByID(id);
    order.status = status;
    await orderRepository.updateOrder({ id, payload: order.dataValues, transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'updateOrderStatus',
      logObj: error
    });

    throw error;
  }
};

const submitOrder = async (userID) => {
  const transaction = await sequelize.transaction();

  try {
    const { order } = await __getDraftOrder({
      userID, 
      action: DRAFT_ORDER_ACTION_CONSTANT.SUBMIT, 
      transaction
    });
    
    if (order.promotion_id !== null && order.promotion_id > 0) {
      const promotion = await promotionRepository.getPromotionByID({ 
        id: order.promotion_id,
        userID,
        checkEligibility: true,
        allowFailure: true
      });

      const redemptionCount = await promotionRepository.getPromotionRedemptionCount(promotion.id);
      const userRedemptionCount = await promotionRepository.getPromotionRedemptionCountByUserID(promotion.id, userID);

      if (
        !promotion || 
        order.order_amount < promotion.min_order_amount || 
        redemptionCount >= promotion.max_redemptions || 
        userRedemptionCount >= promotion.max_redemptions_per_user
      ) { 
        order.promotion_id = null;
        order.promotion_amount = 0;
        order.total_amount = order.order_amount + order.promotion_amount;
        await orderRepository.updateOrder({ id: order.id, payload: order, transaction });

        const error = new Error();  
        error.statusCode = 400;
        error.message = 'NOT ELIGIBLE!';
        
        throw error;
      }
    }
    
    order.status = ORDER_STATUS_CONSTANT.PENDING;
    await orderRepository.updateOrder({ id: order.id, payload: order.dataValues, transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'submitOrder',
      logObj: error.stack
    });

    throw error;
  }
};

module.exports = {
  upsertOrderItem,
  deleteOrderItem,
  updateOrderStatus,
  submitOrder
};
