const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

//Create user (admin created or signup used authController)
const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password, role } = req.body;
    if (!firstName || !username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const exist = await User.findOne({ $or: [{ username }, { email }] });
    if (exist) return res.status(409).json({ message: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, username, email, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) { next(err); }
};

//List users with search and pagination. Populates role with only roleName and accessModules also Search across username, email, firstName, lastName
const listUsers = async (req, res, next) => {
  try {
    const { search  = '', page = 1, limit = 20 } = req.query;
    const regex = new RegExp(search , 'i');
    const skip = (Math.max(1, page) - 1) * limit;

    const filter = {
      $or: [
        { username: regex },
        { email: regex },
        { firstName: regex },
        { lastName: regex }
      ]
    };

    const [items, total] = await Promise.all([
      User.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .populate('role', 'roleName accessModules'),
      User.countDocuments(filter)
    ]);
    res.json({ data: items, total });
  } catch (err) { next(err); }
};

// Get User By ID
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('role', 'roleName accessModules');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// update user details by ID
const updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('role', 'roleName accessModules');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// delete user by ID
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// Check whether user has access to a particular module.
const hasAccess = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const moduleName = req.query.module;
    if (!moduleName) return res.status(400).json({ message: 'module query param required' });

    const user = await User.findById(userId).populate('role', 'roleName accessModules');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const has = user.role && Array.isArray(user.role.accessModules) && user.role.accessModules.includes(moduleName);
    res.json({ hasAccess: !!has, module: moduleName, role: user.role ? user.role.roleName : null });
  } catch (err) { next(err); }
};

// Update many users with the same data 
const updateManySame = async (req, res, next) => {
  try {
    const { filter = {}, update = {} } = req.body; // based on filter if not passed anything then it will update all the things with update
    if (!update || Object.keys(update).length === 0) return res.status(400).json({ message: 'update is required' });

    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    const result = await User.updateMany(filter, { $set: update });
    res.json({ matched: result.matchedCount ?? result.n, modified: result.modifiedCount ?? result.nModified });
  } catch (err) { next(err); }
};

// Update many users with different data in same call, Uses bulkWrite.
const updateManyDifferent = async (req, res, next) => {
  try {
    const { operations = [] } = req.body;
    if (!Array.isArray(operations) || operations.length === 0) return res.status(400).json({ message: 'operations required' });

    const bulkOps = operations.map(op => {
      const update = { ...op.update };
      return { filter: op.filter, update };
    });

    // Need to hash passwords asynchronously
    for (let i = 0; i < operations.length; i++) {
      if (operations[i].update && operations[i].update.password) {
        operations[i].update.password = await bcrypt.hash(operations[i].update.password, 10);
      }
    }

    const bulk = operations.map(op => ({
      updateOne: {
        filter: op.filter,
        update: { $set: op.update }
      }
    }));

    const result = await User.bulkWrite(bulk);
    res.json({ result });
  } catch (err) { next(err); }
};

// exporting the functions via module.exports
module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  hasAccess,
  updateManySame,
  updateManyDifferent
};
