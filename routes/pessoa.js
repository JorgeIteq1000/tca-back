const express = require('express');
const PessoaController = require('../controllers/pessoaController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/sugestoes/pessoa - Buscar sugestões de pessoas
router.get('/sugestoes/pessoa', PessoaController.getSuggestions);

// GET /api/dados/pessoa - Buscar dados de pessoas
router.get('/dados/pessoa', PessoaController.getData);

// GET /api/pessoa/:id - Buscar pessoa por ID
router.get('/pessoa/:id', PessoaController.getById);

// GET /api/pessoa/:id/exists - Verificar se pessoa existe
router.get('/pessoa/:id/exists', PessoaController.checkExists);

module.exports = router;

