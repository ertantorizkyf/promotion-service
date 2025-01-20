const { User } = require('../models/index');
const logHelper = require('../helpers/logHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'userRepository.js';

const createUser = async (dataObject) => {
  const { payload, transaction } = dataObject
  
  try {
    const user = await User.create(payload, { transaction });

    return user;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'createUser',
      logObj: {
        message: 'Error while creating new record',
        error
      }
    });

    throw error;
  }
};

const getUserByEmail = async (dataObject) => {
  const { 
    email,
    allowFailure = false
  } = dataObject;
  
  try {
    const user = await User.findOne({
      where: { email }
    });

    if (!allowFailure && !user) {
      const error = new Error();
      error.statusCode = 404;
      error.message = 'RECORD NOT FOUND!';
      
      throw error;
    }

    return user;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getUserByEmail',
      logObj: {
        message: 'Error while fetching record detail',
        error
      }
    });

    throw error;
  }
};

const getUserByID = async (userID) => {
  try {
    const user = await User.findOne({
      where: { id: userID }
    });

    if (!user) {
      const error = new Error();
      error.statusCode = 404;
      error.message = 'RECORD NOT FOUND!';
      
      throw error;
    }

    return user;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getUserByID',
      logObj: {
        message: 'Error while fetching record detail',
        error
      }
    });

    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserByID
};