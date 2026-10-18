const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ['Field Hockey', 'Padel', 'Apparel', 'Accessories', 'Bags', 'Protection', 'Balls & Equipment']
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      default: 'AMI'
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },
    images: {
      type: [String],
      default: [
        'https://picsum.photos/seed/ami-prod-1/800/800'
      ]
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional', 'All Levels'],
      default: 'All Levels'
    },
    sizes: {
      type: [String],
      default: ['Standard']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);