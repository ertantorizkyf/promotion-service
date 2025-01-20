const Request = require('supertest');

const { sequelize } = require('../configs/dbConfig');
const app = require('../index');
const { Menu, Order, OrderItem, Promotion, PromotionCity } = require('../models/index');
const promotionRepository = require('../repositories/promotionRepository');
const menuDetailDB = require('./mocks/menuDetailDB.json');
const orderListDB = require('./mocks/orderListDB.json');
const orderDetailDB = require('./mocks/orderDetailDB.json');
const orderItemListDB = require('./mocks/orderItemListDB.json');
const orderItemDetailDB = require('./mocks/orderItemDetailDB.json');
const promotionDetailDB = require('./mocks/promotionDetailDB.json');
const promotionListDB = require('./mocks/promotionListDB.json');
const promotionCityListDB = require('./mocks/promotionCityListDB.json');
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

module.exports.promotionDescribe = () => describe('Promotion Routes', () => {
  describe('GET - Admin Promotion List', () => {
    beforeEach(() => {
      endpoint = '/admin/promotions';

      header = {
        Authorization: jwtMock.admin
      };
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    test('Status 200: Successfully fetched admin promotion list without query', async () => {
      findAllSpy = jest.spyOn(Promotion, 'findAll');
      findAllSpy.mockResolvedValueOnce(promotionListDB);
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(200)
        .then((res) => {
          expect(res.body.data.length).toBe(2);
        });
    });

    test('Status 200: Successfully fetched admin promotion list with valid query', async () => {
      findAllSpy = jest.spyOn(Promotion, 'findAll');
      findAllSpy.mockResolvedValueOnce(promotionListDB);
  
      await Request(app)
        .get(`${endpoint}?order_by=id`)
        .set(header)
        .expect(200)
        .then((res) => {
          expect(res.body.data.length).toBe(2);
        });
    });

    test('Status 400: Error while fetching admin promotion list with invalid query', async () => {
      await Request(app)
        .get(`${endpoint}?order_by=ide`)
        .set(header)
        .expect(400);
    });

    test('Status 500: Error while fetching admin promotion records', async () => {
      findAllSpy = jest.spyOn(Promotion, 'findAll');
      findAllSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(500);
    });
  });

  describe('POST - Admin Create New Promotion', () => {
    beforeEach(() => {
      endpoint = '/admin/promotions';

      header = {
        Authorization: jwtMock.admin
      };

      payload = {
        name: 'Promotion A',
        code: 'PROMOA',
        description: 'Lorem ipsum',
        type: 'fixed_cut',
        target_user: 'specific_city',
        discount_amount: 10000,
        max_discount_amount: null,
        min_order_amount: 0,
        start_date: '2025-01-01',
        end_date: '2025-12-01',
        max_redemptions: 100,
        max_redemptions_per_user: 1,
        promotion_cities: [
          {
            city_id: 1
          }
        ]
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
  
    test('Status 201: Successfully created new admin promotion record', async () => {
      createSpy = jest.spyOn(Promotion, 'create');
      createSpy.mockResolvedValueOnce(promotionDetailDB);
      createSpy = jest.spyOn(PromotionCity, 'bulkCreate');
      createSpy.mockResolvedValueOnce(promotionCityListDB);
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(201);
    });

    test('Status 400: Invalid payload', async () => {
      await Request(app)
        .post(endpoint)
        .set(header)
        .expect(400);
    });

    test('Status 500: Error while fetching admin promotion records', async () => {
      createSpy = jest.spyOn(Promotion, 'create');
      createSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .post(endpoint)
        .set(header)
        .send(payload)
        .expect(500);
    });
  });

  describe('PUT - Admin Update Promotion', () => {
    beforeEach(() => {
      endpoint = '/admin/promotions/1';

      header = {
        Authorization: jwtMock.admin
      };

      payload = {
        name: 'Promotion A',
        code: 'PROMOA',
        description: 'Lorem ipsum',
        type: 'fixed_cut',
        target_user: 'specific_city',
        discount_amount: 10000,
        max_discount_amount: null,
        min_order_amount: 11,
        start_date: '2025-01-01',
        end_date: '2025-12-01',
        max_redemptions: 100,
        max_redemptions_per_user: 1,
        promotion_cities: [
          {
            city_id: 1
          }
        ]
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
  
    test('Status 200: Successfully updated admin promotion record', async () => {
      findOneSpy = jest.spyOn(Promotion, 'findOne');
      findOneSpy.mockResolvedValueOnce(promotionDetailDB);
      updateSpy = jest.spyOn(Promotion, 'update');
      updateSpy.mockResolvedValueOnce(1);
      destroySpy = jest.spyOn(PromotionCity, 'destroy');
      destroySpy.mockResolvedValueOnce(1);
      createSpy = jest.spyOn(PromotionCity, 'bulkCreate');
      createSpy.mockResolvedValueOnce(promotionCityListDB);
      findAllSpy = jest.spyOn(Order, 'findAll');
      const manipulatedOrderList = JSON.parse(JSON.stringify(orderListDB));
      manipulatedOrderList.map((order) => order.status = ORDER_STATUS_CONSTANT.DRAFT);
      manipulatedOrderList[0].order_amount = 10;
      findAllSpy.mockResolvedValueOnce(manipulatedOrderList);
  
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(200);
    });

    test('Status 200: Successfully updated admin percentage promotion record', async () => {
      const percentagePayload = JSON.parse(JSON.stringify(payload));
      percentagePayload.type = 'percentage';
      percentagePayload.discount_amount = 10;
      percentagePayload.max_discount_amount = 1000;

      findOneSpy = jest.spyOn(Promotion, 'findOne');
      findOneSpy.mockResolvedValueOnce(promotionDetailDB);
      updateSpy = jest.spyOn(Promotion, 'update');
      updateSpy.mockResolvedValueOnce(1);
      destroySpy = jest.spyOn(PromotionCity, 'destroy');
      destroySpy.mockResolvedValueOnce(1);
      createSpy = jest.spyOn(PromotionCity, 'bulkCreate');
      createSpy.mockResolvedValueOnce(promotionCityListDB);
      findAllSpy = jest.spyOn(Order, 'findAll');
      const manipulatedOrderList = JSON.parse(JSON.stringify(orderListDB));
      manipulatedOrderList.map((order) => order.status = ORDER_STATUS_CONSTANT.DRAFT);
      manipulatedOrderList[0].order_amount = 10;
      findAllSpy.mockResolvedValueOnce(manipulatedOrderList);
  
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(percentagePayload)
        .expect(200);
    });

    test('Status 400: Invalid payload', async () => {
      await Request(app)
        .put(endpoint)
        .set(header)
        .expect(400);
    });

    test('Status 500: Error while updating admin promotion record', async () => {
      findOneSpy = jest.spyOn(Promotion, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(500);
    });
  });

  describe('DELETE - Admin Delete Promotion', () => {
    beforeEach(() => {
      endpoint = '/admin/promotions/1';

      header = {
        Authorization: jwtMock.admin
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
  
    test('Status 200: Successfully deleted admin promotion record', async () => {
      findOneSpy = jest.spyOn(Promotion, 'findOne');
      findOneSpy.mockResolvedValueOnce(promotionDetailDB);
      findAllSpy = jest.spyOn(Order, 'findAll');
      findAllSpy.mockResolvedValueOnce([]);
      destroySpy = jest.spyOn(PromotionCity, 'destroy');
      destroySpy.mockResolvedValueOnce(1);
      destroySpy = jest.spyOn(Promotion, 'destroy');
      destroySpy.mockResolvedValueOnce(1);
      findAllSpy = jest.spyOn(Order, 'findAll');
      const manipulatedOrderList = JSON.parse(JSON.stringify(orderListDB));
      manipulatedOrderList.map((order) => order.status = ORDER_STATUS_CONSTANT.DRAFT);
      manipulatedOrderList[0].order_amount = 10;
      findAllSpy.mockResolvedValueOnce(manipulatedOrderList);
  
      await Request(app)
        .delete(endpoint)
        .set(header)
        .expect(200);
    });

    test('Status 400: Record in use', async () => {
      findOneSpy = jest.spyOn(Promotion, 'findOne');
      findOneSpy.mockResolvedValueOnce(promotionDetailDB);
      findAllSpy = jest.spyOn(Order, 'findAll');
      findAllSpy.mockResolvedValueOnce(orderItemListDB);
  
      await Request(app)
        .delete(endpoint)
        .set(header)
        .expect(400);
    });

    test('Status 500: Error while deleting admin promotion record', async () => {
      findOneSpy = jest.spyOn(Promotion, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .put(endpoint)
        .set(header)
        .send(payload)
        .expect(500);
    });
  });

  describe('GET - Get Customer Eligible Promotion List', () => {
    beforeEach(() => {
      endpoint = '/promotions/eligible';

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
  
    test('Status 200: Successfully fetched eligible promotion list without query', async () => {
      findAllSpy = jest.spyOn(promotionRepository, 'getEligiblePromotions');
      findAllSpy.mockResolvedValueOnce(promotionListDB);
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(200)
        .then((res) => {
          expect(res.body.data.length).toBe(2);
        });
    });

    test('Status 500: Error while updating task order record', async () => {
      findAllSpy = jest.spyOn(promotionRepository, 'getEligiblePromotions');
      findAllSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(500);
    });
  });

  describe('GET - Redeem Promotion', () => {
    beforeEach(() => {
      endpoint = '/promotions/redemption';

      header = {
        Authorization: jwtMock.customer
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
  
    test('Status 200: Successfully applied promotion', async () => {
      findOneSpy = jest.spyOn(promotionRepository, 'getPromotionByCode');
      const fixedCutPromotion = JSON.parse(JSON.stringify(promotionDetailDB));
      fixedCutPromotion.max_redemptions = 1000;
      fixedCutPromotion.max_redemptions_per_user = 1000;
      findOneSpy.mockResolvedValueOnce(fixedCutPromotion);
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockResolvedValueOnce(orderDetailDB);
      countSpy = jest.spyOn(promotionRepository, 'getPromotionRedemptionCount');
      countSpy.mockResolvedValueOnce(1);
      countSpy = jest.spyOn(promotionRepository, 'getPromotionRedemptionCountByUserID');
      countSpy.mockResolvedValueOnce(1);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .get(`${endpoint}?code=ABC`)
        .set(header)
        .expect(200);
    });

    test('Status 200: Successfully applied percentage promotion', async () => {
      findOneSpy = jest.spyOn(promotionRepository, 'getPromotionByCode');
      const percentagePromotion = JSON.parse(JSON.stringify(promotionDetailDB));
      percentagePromotion.type = PROMOTION_TYPE_CONSTANT.PERCENTAGE;
      percentagePromotion.discount_amount = 10;
      percentagePromotion.max_discount_amount = 100;
      percentagePromotion.max_redemptions = 1000;
      percentagePromotion.max_redemptions_per_user = 1000;
      findOneSpy.mockResolvedValueOnce(percentagePromotion);
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockResolvedValueOnce(orderDetailDB);
      countSpy = jest.spyOn(promotionRepository, 'getPromotionRedemptionCount');
      countSpy.mockResolvedValueOnce(1);
      countSpy = jest.spyOn(promotionRepository, 'getPromotionRedemptionCountByUserID');
      countSpy.mockResolvedValueOnce(1);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .get(`${endpoint}?code=ABC`)
        .set(header)
        .expect(200);
    });

    test('Status 400: Note eligible', async () => {
      findOneSpy = jest.spyOn(promotionRepository, 'getPromotionByCode');
      findOneSpy.mockResolvedValueOnce(promotionDetailDB);
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockResolvedValueOnce(orderDetailDB);
      countSpy = jest.spyOn(promotionRepository, 'getPromotionRedemptionCount');
      countSpy.mockResolvedValueOnce(100);
      countSpy = jest.spyOn(promotionRepository, 'getPromotionRedemptionCountByUserID');
      countSpy.mockResolvedValueOnce(100);
      
      await Request(app)
        .get(`${endpoint}?code=ABC`)
        .set(header)
        .expect(400);
    });

    test('Status 400: Invalid query', async () => {
      await Request(app)
        .get(endpoint)
        .set(header)
        .expect(400);
    });

    test('Status 500: Error while applying promotion', async () => {
      findOneSpy = jest.spyOn(promotionRepository, 'getPromotionByCode');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(`${endpoint}?code=ABC`)
        .set(header)
        .expect(500);
    });
  });

  describe('DELETE - Revoke Promotion Redemption', () => {
    beforeEach(() => {
      endpoint = '/promotions/redemption';

      header = {
        Authorization: jwtMock.customer
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
  
    test('Status 200: Successfully revoked promotion', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockResolvedValueOnce(orderDetailDB);
      updateSpy = jest.spyOn(Order, 'update');
      updateSpy.mockResolvedValueOnce(1);
  
      await Request(app)
        .delete(endpoint)
        .set(header)
        .expect(200);
    });

    test('Status 500: Error while revoking promotion', async () => {
      findOneSpy = jest.spyOn(Order, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .delete(endpoint)
        .set(header)
        .expect(500);
    });
  });
});
