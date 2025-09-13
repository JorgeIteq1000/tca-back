const { NotaFalta } = require('../models');

const notaFaltaController = {
  // Buscar notas/faltas por nome ou código de pessoa
  async buscarNotasFaltas(req, res) {
    try {
      const { busca, page = 1, limit = 10 } = req.query;
      
      if (!busca) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro de busca é obrigatório'
        });
      }

      let resultado;
      
      // Verificar se é um número (código de pessoa) ou texto (nome)
      if (!isNaN(busca)) {
        resultado = await NotaFalta.buscarPorPessoa(parseInt(busca), parseInt(page), parseInt(limit));
      } else {
        resultado = await NotaFalta.buscarPorNome(busca, parseInt(page), parseInt(limit));
      }

      res.json({
        success: true,
        data: resultado.data,
        pagination: {
          page: resultado.page,
          limit: resultado.limit,
          total: resultado.total,
          totalPages: resultado.totalPages
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

  // Obter sugestões para autocomplete
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

