const { Documento } = require('../models');

class DocumentoController {
  // GET /api/sugestoes/documento - Buscar sugestões de pessoas com documentos
  static async getSuggestions(req, res) {
    try {
      const { termo } = req.query;
      
      if (!termo || termo.length < 2) {
        return res.json({ success: true, data: [] });
      }
      
      const suggestions = await Documento.searchSuggestions(termo);
      res.json({ success: true, data: suggestions });
    } catch (error) {
      console.error('Erro ao buscar sugestões de documentos:', error);
      res.status(500).json({ 
        success: false,
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
        result = await Documento.findByPersonName(search.trim(), pageNum, pageSizeNum);
      } else {
        result = await Documento.findAll(pageNum, pageSizeNum);
      }
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Erro ao buscar dados de documentos:', error);
      res.status(500).json({ 
        success: false,
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
      
      res.json({ success: true, data: documentos });
    } catch (error) {
      console.error('Erro ao buscar documentos por pessoa:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os documentos'
      });
    }
  }
}

module.exports = DocumentoController;