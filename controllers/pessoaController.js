const { Pessoa } = require('../models');

class PessoaController {
  // GET /api/sugestoes/pessoa - Buscar sugestões de pessoas
  static async getSuggestions(req, res) {
    try {
      const { termo } = req.query;
      
      if (!termo || termo.length < 2) {
        return res.json({ success: true, data: [] });
      }
      
      const suggestions = await Pessoa.searchSuggestions(termo);

      // LOG: Desabilitando o cache para esta rota
      res.set('Cache-Control', 'no-store');
      
      res.json({ success: true, data: suggestions });
    } catch (error) {
      console.error('Erro ao buscar sugestões de pessoas:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as sugestões'
      });
    }
  }

  // GET /api/dados/pessoa - Buscar dados de pessoas
  static async getData(req, res) {
    try {
      const { search, page = 1, pageSize = 10 } = req.query;
      
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      
      let result;
      
      if (search && search.trim()) {
        result = await Pessoa.findByName(search.trim(), pageNum, pageSizeNum);
      } else {
        result = await Pessoa.findAll(pageNum, pageSizeNum);
      }
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Erro ao buscar dados de pessoas:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os dados'
      });
    }
  }

  // GET /api/pessoa/:id - Buscar pessoa por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const pessoa = await Pessoa.findById(id);
      
      if (!pessoa) {
        return res.status(404).json({ 
          success: false,
          error: 'Pessoa não encontrada',
          message: `Não foi encontrada pessoa com ID ${id}`
        });
      }
      
      res.json({ success: true, data: pessoa });
    } catch (error) {
      console.error('Erro ao buscar pessoa por ID:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar a pessoa'
      });
    }
  }

  // GET /api/pessoa/:id/exists - Verificar se pessoa existe
  static async checkExists(req, res) {
    try {
      const { id } = req.params;
      
      const exists = await Pessoa.exists(id);
      
      res.json({ success: true, exists });
    } catch (error) {
      console.error('Erro ao verificar existência da pessoa:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível verificar a existência da pessoa'
      });
    }
  }
}

module.exports = PessoaController;