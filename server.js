const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Importar configuração do banco de dados
const { testConnection } = require('./config/database');

// Importar middlewares
const { 
  developmentLogger, 
  productionLogger, 
  customLogger, 
  errorLogger, 
  securityLogger 
} = require('./middleware/logger');

const { 
  generalLimiter, 
  loginLimiter, 
  createOccurrenceLimiter, 
  searchLimiter 
} = require('./middleware/rateLimiter');

const { 
  errorHandler, 
  notFoundHandler 
} = require('./middleware/errorHandler');

// Importar rotas
const routes = require('./routes');

// Criar aplicação Express
const app = express();

// Configurações básicas
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Iniciando Portal TCA Web Backend...');
console.log(`📍 Ambiente: ${NODE_ENV}`);
console.log(`📍 Porta: ${PORT}`);

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuração CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      // Adicionar domínios de produção aqui
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️ Origem não permitida pelo CORS: ${origin}`);
      callback(null, true); // Permitir temporariamente para desenvolvimento
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
if (NODE_ENV === 'development') {
  app.use(developmentLogger);
} else {
  app.use(productionLogger);
}

// Middleware de rate limiting
app.use('/api/login', loginLimiter);
app.use('/api/ocorrencias', createOccurrenceLimiter);
app.use('/api', generalLimiter);

// Middleware customizado de logging
app.use(customLogger);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Testar conexão com banco de dados
    const dbStatus = await testConnection();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: dbStatus ? 'Connected' : 'Disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: 'Error',
      error: error.message,
      uptime: process.uptime()
    });
  }
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Portal TCA Web API',
    version: '2.0.0',
    description: 'Sistema de Gestão Acadêmica - API RESTful',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/login',
      health: '/api/health',
      pessoa: '/api/pessoa',
      documento: '/api/documento',
      ocorrencia: '/api/ocorrencia',
      certificado: '/api/certificado',
      notafalta: '/api/notafalta',
      requerimento: '/api/requerimento',
      matricula: '/api/matricula',
      financeiro: '/api/financeiro',
      buscarTudo: '/api/buscar-tudo'
    }
  });
});

// Rotas da API
app.use('/api', routes);

// Middleware de tratamento de rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// Função para inicializar o servidor
const startServer = async () => {
  try {
    console.log('🔧 Verificando conexão com banco de dados...');
    
    // Testar conexão com banco de dados na inicialização
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      console.log('✅ Banco de dados conectado com sucesso!');
    } else {
      console.log('⚠️ Falha na conexão com banco de dados, mas servidor continuará rodando...');
    }
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 TCA SaaS Backend iniciado com sucesso!');
      console.log(`📍 Servidor rodando em: http://0.0.0.0:${PORT}`);
      console.log(`🌍 Ambiente: ${NODE_ENV}`);
      console.log(`📊 Health Check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`📖 API Info: http://0.0.0.0:${PORT}/api/info`);
      console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Recebido sinal ${signal}. Iniciando shutdown graceful...`);
      
      server.close(() => {
        console.log('🔒 Servidor HTTP fechado.');
        
        // Fechar conexões com banco de dados
        const { closePool } = require('./config/database');
        closePool().then(() => {
          console.log('🔒 Conexões com banco de dados fechadas.');
          process.exit(0);
        }).catch((err) => {
          console.error('❌ Erro ao fechar conexões com banco de dados:', err);
          process.exit(1);
        });
      });
      
      // Forçar shutdown após 10 segundos
      setTimeout(() => {
        console.error('⏰ Forçando shutdown após timeout...');
        process.exit(1);
      }, 10000);
    };

    // Capturar sinais de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

// Inicializar servidor apenas se não estiver sendo importado
if (require.main === module) {
  startServer();
}

// Exportar app para testes
module.exports = app;

