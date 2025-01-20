const Request = require('supertest');

const { sequelize } = require('../configs/dbConfig');
const app = require('../index');
const { Menu, Order, OrderItem, Promotion } = require('../models/index');
const menuListDB = require('./mocks/menuListDB.json');
const menuDetailDB = require('./mocks/menuDetailDB.json');
const orderListDB = require('./mocks/orderListDB.json');
const orderItemListDB = require('./mocks/orderItemListDB.json');
const promotionListDB = require('./mocks/promotionListDB.json');
const jwtMock = require('./mocks/jwt.json');

const ORDER_STATUS_CONSTANT = require('../constants/orderStatusConstant');

let endpoint;
let findAllSpy;
let findOneSpy;
let createSpy;
let updateSpy;
let header;
let payload;
let transactionSpy;
let sequelizeQuerySpy;

module.exports.menuDescribe = () => describe('Menu Routes', () => {
  describe('GET - Get Menu List', () => {
    beforeEach(() => {
      endpoint = '/menus';

      header = {
        Authorization: jwtMock.customer
      };
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    test('Status 200: Successfully fetched menu records', async () => {
      findAllSpy = jest.spyOn(Menu, 'findAll');
      findAllSpy.mockResolvedValueOnce(menuListDB);
  
      await Request(app)
        .get(`${endpoint}?order_by=id`)
        .set(header)
        .expect(200)
        .then((res) => {
          expect(res.body.data.length).toBe(4);
        });
    });

    test('Status 400: Invalid query value', async () => {
      await Request(app)
        .get(`${endpoint}?order_by=loremipsum`)
        .set(header)
        .expect(400);
    });
  
    test('Status 500: Error while fetching menu records', async () => {
      findAllSpy = jest.spyOn(Menu, 'findAll');
      findAllSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(500);
    });
  });

  describe('POST - Create New Menu', () => {
    beforeEach(() => {
      endpoint = '/admin/menus';

      header = {
        Authorization: jwtMock.admin
      };

      payload = {
        name: 'Menu A',
        description: 'Lorem ipsum',
        price: 10000
      };

      transactionSpy = jest.spyOn(sequelize, 'transaction');
      transactionSpy.mockImplementation(() => ({
        commit: jest.fn().mockResolvedValue('commit successful'),
        rollback: jest.fn().mockResolvedValue('rollback successful')
      }));
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    test('Status 201: Successfully created new menu records', async () => {
      createSpy = jest.spyOn(Menu, 'create');
      createSpy.mockResolvedValueOnce(menuDetailDB);
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(201)
        .then((res) => {
          expect(res.body.data).toBeDefined();
        });
    });

    test('Status 400: Invalid payload', async () => {
      delete payload.name;

      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(400);
    });

    test('Status 403: Forbidden access', async () => {
      header.Authorization = jwtMock.customer;

      await Request(app)
        .post(endpoint)
        .set(header)
        .expect(403);
    });
  
    test('Status 500: Error while creating menu records', async () => {
      createSpy = jest.spyOn(Menu, 'create');
      createSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(500);
    });
  });

  describe('PUT - Update Existing Menu', () => {
    beforeEach(() => {
      endpoint = '/admin/menus/1';

      header = {
        Authorization: jwtMock.admin
      };

      payload = {
        name: 'Menu A Edit',
        description: 'Lorem ipsum',
        price: 10000
      };

      transactionSpy = jest.spyOn(sequelize, 'transaction');
      transactionSpy.mockImplementation(() => ({
        commit: jest.fn().mockResolvedValue('commit successful'),
        rollback: jest.fn().mockResolvedValue('rollback successful')
      }));

      sequelizeQuerySpy = jest.spyOn(sequelize, 'query');
      sequelizeQuerySpy.mockResolvedValue(1);
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    test('Status 200: Successfully updated menu record with fixed_cut promotion', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB); 
      updateSpy = jest.spyOn(Menu, 'update');
      updateSpy.mockResolvedValueOnce(true);
      const draftOrders = orderListDB.filter((order) => order.status === ORDER_STATUS_CONSTANT.DRAFT);
      findAllSpy = jest.spyOn(Order, 'findAll');
      findAllSpy.mockResolvedValueOnce(draftOrders);
      findAllSpy = jest.spyOn(OrderItem, 'findAll');
      findAllSpy.mockResolvedValueOnce(orderItemListDB);
      findAllSpy = jest.spyOn(Promotion, 'findAll');
      findAllSpy.mockResolvedValueOnce(promotionListDB);
      
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeDefined();
        });
    });

    test('Status 200: Successfully updated menu record without promotion', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB); 
      updateSpy = jest.spyOn(Menu, 'update');
      updateSpy.mockResolvedValueOnce(true);
      const draftOrders = orderListDB.filter((order) => order.status === ORDER_STATUS_CONSTANT.DRAFT);
      draftOrders[0].promotion_id = null;
      draftOrders[0].promotion_amount = 0;
      findAllSpy = jest.spyOn(Order, 'findAll');
      findAllSpy.mockResolvedValueOnce(draftOrders);
      findAllSpy = jest.spyOn(OrderItem, 'findAll');
      findAllSpy.mockResolvedValueOnce(orderItemListDB);
      findAllSpy = jest.spyOn(Promotion, 'findAll');
      findAllSpy.mockResolvedValueOnce(promotionListDB);
      
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeDefined();
        });
    });

    test('Status 200: Successfully updated menu record with percentage promotion', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB); 
      updateSpy = jest.spyOn(Menu, 'update');
      updateSpy.mockResolvedValueOnce(true);
      const draftOrders = orderListDB.filter((order) => order.status === ORDER_STATUS_CONSTANT.DRAFT);
      draftOrders[0].promotion_id = 2;
      findAllSpy = jest.spyOn(Order, 'findAll');
      findAllSpy.mockResolvedValueOnce(draftOrders);
      findAllSpy = jest.spyOn(OrderItem, 'findAll');
      findAllSpy.mockResolvedValueOnce(orderItemListDB);
      findAllSpy = jest.spyOn(Promotion, 'findAll');
      findAllSpy.mockResolvedValueOnce(promotionListDB);
      
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeDefined();
        });
    });

    test('Status 400: Invalid payload', async () => {
      delete payload.name;

      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(400);
    });

    test('Status 403: Forbidden access', async () => {
      header.Authorization = jwtMock.customer;

      await Request(app)
        .put(endpoint)
        .set(header)
        .expect(403);
    });
  
    test('Status 500: Error while updating menu records', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(500);
    });
  });
});
