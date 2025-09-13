const { Ocorrencia } = require('../models');

class OcorrenciaController {
  // GET /api/sugestoes/ocorrencia - Buscar sugestões de pessoas com ocorrências
  static async getSuggestions(req, res) {
    try {
      const { termo } = req.query;
      
      if (!termo || termo.length < 2) {
        return res.json([]);
      }
      
      const suggestions = await Ocorrencia.searchSuggestions(termo);
      res.json(suggestions);
    } catch (error) {
      console.error('Erro ao buscar sugestões de ocorrências:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as sugestões'
      });
    }
  }

  // GET /api/dados/ocorrencia - Buscar dados de ocorrências
  static async getData(req, res) {
    try {
      const { search, page = 1, pageSize = 10 } = req.query;
      
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      
      let result;
      
      if (search && search.trim()) {
        // Se há termo de busca, buscar por nome do aluno
        result = await Ocorrencia.findByStudentName(search.trim(), pageNum, pageSizeNum);
      } else {
        // Se não há termo de busca, listar todos
        result = await Ocorrencia.findAll(pageNum, pageSizeNum);
      }
      
      res.json({
        data: result.data,
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        totalRecords: result.pagination.totalRecords,
        pageSize: result.pagination.pageSize
      });
    } catch (error) {
      console.error('Erro ao buscar dados de ocorrências:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os dados'
      });
    }
  }

  // GET /api/ocorrencia/aluno/:id - Buscar ocorrências por matrícula do aluno
  static async getByStudentId(req, res) {
    try {
      const { id } = req.params;
      
      const ocorrencias = await Ocorrencia.findByStudentId(id);
      
      res.json(ocorrencias);
    } catch (error) {
      console.error('Erro ao buscar ocorrências por aluno:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as ocorrências'
      });
    }
  }

  // POST /api/ocorrencias - Criar nova ocorrência
  static async create(req, res) {
    try {
      const { matricula_aluno, nome_aluno, data, descricao_novo, tipo, usuario } = req.body;
      
      // Validação básica
      if (!matricula_aluno || !nome_aluno || !data || !descricao_novo || !tipo || !usuario) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'Todos os campos são obrigatórios: matricula_aluno, nome_aluno, data, descricao_novo, tipo, usuario'
        });
      }
      
      const result = await Ocorrencia.create({
        matricula_aluno,
        nome_aluno,
        data,
        descricao_novo,
        tipo,
        usuario
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar a ocorrência'
      });
    }
  }

  // GET /api/dados/ocorrencia-novo - Buscar dados de ocorrências novas
  static async getNewOccurrencesData(req, res) {
    try {
      const { search, page = 1, pageSize = 10 } = req.query;
      
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      
      let result;
      
      if (search && search.trim()) {
        // Se há termo de busca, buscar por nome ou matrícula
        result = await Ocorrencia.searchNewOccurrences(search.trim(), pageNum, pageSizeNum);
      } else {
        // Se não há termo de busca, listar todos
        result = await Ocorrencia.findNewOccurrences(pageNum, pageSizeNum);
      }
      
      res.json({
        data: result.data,
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        totalRecords: result.pagination.totalRecords,
        pageSize: result.pagination.pageSize
      });
    } catch (error) {
      console.error('Erro ao buscar dados de ocorrências novas:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os dados'
      });
    }
  }
}

module.exports = OcorrenciaController;

