const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function register({ username, email, password }) {
  if (!username || !email || !password) {
    const error = new Error('Username, email, and password are required.');
    error.status = 400;
    throw error;
  }

  if (userModel.findByUsername(username)) {
    const error = new Error('Username already exists.');
    error.status = 409;
    throw error;
  }

  if (userModel.findByEmail(email)) {
    const error = new Error('Email already exists.');
    error.status = 409;
    throw error;
  }

  return userModel.create({ username, email, password });
}

function login({ username, password }) {
  if (!username || !password) {
    const error = new Error('Username and password are required.');
    error.status = 400;
    throw error;
  }

  const user = userModel.findByUsername(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    const error = new Error('Invalid username or password.');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
}

module.exports = { register, login };
