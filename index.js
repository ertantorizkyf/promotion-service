const dotenv = require('dotenv');
const express = require('express');

const logHelper = require('./helpers/logHelper')
const cityRouter = require('./routers/cityRouter');
const menuRouter = require('./routers/menuRouter');
const orderRouter = require('./routers/orderRouter');
const promotionRouter = require('./routers/promotionRouter');
const userRouter = require('./routers/userRouter');

const LOG_LEVELS_CONSTANT = require('./constants/logLevelsConstant');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const fileName = 'index.js';

app.use(express.json());

app.use('/cities', cityRouter);
app.use('/menus', menuRouter);
app.use('/admin/menus', menuRouter);
app.use('/promotions', promotionRouter);
app.use('/admin/promotions', promotionRouter);
app.use('/orders', orderRouter);
app.use('/admin/orders', orderRouter);
app.use('/users', userRouter);

app.use('/ping', (_req, res) => {
  return res.send({
    data: {
      message: 'PONG!'
    }
  });
});

app.listen(port, () => {
  logHelper.commonLogger({
    level: LOG_LEVELS_CONSTANT.INFO,
    file: fileName, 
    functionName: 'app.listen',
    logObj: {
      message: `Starting app on port ${port}`
    }
  });
});

module.exports = app;

