const bcrypt = require('bcrypt');

const logHelper = require('../helpers/logHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'encryptionHelper.js';

const encryptPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'encryptPassword',
      logObj: error
    });

    throw new Error('PASSWORD ENCRYPTION FAILED');
  }
};

const validatePassword = async (payloadPass, dbPass) => {
  try {
    const isMatch = await bcrypt.compare(payloadPass, dbPass);

    return isMatch;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'validatePassword',
      logObj: error
    });

    throw new Error('PASSWORD VALIDATION FAILED');
  }
};

module.exports = { 
  encryptPassword, 
  validatePassword 
};
