const { sql, getPool } = require('../config/database');

class Financeiro {

  static async findAll(page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          cb.cod_pessoa,
          p.nome AS nome_pessoa,
          cb.cod_servico,
          cb.parcela,
          cb.status,
          c.nome AS nome_curso,
          t.cod_curso,
          FORMAT(cb.data_vencimento, 'dd/MM/yyyy') AS data_vencimento,
          cb.valor_bruto,
          cb.valor_desconto,
          cb.valor_pago,
          cb.cod_turma,
          cb.status_cobranca
        FROM dbo.cobranca cb
        JOIN dbo.Turma t ON cb.cod_turma = t.cod_turma
        JOIN dbo.Curso c ON t.cod_curso = c.cod_curso
        JOIN dbo.Pessoa p ON cb.cod_pessoa = p.cod_pessoa
        ORDER BY p.nome, cb.data_vencimento DESC
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
          cb.cod_pessoa, p.nome AS nome_pessoa, cb.cod_servico, cb.parcela, cb.status,
          c.nome AS nome_curso, t.cod_curso, FORMAT(cb.data_vencimento, 'dd/MM/yyyy') AS data_vencimento,
          cb.valor_bruto, cb.valor_desconto, cb.valor_pago, cb.cod_turma, cb.status_cobranca
        FROM dbo.cobranca cb
        JOIN dbo.Turma t ON cb.cod_turma = t.cod_turma
        JOIN dbo.Curso c ON t.cod_curso = c.cod_curso
        JOIN dbo.Pessoa p ON cb.cod_pessoa = p.cod_pessoa
        WHERE cb.cod_pessoa = @codPessoa
        ORDER BY cb.data_vencimento DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      
      const countQuery = `SELECT COUNT(*) as total FROM dbo.cobranca cb WHERE cb.cod_pessoa = @codPessoa`;
      
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
          cb.cod_pessoa, p.nome AS nome_pessoa, cb.cod_servico, cb.parcela, cb.status,
          c.nome AS nome_curso, t.cod_curso, FORMAT(cb.data_vencimento, 'dd/MM/yyyy') AS data_vencimento,
          cb.valor_bruto, cb.valor_desconto, cb.valor_pago, cb.cod_turma, cb.status_cobranca
        FROM dbo.cobranca cb
        JOIN dbo.Turma t ON cb.cod_turma = t.cod_turma
        JOIN dbo.Curso c ON t.cod_curso = c.cod_curso
        JOIN dbo.Pessoa p ON cb.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, cb.data_vencimento DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      
      const countQuery = `
        SELECT COUNT(*) as total FROM dbo.cobranca cb
        INNER JOIN dbo.pessoa p ON cb.cod_pessoa = p.cod_pessoa
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