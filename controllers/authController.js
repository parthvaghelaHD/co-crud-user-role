const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup or we can say register a user
const signUp = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password, role } = req.body;
    console.log('req.body: ', req.body);
    if (!firstName || !username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ firstName, lastName, username, email, password: hash, role });
    await user.save();

    res.status(201).json({ user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};

// login via credentials like emailOrUsername and password 
const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};

module.exports = { signUp, login };
