const express = require('express');
const DocumentoController = require('../controllers/documentoController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/sugestoes/documento - Buscar sugestões de pessoas com documentos
router.get('/sugestoes/documento', DocumentoController.getSuggestions);

// GET /api/dados/documento - Buscar dados de documentos
router.get('/dados/documento', DocumentoController.getData);

// GET /api/documento/pessoa/:id - Buscar documentos por ID da pessoa
router.get('/documento/pessoa/:id', DocumentoController.getByPersonId);

module.exports = router;

