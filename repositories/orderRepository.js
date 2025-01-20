const { Op } = require('sequelize');

const { sequelize } = require('../configs/dbConfig');
const { Menu, Order, OrderItem } = require('../models/index');
const logHelper = require('../helpers/logHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');
const ORDER_STATUS_CONSTANT = require('../constants/orderStatusConstant');

const QUERY_BATCH_SIZE = process.env.QUERY_BATCH_SIZE || 1000;
const fileName = 'orderRepository.js';

const getCurrentDraftOrder = async (dataObject) => {
  const { 
    userID, 
    showOrderItem = false, 
    allowFailure = false
  } = dataObject;

  try {
    const order = await Order.findOne({
      where: {
        user_id: userID,
        status: ORDER_STATUS_CONSTANT.DRAFT
      },
      ... (showOrderItem && {
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Menu
              },
            ],
          },
        ]
      }),
      order: [
        ['id', 'DESC']
      ]
    });

    if (!allowFailure && !order) { 
      const error = new Error();
      error.statusCode = 404;
      error.message = 'RECORD NOT FOUND!';
      
      throw error;
    }

    return order;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getCurrentDraftOrder',
      logObj: {
        message: 'Error while fetching record detail',
        error
      }
    });

    throw error;
  }
};

const getOrderByID = async (id) => {
  try {
    const order = await Order.findOne({
      where: { id }
    });

    if (!order) { 
      const error = new Error();
      error.statusCode = 404;
      error.message = 'RECORD NOT FOUND!';
      
      throw error;
    }

    return order;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getOrderByID',
      logObj: {
        message: 'Error while fetching record detail',
        error
      }
    });

    throw error;
  }
};

const getOrders = async (dataObject) => {
  const { 
    userID = 0,
    status = '',
    statuses = [],
    promotionID = 0,
    showOrderItem = false, 
  } = dataObject;

  try {
    let whereConditions = {};
    if (userID > 0) {
      whereConditions.user_id = userID;
    }
    if (status !== '') {
      whereConditions.status = status;
    }
    if (statuses.length > 0) {
      whereConditions.status = {
        [Op.in]: statuses
      }
    }
    if (promotionID !== null && promotionID > 0) {
      whereConditions.promotion_id = promotionID;
    }

    const orders = await Order.findAll({
      where: whereConditions,
      ... (showOrderItem && {
        include: [
          {
            model: OrderItem,
            include: [
              {
                model: Menu
              },
            ],
          },
        ]
      }),
      order: [
        ['created_at', 'DESC']
      ]
    });

    return orders;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getOrders',
      logObj: {
        message: 'Error while fetching records',
        error
      }
    });

    throw error;
  }
};

const createOrder = async (dataObject) => {
  const { payload, transaction } = dataObject;
  
  try {
    const order = await Order.create(payload, { transaction });

    return order;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'createOrder',
      logObj: {
        message: 'Error while creating new record',
        error
      }
    });

    throw error;
  }
};

const updateOrder = async (dataObject) => {
  const { id, payload, transaction } = dataObject;

  try {
    await Order.update(
      payload, 
      { 
        where: { id },
        transaction
      }
    );
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'updateOrder',
      logObj: {
        message: 'Error while updating record',
        error
      }
    });

    throw error;
  }
};

const bulkUpdateOrders = async (dataObject) => {
  const { orders, transaction } = dataObject;
  try {
    for (let i = 0; i < orders.length; i += QUERY_BATCH_SIZE) {
      const batch = orders.slice(i, i + QUERY_BATCH_SIZE);

      const caseStatements = {
        order_amount: batch.map(u => `WHEN id = ${u.id} THEN '${u.order_amount}'`).join(' '),
        promotion_id: batch.map(u => `WHEN id = ${u.id} THEN '${u.promotion_id}'`).join(' '),
        promotion_amount: batch.map(u => `WHEN id = ${u.id} THEN '${u.promotion_amount}'`).join(' '),
        total_amount: batch.map(u => `WHEN id = ${u.id} THEN '${u.total_amount}'`).join(' '),
        status: batch.map(u => `WHEN id = ${u.id} THEN '${u.status}'`).join(' ')
      };

      const orderIDs = batch.map(u => u.id).join(', ');

      const query = `
        UPDATE orders
        SET 
          order_amount = CASE ${caseStatements.order_amount} END,
          promotion_id = CASE ${caseStatements.promotion_id} END,
          promotion_amount = CASE ${caseStatements.promotion_amount} END,
          total_amount = CASE ${caseStatements.total_amount} END,
          status = CASE ${caseStatements.status} END
        WHERE id IN (${orderIDs});
      `;

      await sequelize.query(query, { transaction });
    }
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'bulkUpdateOrders',
      logObj: {
        message: 'Error while bulk updating records',
        error
      }
    });

    throw error;
  }
};

const bulkUpdateOrderItemsByMenuID = async (dataObject) => {
  const { orderItems, menuID, transaction } = dataObject;
  try {
    for (let i = 0; i < orderItems.length; i += QUERY_BATCH_SIZE) {
      const batch = orderItems.slice(i, i + QUERY_BATCH_SIZE);

      const caseStatements = {
        quantity: batch.map(u => `WHEN order_id = ${u.order_id} THEN '${u.quantity}'`).join(' '),
        total_amount: batch.map(u => `WHEN order_id = ${u.order_id} THEN '${u.total_amount}'`).join(' ')
      };

      const query = `
        UPDATE orders
        SET 
          quantity = CASE ${caseStatements.quantity} END,
          total_amount = CASE ${caseStatements.total_amount} END
        WHERE menu_id = ${menuID};
      `;

      await sequelize.query(query, { transaction });
    }
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'bulkUpdateOrderItemsByMenuID',
      logObj: {
        message: 'Error while bulk updating records',
        error
      }
    });

    throw error;
  }
};

const upsertOrderItem = async (dataObject) => {
  const { orderID, menuID, payload, transaction } = dataObject;
  try {
    const existingOrderItem = await OrderItem.findOne({
      where: {
        order_id: orderID,
        menu_id: menuID
      },
      transaction
    });

    if (!existingOrderItem) {
      await OrderItem.create(payload, { transaction });
    } else {
      await OrderItem.update(
        payload, 
        { 
          where: { 
            order_id: orderID,
            menu_id: menuID
          },
          transaction 
        }
      );
    }
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'upsertOrderItem',
      logObj: {
        message: 'Error while upserting record',
        error
      }
    });

    throw error;
  }
};

const deleteOrderItem = async (dataObject) => {
  const { orderID, menuID, transaction } = dataObject;

  try {
    await OrderItem.destroy({
      where: {
        order_id: orderID,
        menu_id: menuID
      },
      transaction
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'deleteOrderItem',
      logObj: {
        message: 'Error while deleting record',
        error
      }
    });

    throw error;
  }
};

const getOrderItems = async (dataObject) => {
  const { 
    orderID = 0,
    orderIDs = [],
    menuID = 0,
    notMenuID = 0
  } = dataObject;

  try {
    let whereConditions = {};
    if (orderID > 0) { 
      whereConditions.order_id = orderID;
    }
    if (orderID.length > 0) { 
      whereConditions.order_id = {
        [Op.in]: orderIDs
      }
    }
    if (menuID > 0) { 
      whereConditions.menu_id = menuID;
    }
    if (notMenuID > 0) {
      whereConditions.menu_id = {
        [Op.not]: menuID
      };
    }

    const orderItems = await OrderItem.findAll({
      where: whereConditions
    });

    return orderItems;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getOrderItems',
      logObj: {
        message: 'Error while fetching records',
        error
      }
    });

    throw error;
  }
};

const getOrderItemByCompositeID = async (orderID, menuID) => {
  try {
    const orderItem = await OrderItem.findOne({
      where: {
        order_id: orderID,
        menu_id: menuID
      }
    });

    if (!orderItem) {
      const error = new Error();
      error.statusCode = 404;
      error.message = 'RECORD NOT FOUND!';
      
      throw error;
    }

    return orderItem;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getOrderItemByCompositeID',
      logObj: {
        message: 'Error while fetching record detail',
        error
      }
    });

    throw error;
  }
};

module.exports = {
  getCurrentDraftOrder,
  getOrderByID,
  getOrders,
  createOrder,
  updateOrder,
  bulkUpdateOrders,
  bulkUpdateOrderItemsByMenuID,
  upsertOrderItem,
  deleteOrderItem,
  getOrderItems,
  getOrderItemByCompositeID
};