jest.mock('../../services/authService');

const authService = require('../../services/authService');
const { register, login, withdraw } = require('../../controllers/authController');
const AppError = require('../../utils/AppError');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authController', () => {
  describe('register', () => {
    it('성공: authService.register를 호출하고 201을 응답한다', async () => {
      const mockUser = { id: 1, email: 'test@example.com', created_at: new Date() };
      authService.register.mockResolvedValueOnce(mockUser);

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = mockRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { user: mockUser } });
      expect(next).not.toHaveBeenCalled();
    });

    it('이메일 누락: next(AppError(400))를 호출한다', async () => {
      const req = { body: { password: 'password123' } };
      const res = mockRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('body가 없을 때: next(AppError(400))를 호출한다', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
    });

    it('비밀번호 누락: next(AppError(400))를 호출한다', async () => {
      const req = { body: { email: 'test@example.com' } };
      const res = mockRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('잘못된 이메일 형식: next(AppError(400))를 호출한다', async () => {
      const req = { body: { email: 'invalid-email', password: 'password123' } };
      const res = mockRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('비밀번호 8자 미만: next(AppError(400))를 호출한다', async () => {
      const req = { body: { email: 'test@example.com', password: 'short' } };
      const res = mockRes();
      const next = jest.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('service 에러 발생 시 next(err)를 호출한다', async () => {
      const serviceError = new AppError('이미 사용 중인 이메일입니다.', 409, 'DUPLICATE_EMAIL');
      authService.register.mockRejectedValueOnce(serviceError);

      const req = { body: { email: 'exist@example.com', password: 'password123' } };
      const res = mockRes();
      const next = jest.fn();

      await register(req, res, next).catch((err) => next(err));

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('login', () => {
    it('성공: authService.login을 호출하고 200을 응답한다', async () => {
      const mockResult = { token: 'jwt_token', user: { id: 1, email: 'test@example.com' } };
      authService.login.mockResolvedValueOnce(mockResult);

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = mockRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockResult });
      expect(next).not.toHaveBeenCalled();
    });

    it('이메일 누락: next(AppError(400))를 호출한다', async () => {
      const req = { body: { password: 'password123' } };
      const res = mockRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('body가 없을 때: next(AppError(400))를 호출한다', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
    });

    it('비밀번호 누락: next(AppError(400))를 호출한다', async () => {
      const req = { body: { email: 'test@example.com' } };
      const res = mockRes();
      const next = jest.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('service 에러 발생 시 next(err)를 호출한다', async () => {
      const serviceError = new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
      authService.login.mockRejectedValueOnce(serviceError);

      const req = { body: { email: 'test@example.com', password: 'wrongpass' } };
      const res = mockRes();
      const next = jest.fn();

      await login(req, res, next).catch((err) => next(err));

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('withdraw', () => {
    it('성공: authService.withdraw를 호출하고 200을 응답한다', async () => {
      authService.withdraw.mockResolvedValueOnce(undefined);

      const req = { body: { password: 'password123' }, user: { id: 7 } };
      const res = mockRes();
      const next = jest.fn();

      await withdraw(req, res, next);

      expect(authService.withdraw).toHaveBeenCalledWith(7, 'password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { message: '회원탈퇴가 완료되었습니다.' } });
      expect(next).not.toHaveBeenCalled();
    });

    it('비밀번호 누락: next(AppError(400))를 호출한다', async () => {
      const req = { body: {}, user: { id: 7 } };
      const res = mockRes();
      const next = jest.fn();

      await withdraw(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
      expect(authService.withdraw).not.toHaveBeenCalled();
    });

    it('body가 없을 때: next(AppError(400))를 호출한다', async () => {
      const req = { user: { id: 7 } };
      const res = mockRes();
      const next = jest.fn();

      await withdraw(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code: 'VALIDATION_ERROR' }));
    });

    it('service 에러 발생 시 next(err)를 호출한다', async () => {
      const serviceError = new AppError('비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
      authService.withdraw.mockRejectedValueOnce(serviceError);

      const req = { body: { password: 'wrongpass' }, user: { id: 7 } };
      const res = mockRes();
      const next = jest.fn();

      await withdraw(req, res, next).catch((err) => next(err));

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
});
