const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

/* Indexes Implementation */
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ firstName: 1 });
UserSchema.index({ lastName: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ active: 1, createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
