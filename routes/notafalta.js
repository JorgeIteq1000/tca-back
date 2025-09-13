const express = require('express');
const router = express.Router();
const notaFaltaController = require('../controllers/notaFaltaController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// GET /api/notafalta - Buscar notas/faltas
router.get('/', notaFaltaController.buscarNotasFaltas);

// GET /api/notafalta/sugestoes - Obter sugestões para autocomplete
router.get('/sugestoes', notaFaltaController.obterSugestoes);

module.exports = router;

