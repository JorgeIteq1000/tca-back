const { executeQuery, executeQueryWithNamedParams } = require('../config/database');

class Pessoa {
  // Buscar pessoas por nome ou código (para sugestões)
  static async searchSuggestions(searchTerm) {
    // LOG: Corrigindo a consulta para buscar por código como texto, sem alterar os nomes das colunas.
    const query = `
      SELECT TOP 10 cod_pessoa, nome 
      FROM dbo.pessoa 
      WHERE nome LIKE @searchTerm OR CAST(cod_pessoa AS VARCHAR) LIKE @searchTerm
      ORDER BY nome
    `;
    
    const params = {
      searchTerm: `%${searchTerm}%`
    };
    
    try {
      const result = await executeQueryWithNamedParams(query, params);
      // LOG: Este mapeamento agora funcionará, pois a coluna 'cod_pessoa' existe no resultado.
      return result.recordset.map(row => ({
        id: row.cod_pessoa,
        nome: row.nome
      }));
    } catch (error) {
      console.error('Erro ao buscar sugestões de pessoas:', error);
      throw error;
    }
  }


  // Buscar pessoa por código
  static async findById(codPessoa) {
    const query = `
      SELECT cod_pessoa, nome, Sexo, endereco_residencial, bairro_residencial, 
             cidade_residencial, estado_residencial, cep_residencial, 
             fone_residencial, celular, email, rg, cpf_cnpj, nascimento_data 
      FROM dbo.pessoa 
      WHERE cod_pessoa = @codPessoa
    `;
    
    const params = {
      codPessoa: codPessoa
    };
    
    try {
      const result = await executeQueryWithNamedParams(query, params);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Erro ao buscar pessoa por ID:', error);
      throw error;
    }
  }

  // Buscar pessoas por nome (com paginação)
  static async findByName(searchTerm, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const query = `
      SELECT cod_pessoa, nome, Sexo, endereco_residencial, bairro_residencial, 
             cidade_residencial, estado_residencial, cep_residencial, 
             fone_residencial, celular, email, rg, cpf_cnpj, nascimento_data 
      FROM dbo.pessoa 
      WHERE nome LIKE @searchTerm
      ORDER BY nome
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM dbo.pessoa 
      WHERE nome LIKE @searchTerm
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
      console.error('Erro ao buscar pessoas por nome:', error);
      throw error;
    }
  }

  // Listar todas as pessoas (com paginação)
  static async findAll(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const query = `
      SELECT cod_pessoa, nome, Sexo, endereco_residencial, bairro_residencial, 
             cidade_residencial, estado_residencial, cep_residencial, 
             fone_residencial, celular, email, rg, cpf_cnpj, nascimento_data 
      FROM dbo.pessoa 
      ORDER BY nome
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    
    const countQuery = `SELECT COUNT(*) as total FROM dbo.pessoa`;
    
    const params = {
      offset: offset,
      pageSize: pageSize
    };
    
    try {
      const [dataResult, countResult] = await Promise.all([
        executeQueryWithNamedParams(query, params),
        executeQuery(countQuery)
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
      console.error('Erro ao listar pessoas:', error);
      throw error;
    }
  }

  // Verificar se pessoa existe
  static async exists(codPessoa) {
    const query = `
      SELECT COUNT(*) as count 
      FROM dbo.pessoa 
      WHERE cod_pessoa = @codPessoa
    `;
    
    const params = {
      codPessoa: codPessoa
    };
    
    try {
      const result = await executeQueryWithNamedParams(query, params);
      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar existência da pessoa:', error);
      throw error;
    }
  }
}

module.exports = Pessoa;

