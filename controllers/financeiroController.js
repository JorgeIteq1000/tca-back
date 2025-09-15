const { Financeiro } = require('../models');

const financeiroController = {
  async buscarFinanceiro(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;

      let resultado;
      
      if (search && search.trim()) {
        if (!isNaN(search)) {
          resultado = await Financeiro.buscarPorPessoa(parseInt(search), parseInt(page), parseInt(limit));
        } else {
          resultado = await Financeiro.buscarPorNome(search, parseInt(page), parseInt(limit));
        }
      } else {
        resultado = await Financeiro.findAll(parseInt(page), parseInt(limit));
      }

      res.json({
        success: true,
        data: resultado.data,
        pagination: {
          currentPage: resultado.page,
          totalPages: resultado.totalPages,
          totalRecords: resultado.total,
          pageSize: resultado.limit
        }
      });
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async obterSugestoes(req, res) {
    try {
      const { termo } = req.query;
      
      if (!termo || termo.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const sugestoes = await Financeiro.obterSugestoes(termo);
      
      res.json({
        success: true,
        data: sugestoes
      });
    } catch (error) {
      console.error('Erro ao obter sugestões financeiras:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = financeiroController;