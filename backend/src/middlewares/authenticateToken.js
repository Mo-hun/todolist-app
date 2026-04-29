const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('인증 토큰이 필요합니다.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS512'] });
    req.user = { id: decoded.id, email: decoded.email };
    return next();
  } catch (err) {
    return next(new AppError('유효하지 않은 토큰입니다.', 401, 'TOKEN_INVALID'));
  }
}

module.exports = authenticateToken;
