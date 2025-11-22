const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true, trim: true },
  accessModules: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

/* Indexes Implementation*/
RoleSchema.index({ roleName: 1 }, { unique: true });
RoleSchema.index({ active: 1 });
RoleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Role', RoleSchema);