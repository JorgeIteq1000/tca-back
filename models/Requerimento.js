const { sql, getPool } = require('../config/database');

class Requerimento {
  static async findAll(page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          pr.cod_pessoa,
          p.nome,
          pr.cod_requerimento,
          r.descricao as descricao_requerimento,
          pr.numero_protocolo,
          FORMAT(pr.data_requerimento, 'dd/MM/yyyy') as data_requerimento,
          pr.status
        FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
        JOIN dbo.Requerimento r ON pr.cod_requerimento = r.cod_requerimento
        ORDER BY p.nome, pr.data_requerimento DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;

      const countQuery = `SELECT COUNT(*) as total FROM LogGeo.Pessoa_Requerimento`;

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
      console.error('Erro ao buscar todos os requerimentos:', error);
      throw error;
    }
  }

  static async buscarPorPessoa(codPessoa, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pr.cod_pessoa, p.nome, pr.cod_requerimento, r.descricao as descricao_requerimento,
          pr.numero_protocolo, FORMAT(pr.data_requerimento, 'dd/MM/yyyy') as data_requerimento, pr.status
        FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
        JOIN dbo.Requerimento r ON pr.cod_requerimento = r.cod_requerimento
        WHERE pr.cod_pessoa = @codPessoa
        ORDER BY pr.data_requerimento DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      
      const countQuery = `SELECT COUNT(*) as total FROM LogGeo.Pessoa_Requerimento pr WHERE pr.cod_pessoa = @codPessoa`;
      
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
      console.error('Erro ao buscar requerimentos:', error);
      throw error;
    }
  }

  static async buscarPorNome(nome, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pr.cod_pessoa, p.nome, pr.cod_requerimento, r.descricao as descricao_requerimento,
          pr.numero_protocolo, FORMAT(pr.data_requerimento, 'dd/MM/yyyy') as data_requerimento, pr.status
        FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
        JOIN dbo.Requerimento r ON pr.cod_requerimento = r.cod_requerimento
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, pr.data_requerimento DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      
      const countQuery = `
        SELECT COUNT(*) as total FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
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
      console.error('Erro ao buscar requerimentos por nome:', error);
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
        FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @termo OR CAST(p.cod_pessoa AS VARCHAR) LIKE @termo
        ORDER BY p.nome
      `;
      
      const result = await pool.request()
        .input('termo', sql.VarChar, `%${termo}%`)
        .query(query);
      
      return result.recordset;
    } catch (error) {
      console.error('Erro ao obter sugestões de requerimentos:', error);
      throw error;
    }
  }
}

module.exports = Requerimento;