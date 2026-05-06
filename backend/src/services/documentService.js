const Document = require('../models/Document');

async function createDocument(data) {
  return Document.create(data);
}

async function listDocuments(filter = {}, options = {}) {
  const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

  const [items, total] = await Promise.all([
    Document.find(filter)
      .select('-fileData')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Document.countDocuments(filter),
  ]);

  return { items, total };
}

async function deleteDocument(filter) {
  const doc = await Document.findOneAndDelete(filter);

  return doc;
}

module.exports = {
  createDocument,
  listDocuments,
  deleteDocument,
};
