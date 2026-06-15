const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

router.get('/healthcheck', healthController.healthcheck);

module.exports = router;
