const { City } = require('../models/index');
const logHelper = require('../helpers/logHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'cityRepository.js';

const getCities = async () => {
  try {
    const cities = await City.findAll({
      order: [
        ['name', 'ASC']
      ]
    });

    return cities;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getCities',
      logObj: {
        message: 'Error while fetching records',
        error
      }
    });

    throw error;
  }
};

module.exports = {
  getCities
};