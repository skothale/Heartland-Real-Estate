const bcrypt = require('bcryptjs');

const User = require('../models/User');

const SALT_ROUNDS = 10;

async function updateMe(req, res, next) {
  try {
    const name = String(req.body.name ?? '').trim();
    if (name.length > 80) {
      return res.status(400).json({ message: 'Name must be 80 characters or less' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { name } },
      { new: true }
    ).select('name email role');

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

async function changeMyPassword(req, res, next) {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.userId).select('passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  updateMe,
  changeMyPassword,
};

