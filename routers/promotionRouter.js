const Router = require('express').Router();

const promotionController = require('../controllers/promotionController');
const authMiddleware = require('../middlewares/authMiddleware');

Router.get('/eligible', authMiddleware.authenticateToken, promotionController.getEligiblePromotions);
Router.get('/redemption', authMiddleware.authenticateToken, promotionController.redeemPromotion);
Router.delete('/redemption', authMiddleware.authenticateToken, promotionController.revokePromotionRedemption);

// ADMIN ONLY ROUTES
Router.get('', authMiddleware.authenticateAdminToken, promotionController.getPromotions);
Router.post('', authMiddleware.authenticateAdminToken, promotionController.createPromotion);
Router.put('/:id', authMiddleware.authenticateAdminToken, promotionController.updatePromotion);
Router.delete('/:id', authMiddleware.authenticateAdminToken, promotionController.deletePromotion);

module.exports = Router;