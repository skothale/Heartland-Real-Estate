const fs = require('fs/promises');
const path = require('path');

const documentService = require('../services/documentService');
const logger = require('../utils/logger');

const UPLOAD_BODY_FIELDS = ['title', 'description', 'status', 'metadata'];

function pickAllowedBody(body, allowedKeys) {
  const out = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
}

async function listDocuments(req, res, next) {
  try {
    const limitRaw = parseInt(req.query.limit, 10);
    const skipRaw = parseInt(req.query.skip, 10);
    const limit = Math.min(
      Math.max(Number.isNaN(limitRaw) ? 50 : limitRaw, 1),
      100
    );
    const skip = Math.max(Number.isNaN(skipRaw) ? 0 : skipRaw, 0);

    const result = await documentService.listDocuments({}, { limit, skip });
    logger.debug('Documents listed', {
      total: result.total,
      returned: result.items.length,
      limit,
      skip,
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'PDF file is required (multipart field name: file).',
      });
    }

    const payload = pickAllowedBody(req.body, UPLOAD_BODY_FIELDS);
    payload.fileName = req.file.originalname;
    payload.filePath = path
      .join('pdfs', req.file.filename)
      .replace(/\\/g, '/');
    payload.mimeType = 'application/pdf';
    payload.fileSize = req.file.size;
    if (!payload.title) {
      payload.title =
        path.parse(req.file.originalname || '').name || 'Document';
    }

    const doc = await documentService.createDocument(payload);
    logger.info('Document uploaded', {
      id: doc.id,
      title: doc.title,
      fileName: doc.fileName,
      filePath: doc.filePath,
    });
    return res.status(201).json(doc);
  } catch (err) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch((unlinkErr) => {
        logger.warn('Failed to remove uploaded file after error', {
          path: req.file.path,
          error: unlinkErr.message,
        });
      });
    }
    return next(err);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const doc = await documentService.deleteDocument(req.params.id);
    if (!doc) {
      logger.warn('Document not found for delete', { id: req.params.id });
      return res.status(404).json({ message: 'Document not found' });
    }
    logger.info('Document deleted', { id: doc.id, filePath: doc.filePath });
    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listDocuments,
  uploadDocument,
  deleteDocument,
};
