const authService = require('../services/authService');

function register(req, res, next) {
  try {
    const user = authService.register(req.body);
    res.status(201).json({ message: 'User registered successfully.', user });
  } catch (error) {
    next(error);
  }
}

function login(req, res, next) {
  try {
    const result = authService.login(req.body);
    res.status(200).json({ message: 'Login successful.', ...result });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
