const express = require('express');
const router = express.Router();
const importExportController = require('../controllers/importExportController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/import/preview', importExportController.upload.single('file'), importExportController.previewCsv);
router.post('/import/confirm', importExportController.confirmImport);
router.get('/export/transactions', importExportController.exportTransactionsCsv);

module.exports = router;
