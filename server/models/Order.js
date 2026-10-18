const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false
    },
    productId: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    size: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: '' },
    addressLine1: { type: String, trim: true, default: '' },
    addressLine2: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'USA' },
    phone: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      default: []
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    shippingAddress: {
      type: shippingAddressSchema,
      default: () => ({})
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
      trim: true
    },
    paymentId: {
      type: String,
      trim: true,
      default: () => `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);