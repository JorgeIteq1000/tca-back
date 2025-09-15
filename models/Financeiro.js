const { sql, getPool } = require('../config/database');

class Financeiro {

  static async findAll(page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          c.cod_pessoa,
          p.nome,
          c.cod_curso,
          cur.nome as nome_curso,
          c.cod_turma,
          c.tipo_cobranca as tipo_debito,
          c.valor as valor_original,
          c.valor_pago,
          FORMAT(c.data_vencimento, 'dd/MM/yyyy') as data_vencimento,
          FORMAT(c.data_pagamento, 'dd/MM/yyyy') as data_pagamento,
          c.status as status_pagamento,
          c.observacao
        FROM dbo.cobranca c
        INNER JOIN dbo.pessoa p ON c.cod_pessoa = p.cod_pessoa
        LEFT JOIN dbo.Curso cur ON c.cod_curso = cur.cod_curso
        LEFT JOIN dbo.Turma t ON c.cod_turma = t.cod_turma
        ORDER BY p.nome, c.data_vencimento DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const countQuery = `SELECT COUNT(*) as total FROM dbo.cobranca`;

      const result = await pool.request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit)
        .query(query);

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
      console.error('Erro ao buscar todos os dados financeiros:', error);
      throw error;
    }
  }

  static async buscarPorPessoa(codPessoa, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          c.cod_pessoa, p.nome, c.cod_curso, cur.nome as nome_curso,
          c.cod_turma, c.tipo_cobranca as tipo_debito, c.valor as valor_original, c.valor_pago,
          FORMAT(c.data_vencimento, 'dd/MM/yyyy') as data_vencimento,
          FORMAT(c.data_pagamento, 'dd/MM/yyyy') as data_pagamento,
          c.status as status_pagamento, c.observacao
        FROM dbo.cobranca c
        INNER JOIN dbo.pessoa p ON c.cod_pessoa = p.cod_pessoa
        LEFT JOIN dbo.Curso cur ON c.cod_curso = cur.cod_curso
        LEFT JOIN dbo.Turma t ON c.cod_turma = t.cod_turma
        WHERE c.cod_pessoa = @codPessoa
        ORDER BY c.data_vencimento DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      
      const countQuery = `SELECT COUNT(*) as total FROM dbo.cobranca c WHERE c.cod_pessoa = @codPessoa`;
      
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
      console.error('Erro ao buscar dados financeiros:', error);
      throw error;
    }
  }

  static async buscarPorNome(nome, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          c.cod_pessoa, p.nome, c.cod_curso, cur.nome as nome_curso,
          c.cod_turma, c.tipo_cobranca as tipo_debito, c.valor as valor_original, c.valor_pago,
          FORMAT(c.data_vencimento, 'dd/MM/yyyy') as data_vencimento,
          FORMAT(c.data_pagamento, 'dd/MM/yyyy') as data_pagamento,
          c.status as status_pagamento, c.observacao
        FROM dbo.cobranca c
        INNER JOIN dbo.pessoa p ON c.cod_pessoa = p.cod_pessoa
        LEFT JOIN dbo.Curso cur ON c.cod_curso = cur.cod_curso
        LEFT JOIN dbo.Turma t ON c.cod_turma = t.cod_turma
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, c.data_vencimento DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      
      const countQuery = `
        SELECT COUNT(*) as total FROM dbo.cobranca c
        INNER JOIN dbo.pessoa p ON c.cod_pessoa = p.cod_pessoa
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
      console.error('Erro ao buscar dados financeiros por nome:', error);
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
        FROM dbo.cobranca c
        INNER JOIN dbo.pessoa p ON c.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @termo OR CAST(p.cod_pessoa AS VARCHAR) LIKE @termo
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