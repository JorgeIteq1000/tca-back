const { Pessoa } = require('../models');

class PessoaController {
  // GET /api/sugestoes/pessoa - Buscar sugestões de pessoas
  static async getSuggestions(req, res) {
    try {
      const { termo } = req.query;
      
      if (!termo || termo.length < 2) {
        return res.json([]);
      }
      
      const suggestions = await Pessoa.searchSuggestions(termo);
      res.json(suggestions);
    } catch (error) {
      console.error('Erro ao buscar sugestões de pessoas:', error);
      res.status(500).json({ 
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
        // Se há termo de busca, buscar por nome
        result = await Pessoa.findByName(search.trim(), pageNum, pageSizeNum);
      } else {
        // Se não há termo de busca, listar todos
        result = await Pessoa.findAll(pageNum, pageSizeNum);
      }
      
      res.json({
        data: result.data,
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        totalRecords: result.pagination.totalRecords,
        pageSize: result.pagination.pageSize
      });
    } catch (error) {
      console.error('Erro ao buscar dados de pessoas:', error);
      res.status(500).json({ 
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
          error: 'Pessoa não encontrada',
          message: `Não foi encontrada pessoa com ID ${id}`
        });
      }
      
      res.json(pessoa);
    } catch (error) {
      console.error('Erro ao buscar pessoa por ID:', error);
      res.status(500).json({ 
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
      
      res.json({ exists });
    } catch (error) {
      console.error('Erro ao verificar existência da pessoa:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível verificar a existência da pessoa'
      });
    }
  }
}

module.exports = PessoaController;

