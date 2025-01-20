const DB_CONSTANT = {
  NAME: process.env.DB_NAME || 'express_chatbot_db',
  USER: process.env.DB_USER || 'root',
  PASS: process.env.DB_PASS || '',
  HOST: process.env.DB_HOST || 'localhost',
  PORT: process.env.DB_PORT || '3306',
  DIALECT: process.env.DB_DIALECT || 'mysql',
  ENABLE_LOGGING:  process.env.DB_ENABLE_LOGGING || false
};

module.exports = DB_CONSTANT;
