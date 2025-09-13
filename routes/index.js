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
      certificado: '/api/certificado, /api/certificado/sugestoes',
      notafalta: '/api/notafalta, /api/notafalta/sugestoes',
      requerimento: '/api/requerimento, /api/requerimento/sugestoes',
      matricula: '/api/matricula, /api/matricula/sugestoes',
      financeiro: '/api/financeiro, /api/financeiro/sugestoes (admin only)',
      buscarTudo: '/api/buscar-tudo'
    }
  });
});

// Configurar rotas
router.use('/', authRoutes);
router.use('/', pessoaRoutes);
router.use('/', documentoRoutes);
router.use('/', ocorrenciaRoutes);
router.use('/certificado', certificadoRoutes);
router.use('/notafalta', notaFaltaRoutes);
router.use('/requerimento', requerimentoRoutes);
router.use('/matricula', matriculaRoutes);
router.use('/financeiro', financeiroRoutes);
router.use('/buscar-tudo', buscarTudoRoutes);

module.exports = router;

