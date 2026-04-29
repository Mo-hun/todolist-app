const authService = require('../services/authService');
const { sendSuccess } = require('../utils/responseHelper');
const { HTTP_STATUS, ERROR_CODE } = require('../utils/constants');
const AppError = require('../utils/AppError');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return next(new AppError('이메일과 비밀번호를 입력해주세요.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }
  if (!isValidEmail(email)) {
    return next(new AppError('유효한 이메일 형식을 입력해주세요.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }
  if (password.length < 8) {
    return next(new AppError('비밀번호는 최소 8자 이상이어야 합니다.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }
  const user = await authService.register({ email, password });
  return sendSuccess(res, user, HTTP_STATUS.CREATED);
}

async function login(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return next(new AppError('이메일과 비밀번호를 입력해주세요.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }
  const result = await authService.login({ email, password });
  return sendSuccess(res, result);
}

async function withdraw(req, res, next) {
  const { password } = req.body || {};
  if (!password) {
    return next(new AppError('비밀번호를 입력해주세요.', HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR));
  }
  await authService.withdraw(req.user.id, password);
  return sendSuccess(res, { message: '회원탈퇴가 완료되었습니다.' });
}

module.exports = { register, login, withdraw };
