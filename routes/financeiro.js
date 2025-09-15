const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// Aplicar middleware de autorização para admin
router.use(requireAdmin);

// GET /api/dados/financeiro - Buscar dados financeiros
router.get('/dados/financeiro', financeiroController.buscarFinanceiro);

// GET /api/sugestoes/financeiro - Obter sugestões para autocomplete
router.get('/sugestoes/financeiro', financeiroController.obterSugestoes);

module.exports = router;