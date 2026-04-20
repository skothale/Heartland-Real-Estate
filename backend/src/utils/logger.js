const winston = require('winston');

const level = process.env.LOG_LEVEL || 'info';

function formatMeta(info) {
  const skip = new Set(['level', 'message', 'timestamp', 'stack']);
  const meta = {};

  for (const [key, value] of Object.entries(info)) {
    if (skip.has(key)) continue;
    if (typeof key !== 'string') continue;
    if (key === 'splat') continue;
    meta[key] = value;
  }

  return Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
}

const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      const metaStr = formatMeta(info);
      if (info.stack) {
        return `${info.timestamp} [${info.level}] ${info.message}${metaStr}\n${info.stack}`;
      }
      return `${info.timestamp} [${info.level}] ${info.message}${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
