const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', accountController.getAccounts);
router.post('/', accountController.createAccount);
router.get('/:id', accountController.getAccountById);
router.patch('/:id', accountController.updateAccount);
router.patch('/:id/archive', accountController.archiveAccount);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
