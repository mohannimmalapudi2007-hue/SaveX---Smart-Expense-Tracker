const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', recurringController.getRecurringTransactions);
router.post('/', recurringController.createRecurringTransaction);
router.get('/upcoming', recurringController.getUpcomingBills);
router.patch('/:id', recurringController.updateRecurringTransaction);
router.patch('/:id/pause', recurringController.togglePauseRecurring);
router.post('/:id/process', recurringController.processOccurrence);
router.delete('/:id', recurringController.deleteRecurringTransaction);

module.exports = router;
