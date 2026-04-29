const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(`요청한 경로를 찾을 수 없습니다: ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

module.exports = notFound;
