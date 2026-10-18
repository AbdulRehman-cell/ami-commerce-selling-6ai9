const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline requireAdmin middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// GET / - PUBLIC (List all users)
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-hashedPassword');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /:id - PUBLIC (Get user by ID)
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-hashedPassword');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST / - PUBLIC (Create new user / Register / Admin creation)
router.post('/', async (req, res, next) => {
  try {
    const { name, email, hashedPassword, password, role, addresses } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Accept either hashedPassword or plain password field for flexibility
    const pwdToSave = hashedPassword || password || '';
    if (!pwdToSave) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      hashedPassword: pwdToSave,
      role: role === 'admin' ? 'admin' : 'user',
      addresses: addresses || []
    });

    const savedUser = await user.save();
    const userResponse = savedUser.toObject();
    delete userResponse.hashedPassword;

    res.status(201).json(userResponse);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// PUT /:id - requireAdmin only
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, email, hashedPassword, role, addresses } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (hashedPassword !== undefined) updateData.hashedPassword = hashedPassword;
    if (role !== undefined) updateData.role = role;
    if (addresses !== undefined) updateData.addresses = addresses;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-hashedPassword');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// DELETE /:id - requireAdmin only
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;