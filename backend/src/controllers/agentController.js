const bcrypt = require('bcryptjs');

const User = require('../models/User');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function listAgents(req, res, next) {
  try {
    const items = await User.find({
      adminId: req.userId,
      role: 'agent',
    })
      .select('name email createdAt')
      .sort({ email: 1 })
      .lean();

    return res.json({
      items: items.map((u) => ({
        id: u._id.toString(),
        name: u.name || '',
        email: u.email,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
}

async function createAgent(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length > 80) {
      return res.status(400).json({ message: 'Name must be 80 characters or less' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const agent = await User.create({
      name,
      email,
      passwordHash,
      role: 'agent',
      adminId: req.userId,
    });

    logger.info('Agent created', {
      adminId: req.userId,
      agentId: agent._id.toString(),
      email,
    });

    return res.status(201).json({
      agent: {
        id: agent._id.toString(),
        name: agent.name || '',
        email: agent.email,
        createdAt: agent.createdAt,
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

module.exports = {
  listAgents,
  createAgent,
};
