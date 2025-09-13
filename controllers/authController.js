const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController {
  // POST /api/login - Autenticar usuário
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Validação básica
      if (!username || !password) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'Username e password são obrigatórios'
        });
      }
      
      // Verificar credenciais (baseado no código Python original)
      let userRole = null;
      
      if (username === 'tca' && password === 'iteq@2025!!') {
        userRole = 'user';
      } else if (username === 'tcaf' && password === 'iteq@2025') {
        userRole = 'admin';
      }
      
      if (!userRole) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Username ou password incorretos'
        });
      }
      
      // Gerar token JWT
      const token = jwt.sign(
        { 
          username: username,
          role: userRole,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || 'tca_jwt_secret_key_2025',
        { 
          expiresIn: '24h' // Token expira em 24 horas
        }
      );
      
      res.json({
        success: true,
        token: token,
        role: userRole,
        username: username,
        message: 'Login realizado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível realizar o login'
      });
    }
  }

  // POST /api/verify-token - Verificar se token é válido
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          error: 'Token não fornecido',
          message: 'Token de autorização é obrigatório'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tca_jwt_secret_key_2025');
      
      res.json({
        valid: true,
        user: {
          username: decoded.username,
          role: decoded.role
        }
      });
      
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
          message: 'Token de autorização expirou'
        });
      }
      
      console.error('Erro na verificação do token:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível verificar o token'
      });
    }
  }

  // POST /api/logout - Logout (invalidar token no frontend)
  static async logout(req, res) {
    try {
      // Como estamos usando JWT stateless, o logout é feito no frontend
      // removendo o token do localStorage/sessionStorage
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: 'Não foi possível realizar o logout'
      });
    }
  }
}

module.exports = AuthController;

