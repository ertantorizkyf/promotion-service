const Router = require('express').Router();

const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

Router.post('/item', authMiddleware.authenticateToken, orderController.upsertItem);
Router.delete('/item', authMiddleware.authenticateToken, orderController.deleteItem);
Router.get('/histories', authMiddleware.authenticateToken, orderController.getMyOrderHistories);
Router.get('/draft', authMiddleware.authenticateToken, orderController.getMyCurrentDraftOrder);
Router.get('/draft/submission', authMiddleware.authenticateToken, orderController.submitDraftOrder);

// TASK ONLY ROUTES
Router.get('/:id/tasks/status', authMiddleware.authenticateStaticToken, orderController.taskUpdateOrderStatus);

// ADMIN ONLY ROUTES
Router.put('/:id/status', authMiddleware.authenticateAdminToken, orderController.adminUpdateOrderStatus);

module.exports = Router;