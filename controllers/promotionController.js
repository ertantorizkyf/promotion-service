const logHelper = require('../helpers/logHelper');
const promotionHelper = require('../helpers/promotionHelper');
const responseHelper = require('../helpers/responseHelper');
const validationHelper = require('../helpers/validationHelper');
const promotionRepository = require('../repositories/promotionRepository');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'promotionController.js';

const getPromotions = async (req, res) => {
  try {
    validationHelper.validatePromotionListQuery(req.query);

    const { order_by } = req.query;
    const promotions = await promotionRepository.getPromotions({
      orderBy: order_by
    });
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully fetched records',
      respData: promotions
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getPromotions',
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

const getEligiblePromotions = async (req, res) => {
  const { user_id } = req.headers;
  try {
    validationHelper.validatePromotionListQuery(req.query);

    const { order_by } = req.query;
    const promotions = await promotionRepository.getEligiblePromotions({ userID: user_id, orderBy: order_by });
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully fetched records',
      respData: promotions
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getEligiblePromotions',
      logObj: error.stack
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

const createPromotion = async (req, res) => {
  const payload = req.body;

  try {
    validationHelper.validatePromotionPayload(payload);
    const response = await promotionHelper.createPromotion(payload);
    
    return responseHelper.sendResponse({
      res,
      code: 201,
      success: true,
      message: 'Successfully created new record',
      respData: response
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'createPromotion',
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

const updatePromotion = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    validationHelper.validatePromotionPayload(payload);
    const response = await promotionHelper.updatePromotion(id, payload);
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully updated record',
      respData: response
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'updatePromotion',
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

const deletePromotion = async (req, res) => {
  const { id } = req.params;
  
  try {
    await promotionHelper.deletePromotion(id);
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully deleting record',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'deletePromotion',
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

const redeemPromotion = async (req, res) => {
  const { user_id } = req.headers;
  try {
    validationHelper.validatePromotionRedemptionQuery(req.query);
    
    const { code } = req.query;
    await promotionHelper.redeemPromotion(user_id, code);
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully redeemed record',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'redeemPromotion',
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

const revokePromotionRedemption = async (req, res) => {
  const { user_id } = req.headers;
  try {
    await promotionHelper.revokePromotionRedemption(user_id);
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully revoked record redemption',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'revokePromotionRedemption',
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
  getPromotions,
  getEligiblePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  redeemPromotion,
  revokePromotionRedemption
};
