const express = require('express');

const documentController = require('../controllers/documentController');
const uploadPdf = require('../middleware/uploadPdf');

const router = express.Router();

router.get('/', documentController.listDocuments);
router.post('/', uploadPdf.single('file'), documentController.uploadDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
