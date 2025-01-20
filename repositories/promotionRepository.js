const { Op } = require('sequelize');

const { sequelize } = require('../configs/dbConfig');
const { City, Order, Promotion, PromotionCity, User } = require('../models/index');
const logHelper = require('../helpers/logHelper');

const LOG_LEVELS_CONSTANT = require('../constants/logLevelsConstant');
const ORDER_STATUS_CONSTANT = require('../constants/orderStatusConstant');

const fileName = 'promotionRepository.js';

const __getEligiblePromotionSubqueries = async (userID) => {
  const user = await User.findOne({
    where: { id: userID }
  });

  const loyalUserCriteria = sequelize.literal(`
    (
      SELECT COUNT(*) >= 10 AND SUM(total_amount) >= 1000000
      FROM orders
      WHERE orders.user_id = ${user.id}
    )
  `);

  const newUserCriteria = sequelize.literal(`
    (
      SELECT COUNT(*) > 0
      FROM orders
      WHERE orders.user_id = ${user.id}
      AND orders.promotion_id IS NOT NULL
      AND orders.promotion_id != 0
    )
  `);

  const specificCityCriteria = sequelize.literal(`
    EXISTS (
      SELECT 1
      FROM promotion_cities
      WHERE promotion_cities.promotion_id = Promotion.id
      AND promotion_cities.city_id = ${user.city_id}
    )
  `);

  return {
    loyalUserCriteria,
    newUserCriteria,
    specificCityCriteria
  };
};

const getPromotions = async (dataObject) => {
  const { 
    ids = [],
    orderBy 
  } = dataObject;

  try {
    let whereConditions = {};
    if (ids.length > 0) {
      whereConditions.id = {
        [Op.in]: ids
      }
    }

    const promotions = await Promotion.findAll({
      where: whereConditions,
      include: [
        {
          model: PromotionCity,
          include: [
            {
              model: City,
            }
          ],
        },
      ],
      order: [
        [orderBy || 'id', 'ASC']
      ]
    });

    return promotions;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getPromotions',
      logObj: {
        message: 'Error while fetching records',
        error
      }
    });

    throw error;
  }
};

const getEligiblePromotions = async (dataObject) => {
  const { 
    userID,
    orderBy 
  } = dataObject;

  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch user details
    const user = await User.findOne({ where: { id: userID } });
    if (!user) {
      throw new Error(`User with ID ${userID} not found`);
    }

    // Check loyal user criteria
    const loyalUserOrdersCount = await Order.count({
      where: { user_id: userID },
    });
    const loyalUserTotalAmount = await Order.sum('total_amount', {
      where: { user_id: userID },
    });

    const isLoyalUser = loyalUserOrdersCount >= 10 && loyalUserTotalAmount >= 1000000;

    // Check new user criteria
    const hasUsedPromotion = await Order.count({
      where: {
        user_id: userID,
        promotion_id: { [Op.ne]: null },
      },
    });

    const isNewUser = hasUsedPromotion === 0;

    // Fetch eligible promotions
    const promotions = await Promotion.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { target_user: 'all' },
              { target_user: 'loyal', [Op.and]: sequelize.literal(isLoyalUser ? 'true' :'false') },
              { target_user: 'new', [Op.and]: sequelize.literal(isNewUser ? 'true' : 'false') },
              {
                target_user: 'specific_city',
                [Op.and]: {
                  '$PromotionCities.city_id$': user.city_id,
                },
              },
            ],
          },
          {
            start_date: { [Op.lte]: today },
            end_date: { [Op.gte]: today },
          },
        ],
      },
      include: [
        {
          model: PromotionCity,
          include: [{ model: City }],
        },
      ],
      order: [[orderBy || 'id', 'ASC']],
    });

    return promotions;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getEligiblePromotions',
      logObj: {
        message: 'Error while fetching records',
        error
      }
    });

    throw error;
  }
};

const getPromotionByID = async (dataObject) => {
  const { 
    id,
    userID,
    checkEligibility = false,
    allowFailure = false
  } = dataObject;

  try {
    let whereConditions = {
      id
    };
    if (checkEligibility) {
      const today = new Date().toISOString().split('T')[0];

      // Fetch user details
      const user = await User.findOne({ where: { id: userID } });
      if (!user) {
        throw new Error(`User with ID ${userID} not found`);
      }

      // Check loyal user criteria
      const loyalUserOrdersCount = await Order.count({
        where: { user_id: userID },
      });
      const loyalUserTotalAmount = await Order.sum('total_amount', {
        where: { user_id: userID },
      });

      const isLoyalUser = loyalUserOrdersCount >= 10 && loyalUserTotalAmount >= 1000000;

      // Check new user criteria
      const hasUsedPromotion = await Order.count({
        where: {
          user_id: userID,
          promotion_id: { [Op.ne]: null },
        },
      });

      const isNewUser = hasUsedPromotion === 0;

      whereConditions = {
        [Op.and]: [
          {
            [Op.or]: [
              { target_user: 'all' },
              { target_user: 'loyal', [Op.and]: sequelize.literal(isLoyalUser ? 'true' :'false') },
              { target_user: 'new', [Op.and]: sequelize.literal(isNewUser ? 'true' : 'false') },
              {
                target_user: 'specific_city',
                [Op.and]: {
                  '$PromotionCities.city_id$': user.city_id,
                },
              },
            ],
          },
          {
            start_date: { [Op.lte]: today },
            end_date: { [Op.gte]: today },
            id
          }
        ]
      }
    }

    const promotion = await Promotion.findOne({
      where: whereConditions
    });

    if (!allowFailure && !promotion) {
      const error = new Error();
      error.statusCode = 404;
      error.message = 'RECORD NOT FOUND!';
      
      throw error;
    }
    
    return promotion;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getPromotionByID',
      logObj: {
        message: 'Error while fetching record',
        error
      }
    });

    throw error;
  }
};

const getPromotionByCode = async (dataObject) => {
  const { 
    code,
    userID,
    checkEligibility = false
  } = dataObject;

  try {
    let whereConditions = {
      code
    };
    if (checkEligibility) {
      const today = new Date().toISOString().split('T')[0];

      // Fetch user details
      const user = await User.findOne({ where: { id: userID } });
      if (!user) {
        throw new Error(`User with ID ${userID} not found`);
      }

      // Check loyal user criteria
      const loyalUserOrdersCount = await Order.count({
        where: { user_id: userID },
      });
      const loyalUserTotalAmount = await Order.sum('total_amount', {
        where: { user_id: userID },
      });

      const isLoyalUser = loyalUserOrdersCount >= 10 && loyalUserTotalAmount >= 1000000;

      // Check new user criteria
      const hasUsedPromotion = await Order.count({
        where: {
          user_id: userID,
          promotion_id: { [Op.ne]: null },
        },
      });

      const isNewUser = hasUsedPromotion === 0;

      whereConditions = {
        [Op.and]: [
          {
            [Op.or]: [
              { target_user: 'all' },
              { target_user: 'loyal', [Op.and]: sequelize.literal(isLoyalUser ? 'true' :'false') },
              { target_user: 'new', [Op.and]: sequelize.literal(isNewUser ? 'true' : 'false') },
              {
                target_user: 'specific_city',
                [Op.and]: {
                  '$PromotionCities.city_id$': user.city_id,
                },
              },
            ],
          },
          {
            start_date: { [Op.lte]: today },
            end_date: { [Op.gte]: today },
            code
          }
        ]
      }
    }

    const promotion = await Promotion.findOne({
      where: whereConditions,
      include: [
        {
          model: PromotionCity,
          include: [
            {
              model: City
            },
          ],
        },
      ]
    });

    if (!promotion) {
      const error = new Error();
      error.statusCode = 404;
      error.message = 'RECORD NOT FOUND!';
      
      throw error;
    }
    
    return promotion;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getPromotionByCode',
      logObj: {
        message: 'Error while fetching record',
        error
      }
    });

    throw error;
  }
};

const createPromotion = async (dataObject) => {
  const { payload, transaction } = dataObject;
  try {
    const promotion = await Promotion.create(payload, { transaction });

    return promotion;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.statusCode = 409;
      error.message = 'CONFLICTING RECORD!';
    }

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'createPromotion',
      logObj: {
        message: 'Error while creating new record',
        error
      }
    });

    throw error;
  }
};

const updatePromotion = async (dataObject) => {
  const { id, payload, transaction } = dataObject
  
  try {
    await Promotion.update(
      payload, 
      { 
        where: { id },
        transaction
      }
    );
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      error.statusCode = 409;
      err.message = 'CONFLICTING RECORD!';
    }

    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'updatePromotion',
      logObj: {
        message: 'Error while updating record',
        error
      }
    });

    throw error;
  }
};

const bulkCreatePromotionCity = async (dataObject) => {
  const { payload, transaction } = dataObject;
  try {
    const promotionCities = await PromotionCity.bulkCreate(payload, { transaction });

    return promotionCities;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'bulkCreatePromotionCity',
      logObj: {
        message: 'Error while bulk creating new records',
        error
      }
    });

    throw error;
  }
};

const deletePromotion = async (dataObject) => {
  const { id, transaction } = dataObject;
  
  try {
    await Promotion.destroy({ 
      where: { id },
      transaction
    });
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'deletePromotion',
      logObj: {
        message: 'Error while deleting record',
        error
      }
    });

    throw error;
  }
};

const deletePromotionCity = async (dataObject) => {
  const { promotionID, transaction } = dataObject;
  try {
    const promotionCities = await PromotionCity.destroy({
      where: { promotion_id: promotionID },
      transaction
    });

    return promotionCities;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'deletePromotionCity',
      logObj: {
        message: 'Error while deleting records',
        error
      }
    });

    throw error;
  }
};

const getPromotionRedemptionCount = async (promotionID) => {
  try {
    const redemptionCount = await Order.count({
      where: {
        promotion_id: promotionID,
        status: {
          [Op.notIn]: [ORDER_STATUS_CONSTANT.DRAFT, ORDER_STATUS_CONSTANT.CANCELLED]
        },
      }
    });

    return redemptionCount;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getPromotionRedemptionCount',
      logObj: {
        message: 'Error while counting records',
        error
      }
    });

    throw error;
  }
};


const getPromotionRedemptionCountByUserID = async (promotionID, userID) => {
  try {
    const redemptionCount = await Order.count({
      where: {
        promotion_id: promotionID,
        user_id: userID,
        status: {
          [Op.notIn]: [ORDER_STATUS_CONSTANT.DRAFT, ORDER_STATUS_CONSTANT.CANCELLED]
        },
      }
    });

    return redemptionCount;
  } catch (error) {
    logHelper.commonLogger({
      level: LOG_LEVELS_CONSTANT.ERR,
      file: fileName, 
      functionName: 'getPromotionRedemptionCountByUserID',
      logObj: {
        message: 'Error while counting records',
        error
      }
    });

    throw error;
  }
};
module.exports = {
  getPromotions,
  getEligiblePromotions,
  getPromotionByID,
  getPromotionByCode,
  createPromotion,
  updatePromotion,
  deletePromotion,
  bulkCreatePromotionCity,
  deletePromotionCity,
  getPromotionRedemptionCount,
  getPromotionRedemptionCountByUserID
};