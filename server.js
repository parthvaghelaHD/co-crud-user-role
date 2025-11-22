require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/connection');

const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// -- Security Middlewares -- //
 
// Helmet (For the Headers Security )
app.use(helmet());

// CORS (Allow limited domains)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Limit number of requests (DDOS / Brute force protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes interval
  limit: 100, // max 100 requests per IP addresses
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Body Parser
app.use(bodyParser.json());

// No - SQL Injection Prevention
app.use(mongoSanitize());

// Prevent XSS , 
app.use(xssClean());

// Prevent the HTTP Parameter Pollution
app.use(hpp());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);

/* error handling */
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

/* listing the server on specific port*/
const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running securely on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('Failed to connect DB', err);
    process.exit(1);
  });
