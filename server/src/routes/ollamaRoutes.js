const express = require('express');
const router = express.Router();
const ollamaController = require('../controllers/ollamaController');

router.get('/models', ollamaController.listModels);
router.post('/chat', ollamaController.chat);

module.exports = router;
