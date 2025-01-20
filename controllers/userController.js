const logHelper = require('../helpers/logHelper');
const responseHelper = require('../helpers/responseHelper');
const userHelper = require('../helpers/userHelper');
const validationHelper = require('../helpers/validationHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'userController.js';

const register = async (req, res) => {
  const payload = req.body;

  try {
    validationHelper.validateUserRegisterPayload(payload);
    await userHelper.registerUser(payload);

    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully registered',
      respData: null
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'register',
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

const login = async (req, res) => {
  const payload = req.body;

  try {
    validationHelper.validateLoginPayload(payload);
    const token = await userHelper.login(payload);
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully logged in',
      respData: token
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'login',
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
  register,
  login
};
