const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware'); // Seu middleware de JWT existente
const checkRole = require('../middlewares/checkRole');

// Todas as rotas aqui precisam de Login E ser Admin
router.use(authMiddleware);
router.use(checkRole(['admin'])); 

router.get('/users', adminController.listUsers);
router.put('/users/:id', adminController.updateUser);

module.exports = router;