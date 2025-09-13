const { Documento } = require('../models');

class DocumentoController {
  // GET /api/sugestoes/documento - Buscar sugestões de pessoas com documentos
  static async getSuggestions(req, res) {
    try {
      const { termo } = req.query;
      
      if (!termo || termo.length < 2) {
        return res.json([]);
      }
      
      const suggestions = await Documento.searchSuggestions(termo);
      res.json(suggestions);
    } catch (error) {
      console.error('Erro ao buscar sugestões de documentos:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as sugestões'
      });
    }
  }

  // GET /api/dados/documento - Buscar dados de documentos
  static async getData(req, res) {
    try {
      const { search, page = 1, pageSize = 10 } = req.query;
      
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      
      let result;
      
      if (search && search.trim()) {
        // Se há termo de busca, buscar por nome da pessoa
        result = await Documento.findByPersonName(search.trim(), pageNum, pageSizeNum);
      } else {
        // Se não há termo de busca, listar todos
        result = await Documento.findAll(pageNum, pageSizeNum);
      }
      
      res.json({
        data: result.data,
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        totalRecords: result.pagination.totalRecords,
        pageSize: result.pagination.pageSize
      });
    } catch (error) {
      console.error('Erro ao buscar dados de documentos:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os dados'
      });
    }
  }

  // GET /api/documento/pessoa/:id - Buscar documentos por ID da pessoa
  static async getByPersonId(req, res) {
    try {
      const { id } = req.params;
      
      const documentos = await Documento.findByPersonId(id);
      
      res.json(documentos);
    } catch (error) {
      console.error('Erro ao buscar documentos por pessoa:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os documentos'
      });
    }
  }
}

module.exports = DocumentoController;

