const express = require('express');
const authRoutes = require('./authRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

router.use(authRoutes);
router.use(checkoutRoutes);
router.use(healthRoutes);

module.exports = router;
