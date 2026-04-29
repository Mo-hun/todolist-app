const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');

jest.mock('../../config/env', () => ({ JWT_SECRET: 'test-secret' }));

const authenticateToken = require('../../middlewares/authenticateToken');

function makeReqResNext(headers = {}) {
  const req = { headers };
  const res = {};
  const next = jest.fn();
  return { req, res, next };
}

describe('authenticateToken 미들웨어', () => {
  it('Authorization 헤더가 없으면 next(AppError(401, UNAUTHORIZED))를 호출해야 한다', () => {
    const { req, res, next } = makeReqResNext();
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it("Authorization 헤더가 'Bearer '로 시작하지 않으면 401 UNAUTHORIZED를 호출해야 한다", () => {
    const { req, res, next } = makeReqResNext({ authorization: 'Token sometoken' });
    authenticateToken(req, res, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('유효한 토큰이면 req.user = { id, email }을 주입하고 next()를 호출해야 한다', () => {
    const payload = { id: 1, email: 'test@example.com', role: 'user' };
    const token = jwt.sign(payload, 'test-secret', { algorithm: 'HS512', expiresIn: '1h' });
    const { req, res, next } = makeReqResNext({ authorization: `Bearer ${token}` });
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ id: 1, email: 'test@example.com' });
  });

  it('req.user에 id와 email만 포함되어야 한다', () => {
    const payload = { id: 2, email: 'user@example.com', role: 'admin', extra: 'data' };
    const token = jwt.sign(payload, 'test-secret', { algorithm: 'HS512', expiresIn: '1h' });
    const { req, res, next } = makeReqResNext({ authorization: `Bearer ${token}` });
    authenticateToken(req, res, next);
    expect(Object.keys(req.user)).toEqual(['id', 'email']);
  });

  it('만료된 토큰이면 next(AppError(401, TOKEN_INVALID))를 호출해야 한다', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = jwt.sign(payload, 'test-secret', { algorithm: 'HS512', expiresIn: '-1s' });
    const { req, res, next } = makeReqResNext({ authorization: `Bearer ${token}` });
    authenticateToken(req, res, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('TOKEN_INVALID');
  });

  it('위조된 토큰이면 next(AppError(401, TOKEN_INVALID))를 호출해야 한다', () => {
    const token = 'Bearer invalid.token.value';
    const { req, res, next } = makeReqResNext({ authorization: token });
    authenticateToken(req, res, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('TOKEN_INVALID');
  });
});
