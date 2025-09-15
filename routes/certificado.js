const express = require('express');
const router = express.Router();
const certificadoController = require('../controllers/certificadoController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// GET /api/dados/certificado - Buscar certificados
router.get('/dados/certificado', certificadoController.buscarCertificados);

// GET /api/sugestoes/certificado - Obter sugestões para autocomplete
router.get('/sugestoes/certificado', certificadoController.obterSugestoes);

module.exports = router;