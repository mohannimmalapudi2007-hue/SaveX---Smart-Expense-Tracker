const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/export-data', userController.exportAllUserData);
router.post('/delete-account', userController.deleteAccount);

module.exports = router;
