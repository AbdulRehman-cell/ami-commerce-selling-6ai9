const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    addresses: [
      {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, default: 'USA' },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);