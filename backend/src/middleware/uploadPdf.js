const path = require('path');
const multer = require('multer');

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
  storage: multer.memoryStorage(),
  fileFilter: pdfFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
