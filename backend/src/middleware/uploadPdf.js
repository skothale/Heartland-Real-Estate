const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const pdfDir = path.join(__dirname, '../pdfs');

fs.mkdirSync(pdfDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, pdfDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const suffix = ext === '.pdf' ? ext : '.pdf';
    cb(null, `${crypto.randomUUID()}${suffix}`);
  },
});

function pdfFileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimeOk =
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/x-pdf';
  const extOk = ext === '.pdf';

  if (mimeOk || extOk) {
    return cb(null, true);
  }

  return cb(new Error('Only PDF files are allowed'));
}

module.exports = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
