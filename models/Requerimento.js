const { sql, poolPromise } = require('../config/database');

class Requerimento {
  static async buscarPorPessoa(codPessoa, page = 1, limit = 10) {
    try {
      const pool = await poolPromise;
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pr.cod_pessoa,
          p.nome,
          pr.cod_requerimento,
          r.descricao as descricao_requerimento,
          pr.numero_protocolo,
          FORMAT(pr.data_requerimento, 'dd/MM/yyyy') as data_requerimento,
          pr.status,
          pr.usuario,
          pr.chave,
          pr.cod_turma,
          pr.cod_curso,
          c.nome as nome_curso,
          FORMAT(pr.data_previsao_entrega, 'dd/MM/yyyy') as data_previsao_entrega,
          pr.departamento,
          pr.tipo_log,
          FORMAT(pr.data_hora_log, 'dd/MM/yyyy HH:mm:ss') as data_hora_log,
          pr.usuario_log,
          prd.data as data_detalhe,
          prd.usuario as usuario_detalhe,
          prd.departamento as departamento_detalhe,
          prd.descricao as descricao_detalhe,
          prd.status as status_detalhe,
          FORMAT(prd.data_hora_log, 'dd/MM/yyyy HH:mm:ss') as data_hora_log_detalhe,
          prd.usuario_log as usuario_log_detalhe
        FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
        JOIN dbo.Requerimento r ON pr.cod_requerimento = r.cod_requerimento
        JOIN dbo.Turma t ON pr.cod_turma = t.cod_turma
        JOIN dbo.Curso c ON pr.cod_curso = c.cod_curso
        LEFT JOIN LogGeo.Pessoa_Requerimento_Detalhe prd ON pr.cod_pessoa = prd.cod_pessoa AND pr.cod_requerimento = prd.cod_requerimento
        WHERE pr.cod_pessoa = @codPessoa
        ORDER BY pr.data_requerimento DESC
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
        FROM LogGeo.Pessoa_Requerimento pr
        WHERE pr.cod_pessoa = @codPessoa
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
      console.error('Erro ao buscar requerimentos:', error);
      throw error;
    }
  }

  static async buscarPorNome(nome, page = 1, limit = 10) {
    try {
      const pool = await poolPromise;
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pr.cod_pessoa,
          p.nome,
          pr.cod_requerimento,
          r.descricao as descricao_requerimento,
          pr.numero_protocolo,
          FORMAT(pr.data_requerimento, 'dd/MM/yyyy') as data_requerimento,
          pr.status,
          pr.usuario,
          pr.chave,
          pr.cod_turma,
          pr.cod_curso,
          c.nome as nome_curso,
          FORMAT(pr.data_previsao_entrega, 'dd/MM/yyyy') as data_previsao_entrega,
          pr.departamento,
          pr.tipo_log,
          FORMAT(pr.data_hora_log, 'dd/MM/yyyy HH:mm:ss') as data_hora_log,
          pr.usuario_log
        FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
        JOIN dbo.Requerimento r ON pr.cod_requerimento = r.cod_requerimento
        JOIN dbo.Turma t ON pr.cod_turma = t.cod_turma
        JOIN dbo.Curso c ON pr.cod_curso = c.cod_curso
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, pr.data_requerimento DESC
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
        FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
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
      console.error('Erro ao buscar requerimentos por nome:', error);
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
        FROM LogGeo.Pessoa_Requerimento pr
        INNER JOIN dbo.pessoa p ON pr.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @termo
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

