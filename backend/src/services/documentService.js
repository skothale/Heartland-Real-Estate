const path = require('path');
const fs = require('fs/promises');

const Document = require('../models/Document');
const logger = require('../utils/logger');

async function createDocument(data) {
  return Document.create(data);
}

async function listDocuments(filter = {}, options = {}) {
  const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

  const [items, total] = await Promise.all([
    Document.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Document.countDocuments(filter),
  ]);

  return { items, total };
}

async function deleteDocument(id) {
  const doc = await Document.findByIdAndDelete(id);

  if (doc?.filePath) {
    const absolutePath = path.join(process.cwd(), 'src', doc.filePath);
    await fs.unlink(absolutePath).catch((err) => {
      logger.warn('Could not delete PDF from disk', {
        filePath: doc.filePath,
        error: err.message,
      });
    });
  }

  return doc;
}

module.exports = {
  createDocument,
  listDocuments,
  deleteDocument,
};
