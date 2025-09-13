// Middleware global de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('Error Handler:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    user: req.user ? req.user.username : 'anonymous',
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    }
  });

  // Erro de validação do Express
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: err.message,
      details: err.errors
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'Formato JSON inválido no corpo da requisição'
    });
  }

  // Erro de conexão com banco de dados
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Serviço indisponível',
      message: 'Não foi possível conectar ao banco de dados'
    });
  }

  // Erro de timeout do banco de dados
  if (err.code === 'ETIMEOUT' || err.message.includes('timeout')) {
    return res.status(504).json({
      error: 'Timeout',
      message: 'Operação demorou muito para ser concluída'
    });
  }

  // Erro de SQL Server
  if (err.code && err.code.startsWith('E')) {
    return res.status(500).json({
      error: 'Erro de banco de dados',
      message: 'Erro interno do banco de dados'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autorização é inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'Token de autorização expirou'
    });
  }

  // Erro de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Muitas requisições',
      message: 'Rate limit excedido. Tente novamente mais tarde.'
    });
  }

  // Erro 404 - Rota não encontrada
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Rota não encontrada',
      message: 'O endpoint solicitado não existe'
    });
  }

  // Erro genérico do servidor
  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Algo deu errado. Tente novamente mais tarde.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para capturar rotas não encontradas
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Middleware para capturar erros assíncronos não tratados
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handler para erros não capturados globalmente
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', {
    timestamp: new Date().toISOString(),
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    }
  });
  
  // Em produção, você pode querer fazer graceful shutdown
  if (process.env.NODE_ENV === 'production') {
    console.log('Shutting down due to uncaught exception...');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', {
    timestamp: new Date().toISOString(),
    reason: reason,
    promise: promise
  });
  
  // Em produção, você pode querer fazer graceful shutdown
  if (process.env.NODE_ENV === 'production') {
    console.log('Shutting down due to unhandled rejection...');
    process.exit(1);
  }
});

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncErrorHandler
};

