const Router = require('express').Router();

const cityController = require('../controllers/cityController');

Router.get('', cityController.getCities);

module.exports = Router;