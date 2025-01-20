const logHelper = require('../helpers/logHelper');
const responseHelper = require('../helpers/responseHelper');
const cityRepository = require('../repositories/cityRepository');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'cityController.js';

const getCities = async (_, res) => {
  try {
    const cities = await cityRepository.getCities();
    
    return responseHelper.sendResponse({
      res,
      code: 200,
      success: true,
      message: 'Successfully fetched records',
      respData: cities
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getCities',
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
  getCities
};
