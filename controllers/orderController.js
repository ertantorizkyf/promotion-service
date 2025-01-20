const logHelper = require('../helpers/logHelper');
const orderHelper = require('../helpers/orderHelper');
const responseHelper = require('../helpers/responseHelper');
const validationHelper = require('../helpers/validationHelper');
const orderRepository = require('../repositories/orderRepository');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'orderController.js';

const upsertItem = async (req, res) => {
  const payload = req.body;
  const { user_id } = req.headers;
  
  try {
    validationHelper.validateUpsertOrderMenuPayload(payload);
    await orderHelper.upsertOrderItem(user_id, payload);
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully upserted record',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'upsertItem',
      logObj: error
    });

    return responseHelper.sendResponse({
      res,
      code: error.statusCode || 500,
      success: false,
      message: error.message,
      respData: null
    });
  }
};

const deleteItem = async (req, res) => {
  const { user_id } = req.headers;
  
  try {
    validationHelper.validateDeleteOrderItemQuery(req.query);
    const { menu_id } = req.query;

    await orderHelper.deleteOrderItem(user_id, menu_id);
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully deleted record',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'deleteItem',
      logObj: error
    });

    return responseHelper.sendResponse({
      res,
      code: error.statusCode || 500,
      success: false,
      message: error.message,
      respData: null
    });
  }
};

const getMyCurrentDraftOrder = async (req, res) => {
  const { user_id } = req.headers;
  
  try {
    const order = await orderRepository.getCurrentDraftOrder({
      userID: user_id, 
      showOrderItem: true, 
      allowFailure: false
    });
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully fetched record',
      respData: order
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getMyCurrentDraftOrder',
      logObj: error
    });

    return responseHelper.sendResponse({
      res,
      code: error.statusCode || 500,
      success: false,
      message: error.message,
      respData: null
    });
  }
};

const getMyOrderHistories = async (req, res) => {
  const { user_id } = req.headers;
  
  try {
    const order = await orderRepository.getOrders({ userID: user_id });
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully fetched records',
      respData: order
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getMyOrderHistories',
      logObj: error
    });

    return responseHelper.sendResponse({
      res,
      code: error.statusCode || 500,
      success: false,
      message: error.message,
      respData: null
    });
  }
};

const taskUpdateOrderStatus = async (req, res) => {
  const { id } = req.params;
  
  try {
    validationHelper.validateUpdateOrderStatusParam(req.query);

    const { status } = req.query;
    await orderHelper.updateOrderStatus(id, status);

    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully updated record',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'taskUpdateOrderStatus',
      logObj: error
    });

    return responseHelper.sendResponse({
      res,
      code: error.statusCode || 500,
      success: false,
      message: error.message,
      respData: null
    });
  }
};

const adminUpdateOrderStatus = async (req, res) => {
  const { id } = req.params;
  
  try {
    validationHelper.validateUpdateOrderStatusParam(req.body);

    const { status } = req.body;
    await orderHelper.updateOrderStatus(id, status);

    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully updated record',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'updateTaskOrderStatus',
      logObj: error
    });

    return responseHelper.sendResponse({
      res,
      code: error.statusCode || 500,
      success: false,
      message: error.message,
      respData: null
    });
  }
};

const submitDraftOrder = async (req, res) => {
  const { user_id } = req.headers;
  
  try {
    await orderHelper.submitOrder(user_id);

    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully submitted record',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'submitDraftOrder',
      logObj: error
    });

    return responseHelper.sendResponse({
      res,
      code: error.statusCode || 500,
      success: false,
      message: error.message,
      respData: null
    });
  }
};

module.exports = {
  upsertItem,
  deleteItem,
  getMyCurrentDraftOrder,
  getMyOrderHistories,
  taskUpdateOrderStatus,
  adminUpdateOrderStatus,
  submitDraftOrder
};
