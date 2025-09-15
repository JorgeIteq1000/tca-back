const { NotaFalta } = require('../models');

const notaFaltaController = {
  async buscarNotasFaltas(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;

      let resultado;

      if (search && search.trim()) {
        if (!isNaN(search)) {
          resultado = await NotaFalta.buscarPorPessoa(parseInt(search), parseInt(page), parseInt(limit));
        } else {
          resultado = await NotaFalta.buscarPorNome(search, parseInt(page), parseInt(limit));
        }
      } else {
        resultado = await NotaFalta.findAll(parseInt(page), parseInt(limit));
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
      console.error('Erro ao buscar notas/faltas:', error);
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

      const sugestoes = await NotaFalta.obterSugestoes(termo);
      
      res.json({
        success: true,
        data: sugestoes
      });
    } catch (error) {
      console.error('Erro ao obter sugestões de notas/faltas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = notaFaltaController;