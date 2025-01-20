const Joi = require('joi');

const logHelper = require('../helpers/logHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'validationHelper.js';

const validateUserRegisterPayload = (payload) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      address: Joi.string().min(20).required(),
      city_id: Joi.number().invalid(0).required()
    }); 

  const validationError = schema.validate(payload).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validateUserRegisterPayload',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID PAYLOAD!';

    throw error;
  }
};

const validateLoginPayload = (payload) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  }); 

  const validationError = schema.validate(payload).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validateLoginPayload',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID PAYLOAD!';

    throw error;
  }
};

const validateMenuListQuery = (query) => {
  const schema = Joi.object({
    order_by: Joi.string().valid('id', 'name', 'price', 'created_at').optional()
  }); 

  const validationError = schema.validate(query).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validateMenuListQuery',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID QUERY!';

    throw error;
  }
};

const validateMenuPayload = (payload) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    price: Joi.number().precision(2).positive().required()
  }); 

  const validationError = schema.validate(payload).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validateMenuPayload',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID PAYLOAD!';

    throw error;
  }
};

const validateUpsertOrderMenuPayload = (payload) => {
  const schema = Joi.object({
    menu_id: Joi.number().invalid(0).required(),
    quantity: Joi.number().invalid(0).required()
  }); 

  const validationError = schema.validate(payload).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validateUpsertOrderMenuPayload',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID PAYLOAD!';

    throw error;
  }
};

const validateDeleteOrderItemQuery = (query) => {
  const schema = Joi.object({
    menu_id: Joi.number().invalid(0).required()
  }); 

  const validationError = schema.validate(query).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validateDeleteOrderItemQuery',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID PAYLOAD!';

    throw error;
  }
};

const validateUpdateOrderStatusParam = (payload) => {
  const schema = Joi.object({
    status: Joi.string().valid('draft', 'pending_payment', 'processing', 'completed', 'cancelled').required()
  }); 

  const validationError = schema.validate(payload).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validateUpdateOrderStatusParam',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID PARAM!';

    throw error;
  }
};

const validatePromotionListQuery = (query) => {
  const schema = Joi.object({
    order_by: Joi.string().valid('id', 'name', 'code', 'type', 'target_user', 'start_date', 'created_at').optional()
  }); 

  const validationError = schema.validate(query).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validateMenuListQuery',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID QUERY!';

    throw error;
  }
};

const validatePromotionRedemptionQuery = (query) => {
  const schema = Joi.object({
    code: Joi.string().required()
  }); 

  const validationError = schema.validate(query).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validatePromotionRedemptionQuery',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID QUERY!';

    throw error;
  }
};

const validatePromotionPayload = (payload) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().regex(/^[A-Z0-9]+$/).message('The value must contain only uppercase letters and numbers').required(),
    description: Joi.string().optional().allow(''),
    type: Joi.string().valid('percentage', 'fixed_cut').required(),
    target_user: Joi.string().valid('all','new','loyal','specific_city').required(),
    discount_amount: Joi.number().precision(2).positive().required(),
    max_discount_amount: Joi.number().precision(2).positive().allow(null).optional(),
    min_order_amount: Joi.number().precision(2).positive().allow(0).required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    max_redemptions: Joi.number().required(),
    max_redemptions_per_user: Joi.number().required(),
    promotion_cities: Joi.array()
      .items(
        Joi.object({
          city_id: Joi.number().required()
        })
      )
      .optional()
  }); 

  const validationError = schema.validate(payload).error;
  if (validationError) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validatePromotionPayload',
      logObj: validationError
    });

    const error = new Error();
    error.statusCode = 400;
    error.message = 'INVALID PAYLOAD!';

    throw error;
  }
};

module.exports = {
  validateUserRegisterPayload,
  validateLoginPayload,
  validateMenuListQuery,
  validateMenuPayload,
  validateUpsertOrderMenuPayload,
  validateDeleteOrderItemQuery,
  validateUpdateOrderStatusParam,
  validatePromotionListQuery,
  validatePromotionRedemptionQuery,
  validatePromotionPayload
};
