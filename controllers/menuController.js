const logHelper = require('../helpers/logHelper');
const menuHelper = require('../helpers/menuHelper');
const responseHelper = require('../helpers/responseHelper');
const validationHelper = require('../helpers/validationHelper');
const menuRepository = require('../repositories/menuRepository');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'menuController.js';

const getMenus = async (req, res) => {
  try {
    validationHelper.validateMenuListQuery(req.query);

    const { order_by } = req.query;
    const menus = await menuRepository.getMenus(order_by);
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully fetched records',
      respData: menus
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getMenus',
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

const createMenu = async (req, res) => {
  const payload = req.body;

  try {
    validationHelper.validateMenuPayload(payload);
    const response = await menuHelper.createMenu(payload);
    
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
      functionName: 'createMenu',
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

const updateMenu = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    validationHelper.validateMenuPayload(payload);
    const response = await menuHelper.updateMenu(id, payload);
    
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
      functionName: 'updateMenu',
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
  getMenus,
  createMenu,
  updateMenu
};
