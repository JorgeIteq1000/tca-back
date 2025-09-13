const express = require('express');
const router = express.Router();
const buscarTudoController = require('../controllers/buscarTudoController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// GET /api/buscar-tudo - Buscar todos os dados de uma pessoa
router.get('/', buscarTudoController.buscarTodosDados);

module.exports = router;

