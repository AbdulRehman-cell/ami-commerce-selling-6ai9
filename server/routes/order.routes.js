const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');

const router = express.Router();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Helper middleware for admin auth on PUT and DELETE routes
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// GET /api/orders - PUBLIC
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const filter = {};
    if (userId) {
      filter.userId = userId;
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - PUBLIC
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - PUBLIC
router.post('/', async (req, res, next) => {
  try {
    const { userId, items, totalAmount, shippingAddress, status, paymentId } = req.body;

    if (!items) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    if (totalAmount === undefined || totalAmount === null || typeof totalAmount !== 'number' || totalAmount < 0) {
      return res.status(400).json({ error: 'Valid total amount is required' });
    }

    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    const parsedShippingAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : (shippingAddress || {});

    const newOrder = new Order({
      userId: userId || 'guest',
      items: parsedItems,
      totalAmount,
      shippingAddress: parsedShippingAddress,
      status: status || 'processing',
      paymentId: paymentId || undefined,
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// PUT /api/orders/:id - Protected (requireAdmin)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { userId, items, totalAmount, shippingAddress, status, paymentId } = req.body;
    const updateData = {};

    if (userId !== undefined) updateData.userId = userId;
    if (items !== undefined) updateData.items = typeof items === 'string' ? JSON.parse(items) : items;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (shippingAddress !== undefined) updateData.shippingAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
    if (status !== undefined) updateData.status = status;
    if (paymentId !== undefined) updateData.paymentId = paymentId;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/orders/:id - Protected (requireAdmin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;