const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || ''; // extracting a authorization value from the header
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please provide token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // contains userId, username etc set in login
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token, Please provide valid token' });
  }
};

module.exports = auth;
