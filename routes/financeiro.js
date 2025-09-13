const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authenticateToken);

// Aplicar middleware de autorização para admin (financeiro é restrito)
router.use(requireAdmin);

// GET /api/financeiro - Buscar dados financeiros
router.get('/', financeiroController.buscarFinanceiro);

// GET /api/financeiro/sugestoes - Obter sugestões para autocomplete
router.get('/sugestoes', financeiroController.obterSugestoes);

module.exports = router;

