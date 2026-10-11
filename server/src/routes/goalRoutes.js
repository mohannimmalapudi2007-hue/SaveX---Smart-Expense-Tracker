const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.get('/:id', goalController.getGoalById);
router.patch('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.post('/:id/contributions', goalController.addContribution);
router.post('/:id/withdraw', goalController.withdrawFromGoal);

module.exports = router;
