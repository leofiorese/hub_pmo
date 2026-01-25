const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

const authMiddleware = require('../middlewares/authMiddleware');
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;