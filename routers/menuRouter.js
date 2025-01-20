const Router = require('express').Router();

const menuController = require('../controllers/menuController');
const authMiddleware = require('../middlewares/authMiddleware');

Router.get('', authMiddleware.authenticateToken, menuController.getMenus);

// ADMIN ONLY ROUTES
Router.post('', authMiddleware.authenticateAdminToken, menuController.createMenu);
Router.put('/:id', authMiddleware.authenticateAdminToken, menuController.updateMenu);

module.exports = Router;