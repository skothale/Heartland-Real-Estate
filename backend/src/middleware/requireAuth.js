const jwt = require('jsonwebtoken');

const User = require('../models/User');
const logger = require('../utils/logger');

async function requireAuth(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not configured');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const header = req.headers.authorization || '';
    const match = /^Bearer\s+(.+)$/i.exec(header);
    if (!match) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    let payload;
    try {
      payload = jwt.verify(match[1], secret);
    } catch (err) {
      logger.debug('JWT verification failed', { error: err.message });
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const sub = payload.sub;
    if (!sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(sub).select('role email name adminId').lean();
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = user._id.toString();
    req.userRole = user.role || 'agent';
    req.userEmail = user.email;
    req.userName = user.name || '';
    req.userAdminId = user.adminId ? user.adminId.toString() : null;

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = requireAuth;
