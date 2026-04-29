const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');
const AppError = require('../utils/AppError');
const { HTTP_STATUS, ERROR_CODE } = require('../utils/constants');

async function register({ email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError('이미 사용 중인 이메일입니다.', HTTP_STATUS.CONFLICT, ERROR_CODE.DUPLICATE_EMAIL);
  }
  const hashed = await hashPassword(password);
  const user = await userRepository.create({ email, password: hashed });
  return user;
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.INVALID_CREDENTIALS);
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.INVALID_CREDENTIALS);
  }
  const token = generateToken({ id: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, created_at: user.created_at } };
}

async function withdraw(userId, password) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('사용자를 찾을 수 없습니다.', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new AppError('비밀번호가 올바르지 않습니다.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.INVALID_CREDENTIALS);
  }
  await userRepository.deleteById(userId);
}

module.exports = { register, login, withdraw };
