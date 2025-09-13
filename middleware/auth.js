const jwt = require('jsonwebtoken');

// Middleware de autenticação JWT
const authMiddleware = (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Header Authorization é obrigatório'
      });
    }
    
    // Verificar se o header está no formato correto (Bearer token)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de autorização é obrigatório'
      });
    }
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tca_jwt_secret_key_2025');
    
    // Adicionar informações do usuário ao request
    req.user = {
      username: decoded.username,
      role: decoded.role,
      iat: decoded.iat
    };
    
    // Continuar para o próximo middleware/rota
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de autorização é inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Token de autorização expirou. Faça login novamente.'
      });
    }
    
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível verificar a autenticação'
    });
  }
};

// Middleware para verificar role de admin
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'Autenticação é obrigatória'
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Apenas administradores podem acessar este recurso'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível verificar as permissões'
    });
  }
};

// Middleware opcional de autenticação (não retorna erro se não autenticado)
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tca_jwt_secret_key_2025');
    
    req.user = {
      username: decoded.username,
      role: decoded.role,
      iat: decoded.iat
    };
    
    next();
    
  } catch (error) {
    // Em caso de erro, continuar sem autenticação
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken: authMiddleware,
  requireAdmin: adminMiddleware,
  optionalAuth: optionalAuthMiddleware
};

