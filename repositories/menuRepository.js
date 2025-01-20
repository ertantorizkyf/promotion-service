const { Menu } = require('../models/index');
const logHelper = require('../helpers/logHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');

const fileName = 'menuRepository.js';

const getMenus = async (orderBy) => {
  try {
    const menus = await Menu.findAll({
      order: [
        [orderBy || 'id', 'ASC']
      ]
    });

    return menus;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getMenus',
      logObj: {
        message: 'Error while fetching records',
        error
      }
    });

    throw error;
  }
};

const getMenuByID = async (id) => {
  try {
    const menu = await Menu.findOne({
      where: { id }
    });

    if (!menu) {
      const error = new Error();
      error.statusCode = 404;
      error.message = 'RECORD NOT FOUND!';
      
      throw error;
    }

    return menu;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getMenuByID',
      logObj: {
        message: 'Error while fetching record detail',
        error
      }
    });

    throw error;
  }
};

const createMenu = async (dataObject) => {
  const { payload, transaction } = dataObject;
  
  try {
    const menu = await Menu.create(payload, { transaction });

    return menu;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'createMenu',
      logObj: {
        message: 'Error while creating new record',
        error
      }
    });

    throw error;
  }
};

const updateMenu = async (dataObject) => {
  const { id, payload, transaction } = dataObject;

  try {
    await Menu.update(
      payload, 
      { 
        where: { id },
        transaction
      }
    );
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'updateMenu',
      logObj: {
        message: 'Error while updating record',
        error
      }
    });

    throw error;
  }
};

module.exports = {
  getMenus,
  getMenuByID,
  createMenu,
  updateMenu
};