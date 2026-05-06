const path = require('path');
const mongoose = require('mongoose');

const User = require('../models/User');
const Document = require('../models/Document');
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

    let filter;
    if (req.userRole === 'agent') {
      filter = { owner: req.userId };
    } else {
      const agentIdParam = String(req.query.agentId || '').trim();
      if (agentIdParam) {
        const agentOk = await User.exists({
          _id: agentIdParam,
          adminId: req.userId,
          role: 'agent',
        });
        if (!agentOk) {
          return res.status(400).json({ message: 'Invalid or unknown agent' });
        }
        filter = { owner: agentIdParam };
      } else {
        const agents = await User.find({ adminId: req.userId, role: 'agent' })
          .select('_id')
          .lean();
        const ownerIds = agents.map((a) => a._id);
        ownerIds.push(new mongoose.Types.ObjectId(req.userId));
        filter = { owner: { $in: ownerIds } };
      }
    }

    const result = await documentService.listDocuments(filter, {
      limit,
      skip,
    });
    logger.debug('Documents listed', {
      total: result.total,
      returned: result.items.length,
      limit,
      skip,
      role: req.userRole,
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
    payload.mimeType = 'application/pdf';
    payload.fileSize = req.file.size;
    payload.fileData = req.file.buffer;
    if (!payload.title) {
      payload.title =
        path.parse(req.file.originalname || '').name || 'Document';
    }

    payload.owner = req.userId;
    const doc = await documentService.createDocument(payload);
    logger.info('Document uploaded', {
      id: doc.id,
      title: doc.title,
      fileName: doc.fileName,
    });
    return res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
}

async function getDocumentFile(req, res, next) {
  try {
    let filter;
    if (req.userRole === 'agent') {
      filter = { _id: req.params.id, owner: req.userId };
    } else {
      const agents = await User.find({ adminId: req.userId, role: 'agent' })
        .select('_id')
        .lean();
      const allowedOwners = agents.map((a) => a._id);
      allowedOwners.push(new mongoose.Types.ObjectId(req.userId));
      filter = { _id: req.params.id, owner: { $in: allowedOwners } };
    }

    const doc = await Document.findOne(filter).select(
      '+fileData mimeType fileName title'
    );
    if (!doc || !doc.fileData) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filename = doc.fileName || `${doc.title || 'document'}.pdf`;
    res.setHeader('Content-Type', doc.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=\"${filename}\"`);
    return res.send(Buffer.isBuffer(doc.fileData) ? doc.fileData : Buffer.from(doc.fileData));
  } catch (err) {
    return next(err);
  }
}

async function deleteDocument(req, res, next) {
  try {
    let filter;
    if (req.userRole === 'agent') {
      filter = { _id: req.params.id, owner: req.userId };
    } else {
      const agents = await User.find({ adminId: req.userId, role: 'agent' })
        .select('_id')
        .lean();
      const allowedOwners = agents.map((a) => a._id);
      allowedOwners.push(new mongoose.Types.ObjectId(req.userId));
      filter = { _id: req.params.id, owner: { $in: allowedOwners } };
    }

    const doc = await documentService.deleteDocument(filter);
    if (!doc) {
      logger.warn('Document not found for delete', { id: req.params.id });
      return res.status(404).json({ message: 'Document not found' });
    }
    logger.info('Document deleted', { id: doc.id });
    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listDocuments,
  uploadDocument,
  getDocumentFile,
  deleteDocument,
};
