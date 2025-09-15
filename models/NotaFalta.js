const { sql, getPool } = require('../config/database');

class NotaFalta {
  static async findAll(page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          nf.matricula_aluno,
          p.nome,
          nf.media_final,
          nf.cod_turma,
          t.cod_curso,
          c.nome as nome_curso,
          nf.cod_disciplina,
          d.nome as nome_disciplina,
          nf.situacao
        FROM dbo.NotaFalta nf
        INNER JOIN dbo.pessoa p ON nf.matricula_aluno = p.cod_pessoa
        JOIN dbo.Disciplina d ON nf.cod_disciplina = d.cod_disciplina
        JOIN dbo.Turma t ON nf.cod_turma = t.cod_turma
        JOIN dbo.Curso c ON t.cod_curso = c.cod_curso
        ORDER BY p.nome, c.nome, d.nome
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;

      const countQuery = `SELECT COUNT(*) as total FROM dbo.NotaFalta`;
      
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
      console.error('Erro ao buscar todas as notas/faltas:', error);
      throw error;
    }
  }

  static async buscarPorPessoa(codPessoa, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          nf.matricula_aluno, p.nome, nf.media_final, nf.cod_turma,
          t.cod_curso, c.nome as nome_curso, nf.cod_disciplina,
          d.nome as nome_disciplina, nf.situacao
        FROM dbo.NotaFalta nf
        INNER JOIN dbo.pessoa p ON nf.matricula_aluno = p.cod_pessoa
        JOIN dbo.Disciplina d ON nf.cod_disciplina = d.cod_disciplina
        JOIN dbo.Turma t ON nf.cod_turma = t.cod_turma
        JOIN dbo.Curso c ON t.cod_curso = c.cod_curso
        WHERE p.cod_pessoa = @codPessoa
        ORDER BY c.nome, d.nome
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM dbo.NotaFalta nf
        WHERE nf.matricula_aluno = @codPessoa
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
      console.error('Erro ao buscar notas/faltas:', error);
      throw error;
    }
  }

  static async buscarPorNome(nome, page = 1, limit = 10) {
    try {
      const pool = await getPool();
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT 
          nf.matricula_aluno, p.nome, nf.media_final, nf.cod_turma,
          t.cod_curso, c.nome as nome_curso, nf.cod_disciplina,
          d.nome as nome_disciplina, nf.situacao
        FROM dbo.NotaFalta nf
        INNER JOIN dbo.pessoa p ON nf.matricula_aluno = p.cod_pessoa
        JOIN dbo.Disciplina d ON nf.cod_disciplina = d.cod_disciplina
        JOIN dbo.Turma t ON nf.cod_turma = t.cod_turma
        JOIN dbo.Curso c ON t.cod_curso = c.cod_curso
        WHERE p.nome LIKE @nome
        ORDER BY p.nome, c.nome, d.nome
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM dbo.NotaFalta nf
        INNER JOIN dbo.pessoa p ON nf.matricula_aluno = p.cod_pessoa
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
      console.error('Erro ao buscar notas/faltas por nome:', error);
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
        FROM dbo.NotaFalta nf
        INNER JOIN dbo.pessoa p ON nf.matricula_aluno = p.cod_pessoa
        WHERE p.nome LIKE @termo OR CAST(p.cod_pessoa AS VARCHAR) LIKE @termo
        ORDER BY p.nome
      `;
      
      const result = await pool.request()
        .input('termo', sql.VarChar, `%${termo}%`)
        .query(query);
      
      return result.recordset;
    } catch (error) {
      console.error('Erro ao obter sugestões de notas/faltas:', error);
      throw error;
    }
  }
}

module.exports = NotaFalta;