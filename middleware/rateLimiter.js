const rateLimit = require('express-rate-limit');

// Rate limiter geral para todas as rotas
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP por janela
  message: {
    error: 'Muitas requisições',
    message: 'Muitas requisições feitas por este IP. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skip: (req) => {
    // Pular rate limiting para health check
    return req.url === '/api/health';
  }
});

// Rate limiter mais restritivo para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP por janela
  message: {
    error: 'Muitas tentativas de login',
    message: 'Muitas tentativas de login falharam. Tente novamente em 15 minutos.',
    retryAfter: 900 // 15 minutos em segundos
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar requests bem-sucedidos
  skipFailedRequests: false // Contar requests que falharam
});

// Rate limiter para criação de ocorrências
const createOccurrenceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 criações por IP por minuto
  message: {
    error: 'Muitas criações de ocorrência',
    message: 'Muitas ocorrências criadas. Aguarde um minuto antes de criar outra.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para busca/sugestões
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // máximo 60 buscas por IP por minuto
  message: {
    error: 'Muitas buscas',
    message: 'Muitas buscas realizadas. Aguarde um minuto.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware personalizado para rate limiting baseado em usuário autenticado
const userBasedLimiter = (windowMs = 15 * 60 * 1000, max = 200) => {
  const userLimits = new Map();
  
  return (req, res, next) => {
    const identifier = req.user ? req.user.username : req.ip;
    const now = Date.now();
    
    if (!userLimits.has(identifier)) {
      userLimits.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    const userLimit = userLimits.get(identifier);
    
    // Reset se a janela expirou
    if (now > userLimit.resetTime) {
      userLimits.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    // Verificar se excedeu o limite
    if (userLimit.count >= max) {
      const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
      
      res.set({
        'RateLimit-Limit': max,
        'RateLimit-Remaining': 0,
        'RateLimit-Reset': new Date(userLimit.resetTime).toISOString(),
        'Retry-After': retryAfter
      });
      
      return res.status(429).json({
        error: 'Rate limit excedido',
        message: `Muitas requisições. Tente novamente em ${retryAfter} segundos.`,
        retryAfter: retryAfter
      });
    }
    
    // Incrementar contador
    userLimit.count++;
    userLimits.set(identifier, userLimit);
    
    // Adicionar headers informativos
    res.set({
      'RateLimit-Limit': max,
      'RateLimit-Remaining': max - userLimit.count,
      'RateLimit-Reset': new Date(userLimit.resetTime).toISOString()
    });
    
    next();
  };
};

// Limpeza periódica do cache de rate limiting baseado em usuário
setInterval(() => {
  // Esta implementação é simplificada. Em produção, considere usar Redis
  console.log('Rate limiter cache cleanup executado');
}, 60 * 60 * 1000); // Limpeza a cada hora

module.exports = {
  generalLimiter,
  loginLimiter,
  createOccurrenceLimiter,
  searchLimiter,
  userBasedLimiter
};

