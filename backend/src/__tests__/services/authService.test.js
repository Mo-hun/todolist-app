jest.mock('../../repositories/userRepository');
jest.mock('../../utils/passwordUtils');
jest.mock('../../utils/jwtUtils');

const userRepository = require('../../repositories/userRepository');
const { hashPassword, comparePassword } = require('../../utils/passwordUtils');
const { generateToken } = require('../../utils/jwtUtils');
const AppError = require('../../utils/AppError');
const { register, login, withdraw } = require('../../services/authService');

describe('authService', () => {
  describe('register', () => {
    it('성공: 새 유저를 생성하고 반환한다', async () => {
      const mockUser = { id: 1, email: 'new@example.com', created_at: new Date() };
      userRepository.findByEmail.mockResolvedValueOnce(null);
      hashPassword.mockResolvedValueOnce('hashed_pw');
      userRepository.create.mockResolvedValueOnce(mockUser);

      const result = await register({ email: 'new@example.com', password: 'password123' });

      expect(userRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepository.create).toHaveBeenCalledWith({ email: 'new@example.com', password: 'hashed_pw' });
      expect(result).toEqual(mockUser);
    });

    it('중복 이메일: AppError(409, DUPLICATE_EMAIL)를 던진다', async () => {
      userRepository.findByEmail.mockResolvedValueOnce({ id: 1, email: 'exist@example.com' });

      await expect(register({ email: 'exist@example.com', password: 'password123' }))
        .rejects.toMatchObject({ statusCode: 409, code: 'DUPLICATE_EMAIL' });

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('성공: token과 user를 반환한다', async () => {
      const mockUser = { id: 2, email: 'user@example.com', password: 'hashed', created_at: new Date() };
      userRepository.findByEmail.mockResolvedValueOnce(mockUser);
      comparePassword.mockResolvedValueOnce(true);
      generateToken.mockReturnValueOnce('jwt_token');

      const result = await login({ email: 'user@example.com', password: 'password123' });

      expect(comparePassword).toHaveBeenCalledWith('password123', 'hashed');
      expect(generateToken).toHaveBeenCalledWith({ id: mockUser.id, email: mockUser.email });
      expect(result).toEqual({
        token: 'jwt_token',
        user: { id: mockUser.id, email: mockUser.email, created_at: mockUser.created_at },
      });
    });

    it('이메일 없음: AppError(401, INVALID_CREDENTIALS)를 던진다', async () => {
      userRepository.findByEmail.mockResolvedValueOnce(null);

      await expect(login({ email: 'nouser@example.com', password: 'password123' }))
        .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });

      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('비밀번호 틀림: AppError(401, INVALID_CREDENTIALS)를 던진다', async () => {
      const mockUser = { id: 3, email: 'user@example.com', password: 'hashed' };
      userRepository.findByEmail.mockResolvedValueOnce(mockUser);
      comparePassword.mockResolvedValueOnce(false);

      await expect(login({ email: 'user@example.com', password: 'wrongpass' }))
        .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });

      expect(generateToken).not.toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('성공: deleteById를 호출하고 void를 반환한다', async () => {
      const mockUser = { id: 4, email: 'user@example.com', password: 'hashed' };
      userRepository.findById.mockResolvedValueOnce(mockUser);
      comparePassword.mockResolvedValueOnce(true);
      userRepository.deleteById.mockResolvedValueOnce(undefined);

      const result = await withdraw(4, 'password123');

      expect(userRepository.findById).toHaveBeenCalledWith(4);
      expect(comparePassword).toHaveBeenCalledWith('password123', 'hashed');
      expect(userRepository.deleteById).toHaveBeenCalledWith(4);
      expect(result).toBeUndefined();
    });

    it('유저 없음: AppError(404, NOT_FOUND)를 던진다', async () => {
      userRepository.findById.mockResolvedValueOnce(null);

      await expect(withdraw(999, 'password123'))
        .rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });

      expect(comparePassword).not.toHaveBeenCalled();
      expect(userRepository.deleteById).not.toHaveBeenCalled();
    });

    it('비밀번호 틀림: AppError(401, INVALID_CREDENTIALS)를 던진다', async () => {
      const mockUser = { id: 5, email: 'user@example.com', password: 'hashed' };
      userRepository.findById.mockResolvedValueOnce(mockUser);
      comparePassword.mockResolvedValueOnce(false);

      await expect(withdraw(5, 'wrongpass'))
        .rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });

      expect(userRepository.deleteById).not.toHaveBeenCalled();
    });
  });
});
