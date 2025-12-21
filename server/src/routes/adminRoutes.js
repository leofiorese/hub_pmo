const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const linkController = require('../controllers/linkController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');

// Middleware de Autenticação (Login obrigatório para tudo aqui)
router.use(authMiddleware);

// --- ROTAS DE USUÁRIOS (EXCLUSIVO ADMIN) ---
// Só 'admin' pode listar ou editar usuários
router.get('/users', checkRole(['admin']), adminController.listUsers);
router.put('/users/:id', checkRole(['admin']), adminController.updateUser);
router.delete('/users/:id', checkRole(['admin']), adminController.deleteUser);

// Rotas de Aprovação 
router.get('/approvals', checkRole(['admin']), adminController.listPendingUsers);
router.put('/approvals/:id', checkRole(['admin']), adminController.approveUser);

// --- ROTAS DE LINKS (ADMIN + PMO) ---
// Agora 'admin' E 'pmo' podem editar links
router.put('/links/:key', checkRole(['admin', 'pmo']), linkController.updateLink);

module.exports = router;