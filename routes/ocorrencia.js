const express = require('express');
const OcorrenciaController = require('../controllers/ocorrenciaController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/sugestoes/ocorrencia - Buscar sugestões de pessoas com ocorrências
router.get('/sugestoes/ocorrencia', OcorrenciaController.getSuggestions);

// GET /api/dados/ocorrencia - Buscar dados de ocorrências
router.get('/dados/ocorrencia', OcorrenciaController.getData);

// GET /api/dados/ocorrencia-novo - Buscar dados de ocorrências novas
router.get('/dados/ocorrencia-novo', OcorrenciaController.getNewOccurrencesData);

// GET /api/ocorrencia/aluno/:id - Buscar ocorrências por matrícula do aluno
router.get('/ocorrencia/aluno/:id', OcorrenciaController.getByStudentId);

// POST /api/ocorrencias - Criar nova ocorrência
router.post('/ocorrencias', OcorrenciaController.create);

module.exports = router;

