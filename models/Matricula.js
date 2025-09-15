const { sql, getPool } = require('../config/database');

class Matricula {
  static async buscarPorPessoa(codPessoa, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          m.cod_pessoa, p.nome, m.cod_curso, c.nome as nome_curso,
          m.cod_turma, m.status, FORMAT(m.data_matricula, 'dd/MM/yyyy') as data_matricula,
          FORMAT(m.data_conclusao, 'dd/MM/yyyy') as data_conclusao,
          m.periodo_letivo, m.tipo_matricula, m.observacao
        FROM dbo.Matricula m
        INNER JOIN dbo.pessoa p ON m.cod_pessoa = p.cod_pessoa
        JOIN dbo.Curso c ON m.cod_curso = c.cod_curso
        JOIN dbo.Turma t ON m.cod_turma = t.cod_turma
        WHERE m.cod_pessoa = @codPessoa
        ORDER BY m.data_matricula DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      
      const countQuery = `SELECT COUNT(*) as total FROM dbo.Matricula m WHERE m.cod_pessoa = @codPessoa`;
      
      const result = await pool.request()
        .input('codPessoa', sql.Int, codPessoa)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(query);
      
      const countResult = await pool.request()
        .input('codPessoa', sql.Int, codPessoa)
        .query(countQuery);
      
      return {
        data: result.recordset,
        total: countResult.recordset[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      };
    } catch (error) {
      console.error('Erro ao buscar matrículas:', error);
      throw error;
    }
  }

  static async buscarPorNome(nome, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          m.cod_pessoa, p.nome, m.cod_curso, c.nome as nome_curso,
          m.cod_turma, m.status, FORMAT(m.data_matricula, 'dd/MM/yyyy') as data_matricula,
          FORMAT(m.data_conclusao, 'dd/MM/yyyy') as data_conclusao,
          m.periodo_letivo, m.tipo_matricula, m.observacao
        FROM dbo.Matricula m
        INNER JOIN dbo.pessoa p ON m.cod_pessoa = p.cod_pessoa
        JOIN dbo.Curso c ON m.cod_curso = c.cod_curso
        JOIN dbo.Turma t ON m.cod_turma = t.cod_turma
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, m.data_matricula DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      
      const countQuery = `
        SELECT COUNT(*) as total FROM dbo.Matricula m
        INNER JOIN dbo.pessoa p ON m.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @nome`;
      
      const result = await pool.request()
        .input('nome', sql.VarChar, `%${nome}%`)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(query);
      
      const countResult = await pool.request()
        .input('nome', sql.VarChar, `%${nome}%`)
        .query(countQuery);
      
      return {
        data: result.recordset,
        total: countResult.recordset[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult.recordset[0].total / limit)
      };
    } catch (error) {
      console.error('Erro ao buscar matrículas por nome:', error);
      throw error;
    }
  }
  
  static async findAll(page = 1, limit = 10) {
    try {
        const pool = await getPool();
        const offset = (page - 1) * limit;
        const query = `
            SELECT 
                m.cod_pessoa, p.nome, m.cod_curso, c.nome as nome_curso,
                m.cod_turma, m.status, FORMAT(m.data_matricula, 'dd/MM/yyyy') as data_matricula,
                FORMAT(m.data_conclusao, 'dd/MM/yyyy') as data_conclusao,
                m.periodo_letivo, m.tipo_matricula, m.observacao
            FROM dbo.Matricula m
            INNER JOIN dbo.pessoa p ON m.cod_pessoa = p.cod_pessoa
            JOIN dbo.Curso c ON m.cod_curso = c.cod_curso
            ORDER BY p.nome
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        const countQuery = `SELECT COUNT(*) as total FROM dbo.Matricula`;
        
        const result = await pool.request().input('offset', sql.Int, offset).input('limit', sql.Int, limit).query(query);
        const countResult = await pool.request().query(countQuery);
        
        const total = countResult.recordset[0].total;
        
        return {
            data: result.recordset,
            total: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Erro ao buscar todas as matrículas:', error);
        throw error;
    }
  }


  static async obterSugestoes(termo) {
    try {
      const pool = await getPool();
      
      const query = `
        SELECT DISTINCT TOP 10
          p.cod_pessoa as id,
          p.nome
        FROM dbo.Matricula m
        INNER JOIN dbo.pessoa p ON m.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @termo OR CAST(p.cod_pessoa AS VARCHAR) LIKE @termo
        ORDER BY p.nome
      `;
      
      const result = await pool.request()
        .input('termo', sql.VarChar, `%${termo}%`)
        .query(query);
      
      return result.recordset;
    } catch (error) {
      console.error('Erro ao obter sugestões de matrículas:', error);
      throw error;
    }
  }
}

module.exports = Matricula;