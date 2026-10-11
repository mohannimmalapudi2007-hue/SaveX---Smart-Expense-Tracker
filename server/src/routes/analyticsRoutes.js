const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/summary', analyticsController.getSummary);
router.get('/cash-flow', analyticsController.getCashFlow);
router.get('/categories', analyticsController.getCategories);
router.get('/trends', analyticsController.getTrends);

module.exports = router;
