const jwt = require('jsonwebtoken');

const responseHelper = require('../helpers/responseHelper');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_secret_key';

const authenticateToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return responseHelper.sendResponse({
      res,
      code: 403,
      success: false,
      message: 'FORBIDDEN!',
      respData: null
    });
  }

  if (token.includes('Bearer ')) token = token.replace('Bearer ', '');
  
  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return responseHelper.sendResponse({
        res,
        code: 403,
        success: false,
        message: 'FORBIDDEN!',
        respData: null
      });
    }

    req.headers.user_id = user.id;
    req.headers.user_role = user.role;
    next(); 
  });
};

const authenticateAdminToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return responseHelper.sendResponse({
      res,
      code: 403,
      success: false,
      message: 'FORBIDDEN!',
      respData: null
    });
  }

  if (token.includes('Bearer ')) token = token.replace('Bearer ', '');

  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err || user?.role?.toUpperCase() !== 'ADMIN') {
      return responseHelper.sendResponse({
        res,
        code: 403,
        success: false,
        message: 'FORBIDDEN!',
        respData: null
      });
    }

    req.headers.user_id = user.id;
    req.headers.user_role = user.role;
    next(); 
  });
};

const authenticateStaticToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return responseHelper.sendResponse({
      res,
      code: 403,
      success: false,
      message: 'FORBIDDEN!',
      respData: null
    });
  }

  if (token !== process.env.API_STATIC_TOKEN) {
    return responseHelper.sendResponse({
      res,
      code: 403,
      success: false,
      message: 'FORBIDDEN!',
      respData: null
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authenticateAdminToken,
  authenticateStaticToken
};
