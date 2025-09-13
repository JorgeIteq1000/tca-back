const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

// POST /api/login - Autenticar usuário
router.post('/login', AuthController.login);

// POST /api/verify-token - Verificar token
router.post('/verify-token', AuthController.verifyToken);

// POST /api/logout - Logout
router.post('/logout', AuthController.logout);

module.exports = router;

