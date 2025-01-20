const { sequelize } = require('../configs/dbConfig');
const app = require('../index');
const { cityDescribe } = require('./city.test');
const { menuDescribe } = require('./menu.test');
const { orderDescribe } = require('./order.test');
const { promotionDescribe } = require('./promotion.test');
const { userDescribe } = require('./user.test');

let server;
let dbAuthSpy;

jest.mock('../configs/dbConfig', () => {
  const SequelizeMock = require('sequelize-mock');
  const sequelizeMock = new SequelizeMock();

  return { sequelize: sequelizeMock };
});

describe('Promotion Service UT', () => {
  beforeAll(() => {
    server = app.listen(0);

    dbAuthSpy = jest.spyOn(sequelize, 'authenticate');
    dbAuthSpy.mockResolvedValueOnce('Authenticated');
  });

  afterAll((done) => {
    server.close(done);
  });

  cityDescribe();
  menuDescribe();
  orderDescribe();
  promotionDescribe();
  userDescribe();
});