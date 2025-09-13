const sql = require('mssql');
require('dotenv').config();

// Configuração da conexão com SQL Server
const dbConfig = {
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS01',
  database: process.env.DB_DATABASE || 'GEO_ITEQLESTE',
  user: process.env.DB_USER || 'tca_user',
  password: process.env.DB_PASSWORD || 'tca123',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // Para conexões locais
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Log da configuração (sem senha)
console.log('🔧 Configuração do Banco de Dados:');
console.log(`   Servidor: ${dbConfig.server}`);
console.log(`   Porta: ${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   Usuário: ${dbConfig.user}`);
console.log(`   Encrypt: ${dbConfig.options.encrypt}`);

// Pool de conexões global
let poolPromise;

const getPool = () => {
  if (!poolPromise) {
    console.log('🔄 Tentando conectar ao SQL Server...');
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then(pool => {
        console.log('✅ Conectado ao SQL Server com sucesso!');
        console.log(`   Database: ${dbConfig.database}`);
        console.log(`   Servidor: ${dbConfig.server}:${dbConfig.port}`);
        return pool;
      })
      .catch(err => {
        console.error('❌ ERRO ao conectar ao SQL Server:');
        console.error(`   Servidor: ${dbConfig.server}:${dbConfig.port}`);
        console.error(`   Database: ${dbConfig.database}`);
        console.error(`   Usuário: ${dbConfig.user}`);
        console.error(`   Erro: ${err.message}`);
        
        // Sugestões de solução
        console.error('\n💡 Possíveis soluções:');
        console.error('   1. Verifique se o SQL Server está rodando');
        console.error('   2. Confirme o nome do servidor/instância');
        console.error('   3. Verifique se a porta 1433 está aberta');
        console.error('   4. Confirme as credenciais de acesso');
        console.error('   5. Verifique se o banco de dados existe');
        
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

// Função para testar a conexão
const testConnection = async () => {
  try {
    console.log('🧪 Testando conexão com o banco de dados...');
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 as test');
    console.log('✅ Teste de conexão bem-sucedido!');
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão:', error.message);
    return false;
  }
};

// Função para executar queries
const executeQuery = async (query, params = []) => {
  try {
    console.log(`🔍 Executando query: ${query.substring(0, 100)}...`);
    const pool = await getPool();
    const request = pool.request();
    
    // Adicionar parâmetros se fornecidos
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
      console.log(`   Parâmetros: ${params.length} fornecidos`);
    }
    
    const result = await request.query(query);
    console.log(`✅ Query executada com sucesso. Registros: ${result.recordset ? result.recordset.length : 0}`);
    return result;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error.message);
    console.error(`   Query: ${query.substring(0, 200)}...`);
    throw error;
  }
};

// Função para executar queries com parâmetros nomeados
const executeQueryWithNamedParams = async (query, params = {}) => {
  try {
    console.log(`🔍 Executando query com parâmetros nomeados: ${query.substring(0, 100)}...`);
    const pool = await getPool();
    const request = pool.request();
    
    // Adicionar parâmetros nomeados
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
      console.log(`   Parâmetro ${key}: ${params[key]}`);
    });
    
    const result = await request.query(query);
    console.log(`✅ Query executada com sucesso. Registros: ${result.recordset ? result.recordset.length : 0}`);
    return result;
  } catch (error) {
    console.error('❌ Erro ao executar query com parâmetros nomeados:', error.message);
    console.error(`   Query: ${query.substring(0, 200)}...`);
    console.error(`   Parâmetros:`, params);
    throw error;
  }
};

// Função para fechar o pool de conexões
const closePool = async () => {
  try {
    if (poolPromise) {
      const pool = await poolPromise;
      await pool.close();
      poolPromise = null;
      console.log('🔒 Pool de conexões fechado');
    }
  } catch (error) {
    console.error('❌ Erro ao fechar pool de conexões:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Fechando conexões com o banco de dados...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Fechando conexões com o banco de dados...');
  await closePool();
  process.exit(0);
});

module.exports = {
  sql,
  getPool,
  executeQuery,
  executeQueryWithNamedParams,
  closePool,
  testConnection
};

