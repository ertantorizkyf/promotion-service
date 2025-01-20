const Request = require('supertest');

const app = require('../index');
const { City } = require('../models/index');
const cityListDB = require('./mocks/cityListDB.json');

let endpoint;
let findAllSpy;

module.exports.cityDescribe = () => describe('City Routes', () => {
  describe('GET - Get City List', () => {
    beforeEach(() => {
      endpoint = '/cities';
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    test('Status 200: Successfully fetched city records', async () => {
      findAllSpy = jest.spyOn(City, 'findAll');
      findAllSpy.mockResolvedValueOnce(cityListDB);
  
      await Request(app)
        .get(endpoint)
        .expect(200)
        .then((res) => {
          expect(res.body.data.length).toBe(3);
        });
    });
  
    test('Status 500: Error while city records', async () => {
      findAllSpy = jest.spyOn(City, 'findAll');
      findAllSpy.mockRejectedValueOnce(new Error());
  
      await Request(app)
        .get(endpoint)
        .expect(500);
    });
  });  
});
