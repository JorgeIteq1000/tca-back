const express = require('express');
const router = express.Router();
const requerimentoController = require('../controllers/requerimentoController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// GET /api/requerimento - Buscar requerimentos
router.get('/', requerimentoController.buscarRequerimentos);

// GET /api/requerimento/sugestoes - Obter sugestões para autocomplete
router.get('/sugestoes', requerimentoController.obterSugestoes);

module.exports = router;

