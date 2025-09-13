const morgan = require('morgan');

// Configuração personalizada do morgan para logging
const loggerFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Middleware de logging para desenvolvimento
const developmentLogger = morgan('dev');

// Middleware de logging para produção
const productionLogger = morgan(loggerFormat, {
  skip: function (req, res) {
    // Pular logs de health check em produção
    return req.url === '/api/health';
  }
});

// Middleware de logging customizado para capturar informações específicas
const customLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capturar informações do usuário se autenticado
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log personalizado
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user.username : 'anonymous',
      role: req.user ? req.user.role : null,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    };
    
    // Log apenas em caso de erro ou em desenvolvimento
    if (res.statusCode >= 400 || process.env.NODE_ENV === 'development') {
      console.log('API Request:', JSON.stringify(logData, null, 2));
    }
    
    // Log de erro detalhado
    if (res.statusCode >= 500) {
      console.error('Server Error:', {
        ...logData,
        body: req.body,
        query: req.query,
        params: req.params
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware para log de erros não capturados
const errorLogger = (err, req, res, next) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    user: req.user ? req.user.username : 'anonymous',
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    body: req.body,
    query: req.query,
    params: req.params
  };
  
  console.error('Unhandled Error:', JSON.stringify(errorData, null, 2));
  
  // Continuar para o próximo middleware de erro
  next(err);
};

// Middleware para log de tentativas de acesso não autorizado
const securityLogger = (req, res, next) => {
  // Log tentativas de acesso sem token
  if (!req.headers.authorization && req.url !== '/api/login' && req.url !== '/api/health' && req.url !== '/api/info') {
    console.warn('Unauthorized Access Attempt:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  }
  
  next();
};

module.exports = {
  developmentLogger,
  productionLogger,
  customLogger,
  errorLogger,
  securityLogger
};

