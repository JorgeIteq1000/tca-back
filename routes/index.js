const express = require('express');

// Importar todas as rotas
const authRoutes = require('./auth');
const pessoaRoutes = require('./pessoa');
const documentoRoutes = require('./documento');
const ocorrenciaRoutes = require('./ocorrencia');
const certificadoRoutes = require('./certificado');
const notaFaltaRoutes = require('./notafalta');
const requerimentoRoutes = require('./requerimento');
const matriculaRoutes = require('./matricula');
const financeiroRoutes = require('./financeiro');
const buscarTudoRoutes = require('./buscarTudo');

const router = express.Router();

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TCA SaaS Backend está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota de informações da API
router.get('/info', (req, res) => {
  res.json({
    name: 'TCA SaaS Backend API',
    version: '1.0.0',
    description: 'API para o Portal TCA Web - Sistema de Gestão Acadêmica',
    endpoints: {
      auth: '/api/login, /api/verify-token, /api/logout',
      pessoa: '/api/dados/pessoa, /api/sugestoes/pessoa, /api/pessoa/:id',
      documento: '/api/dados/documento, /api/sugestoes/documento, /api/documento/pessoa/:id',
      ocorrencia: '/api/dados/ocorrencia, /api/sugestoes/ocorrencia, /api/ocorrencias, /api/ocorrencia/aluno/:id',
      certificado: '/api/dados/certificado, /api/sugestoes/certificado',
      notafalta: '/api/dados/notafalta, /api/sugestoes/notafalta',
      requerimento: '/api/dados/requerimento, /api/sugestoes/requerimento',
      matricula: '/api/dados/matricula, /api/sugestoes/matricula',
      financeiro: '/api/dados/financeiro, /api/sugestoes/financeiro (admin only)',
      buscarTudo: '/api/buscar-tudo'
    }
  });
});

// Configurar rotas (sem prefixos extras)
router.use('/', authRoutes);
router.use('/', pessoaRoutes);
router.use('/', documentoRoutes);
router.use('/', ocorrenciaRoutes);
router.use('/', certificadoRoutes);
router.use('/', notaFaltaRoutes);
router.use('/', requerimentoRoutes);
router.use('/', matriculaRoutes);
router.use('/', financeiroRoutes);
router.use('/buscar-tudo', buscarTudoRoutes);

module.exports = router;