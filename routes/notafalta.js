const express = require('express');
const router = express.Router();
const notaFaltaController = require('../controllers/notaFaltaController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// GET /api/dados/notafalta - Buscar notas/faltas
router.get('/dados/notafalta', notaFaltaController.buscarNotasFaltas);

// GET /api/sugestoes/notafalta - Obter sugestões para autocomplete
router.get('/sugestoes/notafalta', notaFaltaController.obterSugestoes);

module.exports = router;