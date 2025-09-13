const { executeQueryWithNamedParams } = require('../config/database');

class Ocorrencia {
  // Buscar sugestões de pessoas com ocorrências
  static async searchSuggestions(searchTerm) {
    const query = `
      SELECT DISTINCT TOP 10 o.matricula_aluno, p.nome 
      FROM dbo.Ocorrencias o 
      INNER JOIN dbo.pessoa p ON o.matricula_aluno = p.cod_pessoa 
      WHERE p.nome LIKE @searchTerm OR o.matricula_aluno LIKE @searchTerm
      ORDER BY p.nome
    `;
    
    const params = {
      searchTerm: `%${searchTerm}%`
    };
    
    try {
      const result = await executeQueryWithNamedParams(query, params);
      return result.recordset.map(row => ({
        id: row.matricula_aluno,
        nome: row.nome
      }));
    } catch (error) {
      console.error('Erro ao buscar sugestões de ocorrências:', error);
      throw error;
    }
  }

  // Buscar ocorrências por matrícula do aluno
  static async findByStudentId(matriculaAluno) {
    const query = `
      SELECT o.matricula_aluno, p.nome, o.tipo, FORMAT(o.data, 'dd/MM/yyyy') as data, 
             o.hora, o.descricao, o.usuario, 
             CASE WHEN po.tipo_observacao = 'F' THEN 'Financeiro' 
                  WHEN po.tipo_observacao = 'A' THEN 'Acadêmico' 
                  ELSE po.tipo_observacao END AS tipo_observacao, 
             FORMAT(po.data_observacao, 'dd/MM/yyyy') as data_observacao, 
             po.descricao AS descricao_observacao, po.hora AS hora_observacao 
      FROM dbo.Ocorrencias o 
      LEFT JOIN dbo.PessoaObservacao po ON o.matricula_aluno = po.cod_pessoa 
      INNER JOIN dbo.pessoa p ON o.matricula_aluno = p.cod_pessoa 
      WHERE o.matricula_aluno = @matriculaAluno 
      ORDER BY o.data ASC
    `;
    
    const params = {
      matriculaAluno: matriculaAluno
    };
    
    try {
      const result = await executeQueryWithNamedParams(query, params);
      return result.recordset;
    } catch (error) {
      console.error('Erro ao buscar ocorrências por matrícula:', error);
      throw error;
    }
  }

  // Buscar ocorrências por nome do aluno (com paginação)
  static async findByStudentName(searchTerm, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const query = `
      SELECT o.matricula_aluno, p.nome, o.tipo, FORMAT(o.data, 'dd/MM/yyyy') as data, 
             o.hora, o.descricao, o.usuario, 
             CASE WHEN po.tipo_observacao = 'F' THEN 'Financeiro' 
                  WHEN po.tipo_observacao = 'A' THEN 'Acadêmico' 
                  ELSE po.tipo_observacao END AS tipo_observacao, 
             FORMAT(po.data_observacao, 'dd/MM/yyyy') as data_observacao, 
             po.descricao AS descricao_observacao, po.hora AS hora_observacao 
      FROM dbo.Ocorrencias o 
      LEFT JOIN dbo.PessoaObservacao po ON o.matricula_aluno = po.cod_pessoa 
      INNER JOIN dbo.pessoa p ON o.matricula_aluno = p.cod_pessoa 
      WHERE p.nome LIKE @searchTerm 
      ORDER BY o.data ASC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM dbo.Ocorrencias o 
      INNER JOIN dbo.pessoa p ON o.matricula_aluno = p.cod_pessoa 
      WHERE p.nome LIKE @searchTerm
    `;
    
    const params = {
      searchTerm: `%${searchTerm}%`,
      offset: offset,
      pageSize: pageSize
    };
    
    try {
      const [dataResult, countResult] = await Promise.all([
        executeQueryWithNamedParams(query, params),
        executeQueryWithNamedParams(countQuery, { searchTerm: `%${searchTerm}%` })
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        data: dataResult.recordset,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalPages: totalPages,
          totalRecords: total
        }
      };
    } catch (error) {
      console.error('Erro ao buscar ocorrências por nome do aluno:', error);
      throw error;
    }
  }

  // Listar todas as ocorrências (com paginação)
  static async findAll(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const query = `
      SELECT o.matricula_aluno, p.nome, o.tipo, FORMAT(o.data, 'dd/MM/yyyy') as data, 
             o.hora, o.descricao, o.usuario, 
             CASE WHEN po.tipo_observacao = 'F' THEN 'Financeiro' 
                  WHEN po.tipo_observacao = 'A' THEN 'Acadêmico' 
                  ELSE po.tipo_observacao END AS tipo_observacao, 
             FORMAT(po.data_observacao, 'dd/MM/yyyy') as data_observacao, 
             po.descricao AS descricao_observacao, po.hora AS hora_observacao 
      FROM dbo.Ocorrencias o 
      LEFT JOIN dbo.PessoaObservacao po ON o.matricula_aluno = po.cod_pessoa 
      INNER JOIN dbo.pessoa p ON o.matricula_aluno = p.cod_pessoa 
      ORDER BY o.data DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM dbo.Ocorrencias o 
      INNER JOIN dbo.pessoa p ON o.matricula_aluno = p.cod_pessoa
    `;
    
    const params = {
      offset: offset,
      pageSize: pageSize
    };
    
    try {
      const [dataResult, countResult] = await Promise.all([
        executeQueryWithNamedParams(query, params),
        executeQueryWithNamedParams(countQuery, {})
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        data: dataResult.recordset,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalPages: totalPages,
          totalRecords: total
        }
      };
    } catch (error) {
      console.error('Erro ao listar ocorrências:', error);
      throw error;
    }
  }

  // Inserir nova ocorrência
  static async create(ocorrenciaData) {
    const { matricula_aluno, nome_aluno, data, descricao_novo, tipo, usuario } = ocorrenciaData;
    
    const query = `
      INSERT INTO dbo.ocorrencias_novo (matricula_aluno, nome_aluno, data, descricao_novo, tipo, usuario)
      VALUES (@matricula_aluno, @nome_aluno, CONVERT(DATETIME, @data, 120), @descricao_novo, @tipo, @usuario);
      SELECT SCOPE_IDENTITY() as id;
    `;
    
    const params = {
      matricula_aluno,
      nome_aluno,
      data,
      descricao_novo,
      tipo,
      usuario
    };
    
    try {
      const result = await executeQueryWithNamedParams(query, params);
      return {
        success: true,
        id: result.recordset[0].id,
        message: 'Ocorrência inserida com sucesso'
      };
    } catch (error) {
      console.error('Erro ao inserir ocorrência:', error);
      throw error;
    }
  }

  // Buscar ocorrências novas (tabela ocorrencias_novo)
  static async findNewOccurrences(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const query = `
      SELECT on.id, on.matricula_aluno, on.nome_aluno, 
             FORMAT(on.data, 'dd/MM/yyyy HH:mm:ss') as data, 
             on.descricao_novo, on.tipo, on.usuario
      FROM dbo.ocorrencias_novo on
      ORDER BY on.data DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    
    const countQuery = `SELECT COUNT(*) as total FROM dbo.ocorrencias_novo`;
    
    const params = {
      offset: offset,
      pageSize: pageSize
    };
    
    try {
      const [dataResult, countResult] = await Promise.all([
        executeQueryWithNamedParams(query, params),
        executeQueryWithNamedParams(countQuery, {})
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        data: dataResult.recordset,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalPages: totalPages,
          totalRecords: total
        }
      };
    } catch (error) {
      console.error('Erro ao listar ocorrências novas:', error);
      throw error;
    }
  }

  // Buscar ocorrências novas por termo de busca
  static async searchNewOccurrences(searchTerm, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const query = `
      SELECT on.id, on.matricula_aluno, on.nome_aluno, 
             FORMAT(on.data, 'dd/MM/yyyy HH:mm:ss') as data, 
             on.descricao_novo, on.tipo, on.usuario
      FROM dbo.ocorrencias_novo on
      WHERE on.nome_aluno LIKE @searchTerm OR on.matricula_aluno LIKE @searchTerm
      ORDER BY on.data DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM dbo.ocorrencias_novo 
      WHERE nome_aluno LIKE @searchTerm OR matricula_aluno LIKE @searchTerm
    `;
    
    const params = {
      searchTerm: `%${searchTerm}%`,
      offset: offset,
      pageSize: pageSize
    };
    
    try {
      const [dataResult, countResult] = await Promise.all([
        executeQueryWithNamedParams(query, params),
        executeQueryWithNamedParams(countQuery, { searchTerm: `%${searchTerm}%` })
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        data: dataResult.recordset,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalPages: totalPages,
          totalRecords: total
        }
      };
    } catch (error) {
      console.error('Erro ao buscar ocorrências novas:', error);
      throw error;
    }
  }
}

module.exports = Ocorrencia;

