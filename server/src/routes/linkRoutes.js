const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware: precisa estar logado para ver os links
router.use(authMiddleware);

// Rota para listar TODOS
// A rota final será: /api/links/
router.get('/', linkController.listAll);

// Rota para criar NOVO link
router.post('/', linkController.addLink);

// Rota para pegar UM (usado pelas páginas de Power BI)
// A rota final será: /api/links/:key
router.get('/:key', linkController.getLink);

// Atualizar (Admin/PMO)
router.put('/:key', linkController.updateLink);

// Deletar (Admin/PMO)
router.delete('/:key', linkController.deleteLink);

module.exports = router;