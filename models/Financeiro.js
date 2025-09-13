const { sql, poolPromise } = require('../config/database');

class Financeiro {
  static async buscarPorPessoa(codPessoa, page = 1, limit = 10) {
    try {
      const pool = await poolPromise;
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          f.cod_pessoa,
          p.nome,
          f.cod_curso,
          c.nome as nome_curso,
          f.cod_turma,
          f.tipo_debito,
          f.valor_original,
          f.valor_pago,
          FORMAT(f.data_vencimento, 'dd/MM/yyyy') as data_vencimento,
          FORMAT(f.data_pagamento, 'dd/MM/yyyy') as data_pagamento,
          f.status_pagamento,
          f.observacao
        FROM dbo.Financeiro f
        INNER JOIN dbo.pessoa p ON f.cod_pessoa = p.cod_pessoa
        JOIN dbo.Curso c ON f.cod_curso = c.cod_curso
        JOIN dbo.Turma t ON f.cod_turma = t.cod_turma
        WHERE f.cod_pessoa = @codPessoa
        ORDER BY f.data_vencimento DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const result = await pool.request()
        .input('codPessoa', sql.Int, codPessoa)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(query);
      
      // Contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
        FROM dbo.Financeiro f
        WHERE f.cod_pessoa = @codPessoa
      `;
      
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
      console.error('Erro ao buscar dados financeiros:', error);
      throw error;
    }
  }

  static async buscarPorNome(nome, page = 1, limit = 10) {
    try {
      const pool = await poolPromise;
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          f.cod_pessoa,
          p.nome,
          f.cod_curso,
          c.nome as nome_curso,
          f.cod_turma,
          f.tipo_debito,
          f.valor_original,
          f.valor_pago,
          FORMAT(f.data_vencimento, 'dd/MM/yyyy') as data_vencimento,
          FORMAT(f.data_pagamento, 'dd/MM/yyyy') as data_pagamento,
          f.status_pagamento,
          f.observacao
        FROM dbo.Financeiro f
        INNER JOIN dbo.pessoa p ON f.cod_pessoa = p.cod_pessoa
        JOIN dbo.Curso c ON f.cod_curso = c.cod_curso
        JOIN dbo.Turma t ON f.cod_turma = t.cod_turma
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, f.data_vencimento DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const result = await pool.request()
        .input('nome', sql.VarChar, `%${nome}%`)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(query);
      
      // Contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
        FROM dbo.Financeiro f
        INNER JOIN dbo.pessoa p ON f.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @nome
      `;
      
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
      console.error('Erro ao buscar dados financeiros por nome:', error);
      throw error;
    }
  }

  static async obterSugestoes(termo) {
    try {
      const pool = await poolPromise;
      
      const query = `
        SELECT DISTINCT TOP 10
          p.cod_pessoa,
          p.nome
        FROM dbo.Financeiro f
        INNER JOIN dbo.pessoa p ON f.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @termo
        ORDER BY p.nome
      `;
      
      const result = await pool.request()
        .input('termo', sql.VarChar, `%${termo}%`)
        .query(query);
      
      return result.recordset;
    } catch (error) {
      console.error('Erro ao obter sugestões financeiras:', error);
      throw error;
    }
  }
}

module.exports = Financeiro;

