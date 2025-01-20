const Request = require('supertest');

const { sequelize } = require('../configs/dbConfig');
const app = require('../index');
const { Menu, Order, OrderItem, Promotion } = require('../models/index');
const promotionRepository = require('../repositories/promotionRepository');
const menuDetailDB = require('./mocks/menuDetailDB.json');
const orderListDB = require('./mocks/orderListDB.json');
const orderDetailDB = require('./mocks/orderDetailDB.json');
const orderItemListDB = require('./mocks/orderItemListDB.json');
const orderItemDetailDB = require('./mocks/orderItemDetailDB.json');
const promotionDetailDB = require('./mocks/promotionDetailDB.json');
const jwtMock = require('./mocks/jwt.json');

const ORDER_STATUS_CONSTANT = require('../constants/orderStatusConstant');
const PROMOTION_TYPE_CONSTANT = require('../constants/promotionTypeConstant');

let endpoint;
let findAllSpy;
let findOneSpy;
let createSpy;
let updateSpy;
let destroySpy;
let header;
let payload;
let transactionSpy;
let countSpy;

module.exports.orderDescribe = () => describe('Order Routes', () => {
  describe('POST - Add Menu to Order Item', () => {
    beforeEach(() => {
      endpoint = '/orders/item';

      header = {
        Authorization: jwtMock.customer
      };

      payload = {
        menu_id: 1,
        quantity: 2
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
  
    test('Status 200: Successfully upserting new item to new draft order', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB);
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);
      findOneSpy = jest.spyOn(OrderItem, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);
      createSpy = jest.spyOn(OrderItem, 'create');
      const newOrderItem = orderItemDetailDB;
      newOrderItem.quantity = payload.quantity;
      createSpy.mockResolvedValueOnce(newOrderItem);
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(200);
    });

    test('Status 200: Successfully upserting existing item to new draft order', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB);
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);
      findOneSpy = jest.spyOn(OrderItem, 'findOne');
      findOneSpy.mockResolvedValueOnce(orderItemDetailDB);
      updateSpy = jest.spyOn(OrderItem, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(200);
    });

    test('Status 200: Successfully upserting new item to existing draft order without promotion', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB);
      findOneSpy = jest.spyOn(Order, 'findOne');
      const draftOrderDetail = JSON.parse(JSON.stringify(orderDetailDB));
      draftOrderDetail.status = ORDER_STATUS_CONSTANT.DRAFT;
      draftOrderDetail.promotion_id = null;
      draftOrderDetail.promotion_amount = 0;
      findOneSpy.mockResolvedValueOnce(draftOrderDetail);
      findOneSpy = jest.spyOn(OrderItem, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);
      createSpy = jest.spyOn(OrderItem, 'create');
      const newOrderItem = JSON.parse(JSON.stringify(orderItemDetailDB));
      newOrderItem.quantity = payload.quantity;
      createSpy.mockResolvedValueOnce(newOrderItem);
      findAllSpy = jest.spyOn(OrderItem, 'findAll');
      findAllSpy.mockResolvedValueOnce(orderItemListDB);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(200);
    });

    test('Status 200: Successfully upserting new item to existing draft order with fixed_amount promotion', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB);
      findOneSpy = jest.spyOn(Order, 'findOne');
      const draftOrderDetail = JSON.parse(JSON.stringify(orderDetailDB));
      draftOrderDetail.status = ORDER_STATUS_CONSTANT.DRAFT;
      findOneSpy.mockResolvedValueOnce(draftOrderDetail);
      findOneSpy = jest.spyOn(OrderItem, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);
      createSpy = jest.spyOn(OrderItem, 'create');
      const newOrderItem = JSON.parse(JSON.stringify(orderItemDetailDB));
      newOrderItem.quantity = payload.quantity;
      createSpy.mockResolvedValueOnce(newOrderItem);
      findAllSpy = jest.spyOn(OrderItem, 'findAll');
      findAllSpy.mockResolvedValueOnce(orderItemListDB);
      findOneSpy = jest.spyOn(Promotion, 'findOne');
      const upsertItemPromotion = JSON.parse(JSON.stringify(promotionDetailDB));
      upsertItemPromotion.min_order_amount = 0;
      findOneSpy.mockResolvedValueOnce(upsertItemPromotion);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(200);
    });

    test('Status 200: Successfully upserting new item to existing draft order with percentage promotion', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB);
      findOneSpy = jest.spyOn(Order, 'findOne');
      const draftOrderDetail = JSON.parse(JSON.stringify(orderDetailDB));
      draftOrderDetail.status = ORDER_STATUS_CONSTANT.DRAFT;
      findOneSpy.mockResolvedValueOnce(draftOrderDetail);
      findOneSpy = jest.spyOn(OrderItem, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);
      createSpy = jest.spyOn(OrderItem, 'create');
      const newOrderItem = JSON.parse(JSON.stringify(orderItemDetailDB));
      newOrderItem.quantity = payload.quantity;
      createSpy.mockResolvedValueOnce(newOrderItem);
      findAllSpy = jest.spyOn(OrderItem, 'findAll');
      findAllSpy.mockResolvedValueOnce(orderItemListDB);
      findOneSpy = jest.spyOn(Promotion, 'findOne');
      const upsertItemPercentagePromotion = JSON.parse(JSON.stringify(promotionDetailDB));
      upsertItemPercentagePromotion.id = 2;
      upsertItemPercentagePromotion.min_order_amount = 0;
      upsertItemPercentagePromotion.type = PROMOTION_TYPE_CONSTANT.PERCENTAGE;
      upsertItemPercentagePromotion.amount = 10;
      upsertItemPercentagePromotion.max_discount_amount = 1000;
      findOneSpy.mockResolvedValueOnce(upsertItemPercentagePromotion);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(200);
    });

    test('Status 400: Invalid payload', async () => {
      await Request(app)
        .post(endpoint)
        .set(header)
        .expect(400);
    });

    test('Status 500: Error while upserting order item', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .post(endpoint)
        .send(payload)
        .set(header)
        .expect(500);
    });
  });

  describe('DELETE - Remove Menu from Order Item', () => {
    beforeEach(() => {
      endpoint = '/orders/item';

      header = {
        Authorization: jwtMock.customer
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
  
    test('Status 200: Successfully removing new item from draft order without promotion', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      const draftOrderDetail = JSON.parse(JSON.stringify(orderDetailDB));
      draftOrderDetail.status = ORDER_STATUS_CONSTANT.DRAFT;
      draftOrderDetail.promotion_id = null;
      draftOrderDetail.promotion_amount = 0;
      findOneSpy.mockResolvedValueOnce(draftOrderDetail);
      findOneSpy = jest.spyOn(OrderItem, 'findOne');
      findOneSpy.mockResolvedValueOnce(orderItemDetailDB);
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockResolvedValueOnce(menuDetailDB);
      destroySpy = jest.spyOn(OrderItem, 'destroy');
      destroySpy.mockResolvedValueOnce(destroySpy);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .delete(`${endpoint}?menu_id=1`)
        .set(header)
        .expect(200);
    });

    test('Status 400: Invalid payload', async () => {
      await Request(app)
        .delete(endpoint)
        .set(header)
        .expect(400);
    });

    test('Status 500: Error while upserting order item', async () => {
      findOneSpy = jest.spyOn(Menu, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .delete(`${endpoint}?menu_id=1`)
        .set(header)
        .expect(500);
    });
  });

  describe('GET - Get Order Histories', () => {
    beforeEach(() => {
      endpoint = '/orders/histories';

      header = {
        Authorization: jwtMock.customer
      };
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    test('Status 200: Successfully fetched order history records', async () => {
      findAllSpy = jest.spyOn(Order, 'findAll');
      findAllSpy.mockResolvedValueOnce(orderListDB);
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(200)
        .then((res) => {
          expect(res.body.data.length).toBe(5);
        });
    });

    test('Status 500: Error while fetching order history records', async () => {
      findAllSpy = jest.spyOn(Order, 'findAll');
      findAllSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(500);
    });
  });

  describe('GET - Get Draft Order', () => {
    beforeEach(() => {
      endpoint = '/orders/draft';

      header = {
        Authorization: jwtMock.customer
      };
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    test('Status 200: Successfully fetched draft order record', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      const draftOrderDetail = JSON.parse(JSON.stringify(orderDetailDB));
      draftOrderDetail.status = ORDER_STATUS_CONSTANT.DRAFT;
      findOneSpy.mockResolvedValueOnce(draftOrderDetail);
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(200)
        .then((res) => {
          expect(res.body.data.status).toBe(ORDER_STATUS_CONSTANT.DRAFT);
        });
    });

    test('Status 500: Error while fetching draft order record', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(500);
    });
  });

  describe('GET - Submit Draft', () => {
    beforeEach(() => {
      endpoint = '/orders/draft/submission';

      header = {
        Authorization: jwtMock.customer
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
  
    test('Status 200: Successfully submitted draft order', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      const draftOrderDetail = JSON.parse(JSON.stringify(orderDetailDB));
      draftOrderDetail.status = ORDER_STATUS_CONSTANT.DRAFT;
      draftOrderDetail.promotion_id = null;
      draftOrderDetail.promotion_amount = 0;
      findOneSpy.mockResolvedValueOnce(draftOrderDetail);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(200);
    });

    test('Status 400: Not eligible while submitting', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      const draftOrderDetail = JSON.parse(JSON.stringify(orderDetailDB));
      findOneSpy.mockResolvedValueOnce(draftOrderDetail);
      findOneSpy = jest.spyOn(promotionRepository, 'getPromotionByID');
      findOneSpy.mockResolvedValueOnce(promotionDetailDB);
      countSpy = jest.spyOn(promotionRepository, 'getPromotionRedemptionCount');
      countSpy.mockResolvedValueOnce(100);
      countSpy = jest.spyOn(promotionRepository, 'getPromotionRedemptionCountByUserID');
      countSpy.mockResolvedValueOnce(100);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .send(payload)
        .expect(400);
    });

    test('Status 500: Error while submitting draft order', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(500);
    });
  });

  describe('GET - Task API Update Status', () => {
    beforeEach(() => {
      process.env.API_STATIC_TOKEN = 'STATIC_TOKEN_VAL';

      endpoint = '/orders/1/tasks/status';

      header = {
        Authorization: process.env.API_STATIC_TOKEN
      };

      transactionSpy = jest.spyOn(sequelize, 'transaction');
      transactionSpy.mockImplementation(() => ({
        commit: jest.fn().mockResolvedValue('commit successful'),
        rollback: jest.fn().mockResolvedValue('rollback successful')
      }));
    });
  
    afterEach(() => {
      process.env.API_STATIC_TOKEN = undefined;

      jest.restoreAllMocks();
    });
  
    test('Status 200: Successfully updated task order record', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockResolvedValueOnce(orderDetailDB);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .get(`${endpoint}?status=processing`)
        .set(header)
        .expect(200);
    });

    test('Status 400: Invalid param', async () => {
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(400);
    });

    test('Status 500: Error while updating task order record', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(`${endpoint}?status=processing`)
        .set(header)
        .expect(500);
    });
  });

  describe('PUT - Admin Update Status', () => {
    beforeEach(() => {
      endpoint = '/admin/orders/1/status';

      header = {
        Authorization: jwtMock.admin
      };

      payload = {
        status: 'processing'
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
  
    test('Status 200: Successfully updated admin order status record', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockResolvedValueOnce(orderDetailDB);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(200);
    });

    test('Status 500: Error while updating admin order record', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(500);
    });
  });
});
