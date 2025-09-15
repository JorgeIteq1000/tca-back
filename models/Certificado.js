const { sql, getPool } = require('../config/database');

class Certificado {
  // O método findAll foi adicionado para buscas sem um termo específico
  static async findAll(page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pc.cod_pessoa,
          p.nome,
          pc.tipo_certificado,
          pc.cod_curso,
          pc.cod_disciplina,
          d.nome as nome_disciplina,
          pc.carga_horaria,
          FORMAT(pc.data_registro, 'dd/MM/yyyy') as data_registro
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
        LEFT JOIN dbo.Disciplina d ON pc.cod_disciplina = d.cod_disciplina
        ORDER BY p.nome, pc.data_registro DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;

      const countQuery = `SELECT COUNT(*) as total FROM dbo.Pessoa_Certificado`;
      
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
      console.error('Erro ao buscar todos os certificados:', error);
      throw error;
    }
  }

  static async buscarPorPessoa(codPessoa, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pc.cod_pessoa,
          p.nome,
          pc.tipo_certificado,
          pc.cod_curso,
          pc.cod_disciplina,
          d.nome as nome_disciplina,
          pc.carga_horaria,
          FORMAT(pc.data_registro, 'dd/MM/yyyy') as data_registro
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
        LEFT JOIN dbo.Disciplina d ON pc.cod_disciplina = d.cod_disciplina
        WHERE pc.cod_pessoa = @codPessoa
        ORDER BY pc.data_registro DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM dbo.Pessoa_Certificado pc
        WHERE pc.cod_pessoa = @codPessoa
      `;
      
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
      console.error('Erro ao buscar certificados:', error);
      throw error;
    }
  }

  static async buscarPorNome(nome, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pc.cod_pessoa,
          p.nome,
          pc.tipo_certificado,
          pc.cod_curso,
          pc.cod_disciplina,
          d.nome as nome_disciplina,
          pc.carga_horaria,
          FORMAT(pc.data_registro, 'dd/MM/yyyy') as data_registro
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
        LEFT JOIN dbo.Disciplina d ON pc.cod_disciplina = d.cod_disciplina
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, pc.data_registro DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @nome
      `;
      
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
      console.error('Erro ao buscar certificados por nome:', error);
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
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @termo OR CAST(p.cod_pessoa AS VARCHAR) LIKE @termo
        ORDER BY p.nome
      `;
      
      const result = await pool.request()
        .input('termo', sql.VarChar, `%${termo}%`)
        .query(query);
      
      return result.recordset;
    } catch (error) {
      console.error('Erro ao obter sugestões de certificados:', error);
      throw error;
    }
  }
}

module.exports = Certificado;