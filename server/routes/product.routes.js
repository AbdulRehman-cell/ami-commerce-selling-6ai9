const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');

const router = express.Router();

// Inline Admin Middleware (required ONLY for PUT and DELETE routes)
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

  try {
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

// GET /api/products (PUBLIC)
// Returns a plain JSON array of products (never wrapped in paginated object)
router.get('/', async (req, res, next) => {
  try {
    const { category, brand, skillLevel, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (brand && brand !== 'All') {
      filter.brand = brand;
    }
    if (skillLevel && skillLevel !== 'All') {
      filter.skillLevel = skillLevel;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id (PUBLIC)
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products (PUBLIC - allowed for creation)
router.post('/', async (req, res, next) => {
  try {
    const { name, category, brand, price, stock, images, description, skillLevel, sizes } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: 'Name, category, and price are required fields' });
    }

    // Ensure images is stored properly as an array or array-based input
    let formattedImages = [];
    if (Array.isArray(images)) {
      formattedImages = images;
    } else if (typeof images === 'string' && images.trim() !== '') {
      formattedImages = [images.trim()];
    }

    // Ensure sizes is stored properly as an array
    let formattedSizes;
    if (Array.isArray(sizes)) {
      formattedSizes = sizes;
    } else if (typeof sizes === 'string' && sizes.trim() !== '') {
      formattedSizes = [sizes.trim()];
    } else {
      formattedSizes = ['Standard'];
    }

    const product = new Product({
      name,
      category,
      brand: brand || 'AMI Sports',
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 10,
      images: formattedImages,
      description: description || '',
      skillLevel: skillLevel || 'All Levels',
      sizes: formattedSizes
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// PUT /api/products/:id (Protected: requireAdmin)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, category, brand, price, stock, images, description, skillLevel, sizes } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (description !== undefined) updateData.description = description;
    if (skillLevel !== undefined) updateData.skillLevel = skillLevel;

    if (sizes !== undefined) {
      if (Array.isArray(sizes)) {
        updateData.sizes = sizes;
      } else if (typeof sizes === 'string') {
        updateData.sizes = sizes.trim() !== '' ? [sizes.trim()] : [];
      }
    }

    if (images !== undefined) {
      if (Array.isArray(images)) {
        updateData.images = images;
      } else if (typeof images === 'string') {
        updateData.images = images.trim() !== '' ? [images.trim()] : [];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// DELETE /api/products/:id (Protected: requireAdmin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;