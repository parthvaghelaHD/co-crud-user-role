const Role = require('../models/Role');

// create the role API
const createRole = async (req, res, next) => {
  try {
    const { roleName, accessModules = [], active = true } = req.body;
    if (!roleName) return res.status(400).json({ message: 'roleName required' });

    // ensure unique accessModules
    const uniqueModules = Array.from(new Set(accessModules.map(m => String(m).trim()).filter(Boolean)));

    const role = new Role({ roleName: roleName.trim(), accessModules: uniqueModules, active });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Role already exists' });
    next(err);
  }
};

// Get role list with search & pagination
const listRoles = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const regex = new RegExp(q, 'i');
    const skip = (Math.max(1, page) - 1) * limit;

    const [items, total] = await Promise.all([
      Role.find({ roleName: regex }).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Role.countDocuments({ roleName: regex })
    ]);

    res.json({ data: items, total });
  } catch (err) {
    next(err);
  }
};

// Get role by ID
const getRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) { next(err); }
};

// Update role details by ID
const updateRole = async (req, res, next) => {
  try {
    const updates = req.body;
    if (updates.accessModules) {
      // make unique
      updates.accessModules = Array.from(new Set(updates.accessModules.map(m => String(m).trim()).filter(Boolean)));
    }
    const role = await Role.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) { next(err); }
};

// Delete role by ID
const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

//Add unique access module(s) to role (ensuring unique)
const addAccessModules = async (req, res, next) => {
  try {
    let { modules } = req.body;
    if (!modules) return res.status(400).json({ message: 'modules required' });
    if (!Array.isArray(modules)) modules = [modules];

    // use $addToSet to ensure each unique
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { accessModules: { $each: modules.map(m => String(m).trim()).filter(Boolean) } } },
      { new: true }
    );
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) { next(err); }
};

//Remove a module from accessModules (accepts single module or array)
const removeAccessModules = async (req, res, next) => {
  try {
    let { modules } = req.body;
    if (!modules) return res.status(400).json({ message: 'modules required' });
    if (!Array.isArray(modules)) modules = [modules];

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { $pull: { accessModules: { $in: modules.map(m => String(m).trim()).filter(Boolean) } } },
      { new: true }
    );
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (err) { next(err); }
};

module.exports = {
  createRole,
  listRoles,
  getRole,
  updateRole,
  deleteRole,
  addAccessModules,
  removeAccessModules
};
