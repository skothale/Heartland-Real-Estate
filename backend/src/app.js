const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const morgan = require('morgan');

const documentRoutes = require('./routes/documentRoutes');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  morgan('combined', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
    skip: (req) => req.path === '/health',
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/upload', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});

app.use('/api/documents', documentRoutes);

app.use((err, req, res, _next) => {
  logger.error(`${req.method} ${req.originalUrl}`, {
    error: err.message,
    stack: err.stack,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
