const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/chat', aiController.askAssistant);
router.get('/insights', aiController.getInsights);

module.exports = router;
