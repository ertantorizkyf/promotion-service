const Request = require('supertest');

const { sequelize } = require('../configs/dbConfig');
const app = require('../index');
const { User } = require('../models/index');
const encryptionHelper = require('../helpers/encryptionHelper');
const userDetailDB = require('./mocks/userDetailDB.json');

let endpoint;
let findOneSpy;
let createSpy;
let payload;
let transactionSpy;
let encryptionHelperSpy;

module.exports.userDescribe = () => describe('User Routes', () => {
  describe('POST - Register', () => {
    beforeEach(() => {
      endpoint = '/users/register';
      payload = {
        name: 'Customer',
        email: 'customer@mail.com',
        password: 'customer123',
        address: 'Some long address detail',
        city_id: 1
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
  
    test('Status 200: Successfully registered', async () => {
      findOneSpy = jest.spyOn(User, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);
      createSpy = jest.spyOn(User, 'create');
      createSpy.mockResolvedValueOnce(userDetailDB);

      await Request(app)
        .post(endpoint)
        .send(payload)
        .expect(200);
    });

    test('Status 409: Conflict', async () => {
      findOneSpy = jest.spyOn(User, 'findOne');
      findOneSpy.mockResolvedValueOnce(userDetailDB);
      createSpy = jest.spyOn(User, 'create');
      createSpy.mockResolvedValueOnce(userDetailDB);

      await Request(app)
        .post(endpoint)
        .send(payload)
        .expect(409);
    });

    test('Status 400: Invalid payload', async () => {
      await Request(app)
        .post(endpoint)
        .send(null)
        .expect(400);
    });
  
    test('Status 500: Error while fetching existing record', async () => {
      findOneSpy = jest.spyOn(User, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .post(endpoint)
        .send(payload)
        .expect(500);
    });
  });

  describe('POST - Login', () => {
    beforeEach(() => {
      endpoint = '/users/login';
      payload = {
        email: 'customer@mail.com',
        password: 'customer123'
      };

      transactionSpy = jest.spyOn(sequelize, 'transaction');
      transactionSpy.mockImplementation(() => ({
        commit: jest.fn().mockResolvedValue('commit successful'),
        rollback: jest.fn().mockResolvedValue('rollback successful')
      }));

      encryptionHelperSpy = jest.spyOn(encryptionHelper, 'validatePassword');
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    test('Status 200: Successfully logged in', async () => {
      findOneSpy = jest.spyOn(User, 'findOne');
      findOneSpy.mockResolvedValueOnce(userDetailDB);

      encryptionHelperSpy.mockResolvedValue(true);

      await Request(app)
        .post(endpoint)
        .send(payload)
        .expect(200);
    });

    test('Status 400: Invalid credentials', async () => {
      findOneSpy = jest.spyOn(User, 'findOne');
      findOneSpy.mockResolvedValueOnce(userDetailDB);

      encryptionHelperSpy.mockResolvedValue(false);

      await Request(app)
        .post(endpoint)
        .send(payload)
        .expect(400);
    });

    test('Status 404: Record not found', async () => {
      findOneSpy = jest.spyOn(User, 'findOne');
      findOneSpy.mockResolvedValueOnce(null);

      await Request(app)
        .post(endpoint)
        .send(payload)
        .expect(404);
    });

    test('Status 400: Invalid payload', async () => {
      await Request(app)
        .post(endpoint)
        .send(null)
        .expect(400);
    });
  
    test('Status 500: Error while fetching existing record', async () => {
      findOneSpy = jest.spyOn(User, 'findOne');
      findOneSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .post(endpoint)
        .send(payload)
        .expect(500);
    });
  });
});