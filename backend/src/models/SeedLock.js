const mongoose = require('mongoose');

const seedLockSchema = new mongoose.Schema(
  {
    _id: { type: String },
    status: { type: String, enum: ['in-progress', 'completed'], required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { versionKey: false }
);

module.exports = mongoose.model('SeedLock', seedLockSchema);
