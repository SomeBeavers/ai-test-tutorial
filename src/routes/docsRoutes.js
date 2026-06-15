const express = require('express');
const docsController = require('../controllers/docsController');

const router = express.Router();

router.get('/docs', docsController.renderDocs);
router.get('/docs/spec', docsController.getSpec);

module.exports = router;
