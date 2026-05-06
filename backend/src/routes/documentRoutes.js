const express = require('express');

const documentController = require('../controllers/documentController');
const uploadPdf = require('../middleware/uploadPdf');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/', documentController.listDocuments);
router.post('/', uploadPdf.single('file'), documentController.uploadDocument);
router.get('/:id/file', documentController.getDocumentFile);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
