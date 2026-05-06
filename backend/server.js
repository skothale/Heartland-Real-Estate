require('dotenv').config();

const mongoose = require('mongoose');

const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/heartland';

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        logger.error(
          'JWT_SECRET is not set. Set it before running in production.'
        );
        process.exit(1);
      }
      process.env.JWT_SECRET = 'heartland-dev-only-change-for-production';
      logger.warn(
        'JWT_SECRET not set; using insecure development default. Add JWT_SECRET to your .env file.'
      );
    }

    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    app.listen(PORT, () => {
      logger.info(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
}

start();
