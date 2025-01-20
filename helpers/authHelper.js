const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_secret_key';

const generateAuthToken = (user) => {
  const tokenData = { id: user.id, role: user.role };
  const token = jwt.sign(tokenData, JWT_SECRET_KEY, { expiresIn: '24h' });

  return token;
};

module.exports = { 
  generateAuthToken 
};
