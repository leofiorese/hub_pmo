const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/me', profileController.getMe);
router.put('/me', profileController.updateMe);
router.delete('/me', profileController.deleteMe); // Rota da autoexclusão

module.exports = router;