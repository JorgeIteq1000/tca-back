const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// GET /api/matricula - Buscar matrículas
router.get('/', matriculaController.buscarMatriculas);

// GET /api/matricula/sugestoes - Obter sugestões para autocomplete
router.get('/sugestoes', matriculaController.obterSugestoes);

module.exports = router;

