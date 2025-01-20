const { sequelize } = require('../configs/dbConfig');

const logHelper = require('../helpers/logHelper');
const orderRepository = require('../repositories/orderRepository');
const promotionRepository = require('../repositories/promotionRepository');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');
const ORDER_STATUS_CONSTANT = require('../constants/orderStatusConstant');
const PROMOTION_TYPE_CONSTANT = require('../constants/promotionTypeConstant');

const fileName = 'promotionHelper.js';

const __recalculateDraftOrdersAmount = async (dataObject) => {
  const { existingPromotion, promotionPayload, transaction } = dataObject;

  if (
    existingPromotion.type !== promotionPayload.type ||
    existingPromotion.discount_amount !== promotionPayload.discount_amount ||
    existingPromotion.max_discount_amount !== promotionPayload.max_discount_amount ||
    existingPromotion.min_order_amount !== promotionPayload.min_order_amount
  ) {
    const orders = await orderRepository.getOrders({
      status: ORDER_STATUS_CONSTANT.DRAFT
    });

    orders.map(order => {
      if (order.order_amount > promotionPayload.min_order_amount) {
        if (promotionPayload.type === PROMOTION_TYPE_CONSTANT.FIXED) {
          order.promotion_amount = promotionPayload.discount_amount;
        } else {
          order.promotion_amount = order.order_amount * promotionPayload.discount_amount;
          if (order.promotion_amount > promotionPayload.max_discount_amount) {
            order.promotion_amount = promotionPayload.max_discount_amount;
          }
        }
      } else {
        order.promotion_id = null;
        order.promotion_amount = 0;
      }

      order.total_amount = order.order_amount + order.promotion_amount;

      return order;
    });

    await orderRepository.bulkUpdateOrders({ orders, transaction });
  }  
};

const createPromotion = async (payload) => {
  const transaction = await sequelize.transaction();

  try {
    const promotionCityPayload = payload.promotion_cities;
    delete payload.promotion_cities;

    const promotion = await promotionRepository.createPromotion({
      payload,
      transaction
    });

    if (promotionCityPayload !== null && promotionCityPayload?.length > 0) {
      promotionCityPayload.map((promotionCity) => {
        promotionCity.promotion_id = promotion.id;

        return promotionCity;
      });

      await promotionRepository.bulkCreatePromotionCity({
        payload: promotionCityPayload,
        transaction
      });
    }

    await transaction.commit();

    return promotion;
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'createPromotion',
      logObj: error.stack
    });

    throw error;
  }
};

const updatePromotion = async (id, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const existingPromotion = await promotionRepository.getPromotionByID({ id });

    const promotionCityPayload = payload.promotion_cities;
    delete payload.promotion_cities;

    await promotionRepository.updatePromotion({ id, payload, transaction});
    await promotionRepository.deletePromotionCity({ promotionID: id, transaction });

    if (promotionCityPayload !== null && promotionCityPayload?.length > 0) {
      promotionCityPayload.map((promotionCity) => {
        promotionCity.promotion_id = id;

        return promotionCity;
      });

      await promotionRepository.bulkCreatePromotionCity({
        payload: promotionCityPayload,
        transaction
      });
    }

    __recalculateDraftOrdersAmount({ existingPromotion, promotionPayload: payload, transaction });
    
    await transaction.commit();

    const response = payload;
    response.id = id;
    response.promotion_cities = promotionCityPayload;
    
    return response;
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'updatePromotion',
      logObj: error
    });

    throw error;
  }
};

const deletePromotion = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    await promotionRepository.getPromotionByID({ id });
    
    nonDraftOrders = await orderRepository.getOrders({
      statuses: [
        ORDER_STATUS_CONSTANT.PENDING,
        ORDER_STATUS_CONSTANT.PROCESSING,
        ORDER_STATUS_CONSTANT.COMPLETED
      ],
      promotionID: id
    });

    if (nonDraftOrders.length > 0) {
      const error = new Error();
      error.statusCode = 400;
      error.message = 'RECORD IN USE!';
      
      throw error;
    }

    await promotionRepository.deletePromotionCity({ promotionID: id, transaction });
    await promotionRepository.deletePromotion({ id, transaction });

    draftOrders = await orderRepository.getOrders({
      status: ORDER_STATUS_CONSTANT.DRAFT,
      promotionID: id
    });

    draftOrders.map(order => {
      order.promotion_id = null;
      order.promotion_amount = 0;
      order.total_amount = order.order_amount + order.promotion_amount;

      return order;
    });

    await orderRepository.bulkUpdateOrders({ orders: draftOrders, transaction });
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'deletePromotion',
      logObj: error
    });

    throw error;
  }
};

const redeemPromotion = async (userID, code) => {
  const transaction = await sequelize.transaction();

  try {
    const promotion = await promotionRepository.getPromotionByCode({
      code,
      userID,
      checkEligibility: true
    });
    
    const order = await orderRepository.getCurrentDraftOrder({
      userID, 
      showOrderItem: false, 
      allowFailure: false
    });

    const redemptionCount = await promotionRepository.getPromotionRedemptionCount(promotion.id);
    const userRedemptionCount = await promotionRepository.getPromotionRedemptionCountByUserID(promotion.id, userID);
    
    if (
      order.order_amount < promotion.min_order_amount ||
      redemptionCount >= promotion.max_redemptions || 
      userRedemptionCount >= promotion.max_redemptions_per_user
    ) {
      const error = new Error();
      error.statusCode = 400;
      error.message = 'NOT ELIGIBLE!';
      
      throw error;
    }

    order.promotion_id = promotion.id;
    if (promotion.type === PROMOTION_TYPE_CONSTANT.FIXED) {
      order.promotion_amount = promotion.discount_amount;
    } else {
      order.promotion_amount = order.order_amount * promotion.discount_amount;
      if (order.promotion_amount > promotion.max_discount_amount) {
        order.promotion_amount = promotion.max_discount_amount;
      }
    }
    order.total_amount = order.order_amount + order.promotion_amount;

    await orderRepository.updateOrder({ id: order.id, payload: order, transaction });
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'redeemPromotion',
      logObj: error
    });

    throw error;
  }
};

const revokePromotionRedemption = async (userID) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await orderRepository.getCurrentDraftOrder({
      userID, 
      showOrderItem: false, 
      allowFailure: false
    });

    order.promotion_id = null;
    order.promotion_amount = 0;
    order.total_amount = order.order_amount + order.promotion_amount;

    await orderRepository.updateOrder({ id: order.id, payload: order, transaction });
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'revokePromotionRedemption',
      logObj: error
    });

    throw error;
  }
};

module.exports = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  redeemPromotion,
  revokePromotionRedemption
};
