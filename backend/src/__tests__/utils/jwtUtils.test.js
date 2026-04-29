jest.mock('../../config/env', () => ({
  JWT_SECRET: 'test-secret-key-for-testing',
  BCRYPT_COST: 12,
}));

const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../../utils/jwtUtils');
const AppError = require('../../utils/AppError');

describe('jwtUtils', () => {
  const payload = { id: 1, email: 'test@example.com' };

  describe('generateToken', () => {
    test('string 타입의 토큰을 반환한다', () => {
      const token = generateToken(payload);
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    test('generateToken → verifyToken 왕복 시 payload가 보존된다', () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    test('성공 시 decoded payload에 id와 email이 포함된다', () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email');
    });

    test('만료된 토큰은 AppError(401, TOKEN_INVALID)를 throw한다', () => {
      const expiredToken = jwt.sign(payload, 'test-secret-key-for-testing', {
        algorithm: 'HS512',
        expiresIn: '0s',
      });

      expect(() => verifyToken(expiredToken)).toThrow(AppError);
      try {
        verifyToken(expiredToken);
      } catch (err) {
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('TOKEN_INVALID');
      }
    });

    test('위조된 토큰은 AppError(401, TOKEN_INVALID)를 throw한다', () => {
      const fakeToken = 'fake.token.value';

      expect(() => verifyToken(fakeToken)).toThrow(AppError);
      try {
        verifyToken(fakeToken);
      } catch (err) {
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('TOKEN_INVALID');
      }
    });
  });
});
