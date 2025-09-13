const { Certificado } = require('../models');

const certificadoController = {
  // Buscar certificados por nome ou código de pessoa
  async buscarCertificados(req, res) {
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
        resultado = await Certificado.buscarPorPessoa(parseInt(busca), parseInt(page), parseInt(limit));
      } else {
        resultado = await Certificado.buscarPorNome(busca, parseInt(page), parseInt(limit));
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
      console.error('Erro ao buscar certificados:', error);
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

      const sugestoes = await Certificado.obterSugestoes(termo);
      
      res.json({
        success: true,
        data: sugestoes
      });
    } catch (error) {
      console.error('Erro ao obter sugestões de certificados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = certificadoController;

