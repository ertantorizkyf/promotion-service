const sq = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const logHelper = require('../helpers/logHelper');

const DB_CONSTANT = require('../constants/dbConstant')
const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'dbConfig.js';

const sequelize = new sq.Sequelize(DB_CONSTANT.NAME, DB_CONSTANT.USER, DB_CONSTANT.PASS, {
  host: DB_CONSTANT.HOST,
  port: DB_CONSTANT.PORT,
  dialect: DB_CONSTANT.DIALECT,
  logging: DB_CONSTANT.ENABLE_LOGGING ? console.log : false
});

(async () => {
  try {
    await sequelize.authenticate();
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.INFO,
      file: fileName, 
      functionName: 'sequelize.authenticate()',
      logObj: {
        message: `Connection to MySQL has been established successfully.`
      }
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'sequelize.authenticate()',
      logObj: {
        message: `Unable to connect to the database: ${error}`
      }
    });
  }
})();

module.exports = { 
  sequelize 
};