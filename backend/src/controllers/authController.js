const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

function signToken(userId) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function signup(req, res, next) {
  try {
    getJwtSecret();
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({ message: 'Server misconfiguration' });
  }

  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
    }

    const adminExists = await User.exists({ role: 'admin' });
    const hasUsers = (await User.countDocuments()) > 0;
    if (hasUsers && !adminExists) {
      return res.status(403).json({
        message:
          'No administrator is assigned in the database yet. Set role to "admin" on one user, then use Team to create agents.',
      });
    }
    if (adminExists) {
      return res.status(403).json({
        message:
          'Self-service registration is closed. Ask your administrator to create an agent account for you.',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: String(req.body.name || '').trim(),
      email,
      passwordHash,
      role: 'admin',
      adminId: null,
    });
    const token = signToken(user._id.toString());

    logger.info('Admin registered (first account)', {
      userId: user._id.toString(),
      email,
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name || '',
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists' });
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    getJwtSecret();
  } catch (err) {
    logger.error(err.message);
    return res.status(500).json({ message: 'Server misconfiguration' });
  }

  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id.toString());
    logger.info('User logged in', { userId: user._id.toString(), email });

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name || '',
        email: user.email,
        role: user.role || 'agent',
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId)
      .select('name email role adminId')
      .lean();
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name || '',
        email: user.email,
        role: user.role || 'agent',
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  signup,
  login,
  me,
};
