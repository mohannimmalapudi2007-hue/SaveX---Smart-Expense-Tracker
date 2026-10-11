const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', budgetController.getBudgets);
router.post('/', budgetController.createBudget);
router.get('/alerts', budgetController.checkBudgetAlerts);
router.patch('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
