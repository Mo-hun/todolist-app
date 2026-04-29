const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('./AppError');

function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS512',
    expiresIn: '24h',
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS512'] });
  } catch {
    throw new AppError('유효하지 않은 토큰입니다.', 401, 'TOKEN_INVALID');
  }
}

module.exports = { generateToken, verifyToken };
