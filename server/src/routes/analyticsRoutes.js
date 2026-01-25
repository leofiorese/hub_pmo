const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
// const authMiddleware = require('../middlewares/auth'); // Descomentar quando integrar auth

// Rota pública por enquanto para facilitar dev, depois proteger
router.get('/schema', AnalyticsController.getSchema);
router.post('/query', AnalyticsController.executeQuery);
router.post('/ask', AnalyticsController.askAI);

module.exports = router;
