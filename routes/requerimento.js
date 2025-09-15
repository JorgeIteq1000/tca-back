const express = require('express');
const router = express.Router();
const requerimentoController = require('../controllers/requerimentoController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// GET /api/dados/requerimento - Buscar requerimentos
router.get('/dados/requerimento', requerimentoController.buscarRequerimentos);

// GET /api/sugestoes/requerimento - Obter sugestões para autocomplete
router.get('/sugestoes/requerimento', requerimentoController.obterSugestoes);

module.exports = router;