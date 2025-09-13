const express = require('express');
const router = express.Router();
const certificadoController = require('../controllers/certificadoController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticação a todas as rotas
router.use(authenticateToken);

// GET /api/certificado - Buscar certificados
router.get('/', certificadoController.buscarCertificados);

// GET /api/certificado/sugestoes - Obter sugestões para autocomplete
router.get('/sugestoes', certificadoController.obterSugestoes);

module.exports = router;

