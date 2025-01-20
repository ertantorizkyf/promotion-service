const { sequelize } = require('../configs/dbConfig');

const logHelper = require('../helpers/logHelper');
const userRepository = require('../repositories/userRepository');
const authHelper = require('../helpers/authHelper');
const encryptionHelper = require('../helpers/encryptionHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'userHelper.js';

const registerUser = async (payload) => {
  const transaction = await sequelize.transaction();
  
  try {
    encryptedPassword = await encryptionHelper.encryptPassword(payload.password);
    payload.password = encryptedPassword;
  
    const existingUser = await userRepository.getUserByEmail({
      email: payload.email,
      allowFailure: true
    });
    if (existingUser) { 
      const error = new Error();
      error.statusCode = 409;
      error.message = 'CONFLICTING RECORD!';
      
      throw error;
    }

    await userRepository.createUser({ payload, transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'registerUser',
      logObj: error
    });

    throw error;
  }
};

const login = async (payload) => {
  try {
    const user = await userRepository.getUserByEmail({
      email: payload.email,
      allowFailure: false
    });

    const isValid = await encryptionHelper.validatePassword(payload.password, user.password);
    if (!isValid) { 
      const error = new Error();
      error.statusCode = 400;
      error.message = 'INVALID CREDENTIALS!';
      
      throw error;
    }
    
    const token = authHelper.generateAuthToken(user);

    return token;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'login',
      logObj: error
    });

    throw error;
  }
};

module.exports = {
  registerUser,
  login
};
