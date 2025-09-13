const { sql, poolPromise } = require('../config/database');

class Certificado {
  static async buscarPorPessoa(codPessoa, page = 1, limit = 10) {
    try {
      const pool = await poolPromise;
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pc.cod_pessoa,
          p.nome,
          pc.tipo_certificado,
          pc.cod_escola,
          pc.cod_curso,
          pc.cod_disciplina,
          d.nome as nome_disciplina,
          pc.carga_horaria,
          pc.grade,
          pc.polo,
          FORMAT(pc.data_registro, 'dd/MM/yyyy') as data_registro,
          FORMAT(pc.data_inicio, 'dd/MM/yyyy') as data_inicio,
          FORMAT(pc.data_conclusao, 'dd/MM/yyyy') as data_conclusao,
          FORMAT(pc.data_emissao, 'dd/MM/yyyy') as data_emissao,
          pc.lote,
          pc.livro,
          pc.folha,
          pc.numero_registro,
          pc.cod_rastreamento,
          pc.retirado_por,
          pc.status,
          pc.observacao,
          pc.status_emissao,
          FORMAT(pc.data_solicitacao, 'dd/MM/yyyy') as data_solicitacao,
          FORMAT(pc.data_colacao_grau, 'dd/MM/yyyy') as data_colacao_grau,
          pc.nota_tcc,
          pc.nota_01, pc.nota_02, pc.nota_03, pc.nota_04, pc.nota_05,
          pc.nota_06, pc.nota_07, pc.nota_08, pc.nota_09, pc.nota_10,
          pc.nota_11, pc.nota_12, pc.nota_13, pc.nota_14, pc.nota_15,
          pc.nota_16, pc.nota_17, pc.nota_18
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
        LEFT JOIN dbo.Disciplina d ON pc.cod_disciplina = d.cod_disciplina
        WHERE pc.cod_pessoa = @codPessoa
        ORDER BY pc.data_registro DESC
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
        FROM dbo.Pessoa_Certificado pc
        WHERE pc.cod_pessoa = @codPessoa
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
      console.error('Erro ao buscar certificados:', error);
      throw error;
    }
  }

  static async buscarPorNome(nome, page = 1, limit = 10) {
    try {
      const pool = await poolPromise;
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          pc.cod_pessoa,
          p.nome,
          pc.tipo_certificado,
          pc.cod_escola,
          pc.cod_curso,
          pc.cod_disciplina,
          d.nome as nome_disciplina,
          pc.carga_horaria,
          pc.grade,
          pc.polo,
          FORMAT(pc.data_registro, 'dd/MM/yyyy') as data_registro,
          FORMAT(pc.data_inicio, 'dd/MM/yyyy') as data_inicio,
          FORMAT(pc.data_conclusao, 'dd/MM/yyyy') as data_conclusao,
          FORMAT(pc.data_emissao, 'dd/MM/yyyy') as data_emissao,
          pc.lote,
          pc.livro,
          pc.folha,
          pc.numero_registro,
          pc.cod_rastreamento,
          pc.retirado_por,
          pc.status,
          pc.observacao,
          pc.status_emissao,
          FORMAT(pc.data_solicitacao, 'dd/MM/yyyy') as data_solicitacao,
          FORMAT(pc.data_colacao_grau, 'dd/MM/yyyy') as data_colacao_grau,
          pc.nota_tcc
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
        LEFT JOIN dbo.Disciplina d ON pc.cod_disciplina = d.cod_disciplina
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, pc.data_registro DESC
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
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
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
      console.error('Erro ao buscar certificados por nome:', error);
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
        FROM dbo.Pessoa_Certificado pc
        INNER JOIN dbo.pessoa p ON pc.cod_pessoa = p.cod_pessoa
        WHERE p.nome LIKE @termo
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

