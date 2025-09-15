const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// GET /api/dados/matricula - Buscar matrículas
router.get('/dados/matricula', matriculaController.buscarMatriculas);

// GET /api/sugestoes/matricula - Obter sugestões para autocomplete
router.get('/sugestoes/matricula', matriculaController.obterSugestoes);

module.exports = router;