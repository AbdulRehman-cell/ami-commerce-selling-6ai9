const mongoose = require('mongoose');
// Auto-generated to back a client API call that had no matching route.
const schema = new mongoose.Schema({ name: { type: String, trim: true } }, { strict: false, timestamps: true });
module.exports = mongoose.model('Admin', schema);
