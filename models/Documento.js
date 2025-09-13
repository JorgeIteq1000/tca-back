const { executeQueryWithNamedParams } = require('../config/database');

class Documento {
  // Mapeamento de códigos de documento para nomes legíveis
  static getDocumentName(codDocumento) {
    const documentMap = {
      '1': '1_RG',
      '2': '2_CPF',
      '3': '3_titulo_eleitor',
      '4': '4_reservista',
      '5': '5_cert_nascimento/casamento',
      '6': '6_comprov_end',
      '7': '7_hist_ens_med',
      '8': '8_hist_1grad',
      '9': '9_diploma_1grad',
      '10': '10_art_pub_1',
      '11': '11_art_conc_pos',
      '12': '12_art_conc_2licenc',
      '13': '13_estagio',
      '101': '101_art_pub_2',
      '102': '102_art_pub_3',
      '103': '103_art_pub_4',
      '104': '104_art_pub_5',
      '105': '105_art_pub_6',
      '106': '106_art_conc_pos2',
      '107': '107_art_conc_pos3'
    };
    
    return documentMap[codDocumento] || codDocumento;
  }

  // Buscar sugestões de pessoas com documentos
  static async searchSuggestions(searchTerm) {
    const query = `
      SELECT DISTINCT TOP 10 pd.cod_pessoa, p.nome AS nome_pessoa 
      FROM dbo.PessoaDocumento pd 
      INNER JOIN dbo.pessoa p ON pd.cod_pessoa = p.cod_pessoa 
      WHERE p.nome LIKE @searchTerm OR pd.cod_pessoa LIKE @searchTerm
      ORDER BY p.nome
    `;
    
    const params = {
      searchTerm: `%${searchTerm}%`
    };
    
    try {
      const result = await executeQueryWithNamedParams(query, params);
      return result.recordset.map(row => ({
        id: row.cod_pessoa,
        nome: row.nome_pessoa
      }));
    } catch (error) {
      console.error('Erro ao buscar sugestões de documentos:', error);
      throw error;
    }
  }

  // Buscar documentos por código da pessoa
  static async findByPersonId(codPessoa) {
    const query = `
      SELECT pd.cod_pessoa, p.nome AS nome_pessoa, pd.cod_documento, 
             CASE WHEN pd.status = 'P' THEN 'Pendente' ELSE 'Entregue' END as status, 
             FORMAT(pd.data_entrega, 'dd/MM/yyyy') as data_entrega 
      FROM dbo.PessoaDocumento pd 
      INNER JOIN dbo.pessoa p ON pd.cod_pessoa = p.cod_pessoa 
      WHERE pd.cod_pessoa = @codPessoa 
      ORDER BY pd.data_entrega ASC
    `;
    
    const params = {
      codPessoa: codPessoa
    };
    
    try {
      const result = await executeQueryWithNamedParams(query, params);
      return result.recordset.map(row => ({
        ...row,
        nome_documento: this.getDocumentName(row.cod_documento)
      }));
    } catch (error) {
      console.error('Erro ao buscar documentos por pessoa:', error);
      throw error;
    }
  }

  // Buscar documentos por nome da pessoa (com paginação)
  static async findByPersonName(searchTerm, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const query = `
      SELECT pd.cod_pessoa, p.nome AS nome_pessoa, pd.cod_documento, 
             CASE WHEN pd.status = 'P' THEN 'Pendente' ELSE 'Entregue' END as status, 
             FORMAT(pd.data_entrega, 'dd/MM/yyyy') as data_entrega 
      FROM dbo.PessoaDocumento pd 
      INNER JOIN dbo.pessoa p ON pd.cod_pessoa = p.cod_pessoa 
      WHERE p.nome LIKE @searchTerm 
      ORDER BY pd.data_entrega ASC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM dbo.PessoaDocumento pd 
      INNER JOIN dbo.pessoa p ON pd.cod_pessoa = p.cod_pessoa 
      WHERE p.nome LIKE @searchTerm
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
      
      const data = dataResult.recordset.map(row => ({
        ...row,
        nome_documento: this.getDocumentName(row.cod_documento)
      }));
      
      return {
        data: data,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalPages: totalPages,
          totalRecords: total
        }
      };
    } catch (error) {
      console.error('Erro ao buscar documentos por nome da pessoa:', error);
      throw error;
    }
  }

  // Listar todos os documentos (com paginação)
  static async findAll(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    const query = `
      SELECT pd.cod_pessoa, p.nome AS nome_pessoa, pd.cod_documento, 
             CASE WHEN pd.status = 'P' THEN 'Pendente' ELSE 'Entregue' END as status, 
             FORMAT(pd.data_entrega, 'dd/MM/yyyy') as data_entrega 
      FROM dbo.PessoaDocumento pd 
      INNER JOIN dbo.pessoa p ON pd.cod_pessoa = p.cod_pessoa 
      ORDER BY p.nome, pd.data_entrega ASC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM dbo.PessoaDocumento pd 
      INNER JOIN dbo.pessoa p ON pd.cod_pessoa = p.cod_pessoa
    `;
    
    const params = {
      offset: offset,
      pageSize: pageSize
    };
    
    try {
      const [dataResult, countResult] = await Promise.all([
        executeQueryWithNamedParams(query, params),
        executeQueryWithNamedParams(countQuery, {})
      ]);
      
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / pageSize);
      
      const data = dataResult.recordset.map(row => ({
        ...row,
        nome_documento: this.getDocumentName(row.cod_documento)
      }));
      
      return {
        data: data,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalPages: totalPages,
          totalRecords: total
        }
      };
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      throw error;
    }
  }
}

module.exports = Documento;

