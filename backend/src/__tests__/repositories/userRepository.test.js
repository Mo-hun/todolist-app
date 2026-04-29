jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    on: jest.fn(),
    end: jest.fn(),
  };
  const MockPool = jest.fn(() => mockPool);
  MockPool._mockPool = mockPool;
  return { Pool: MockPool };
});

jest.mock('../../config/env', () => ({
  POSTGRES_CONNECTION_STRING: 'postgresql://test:test@localhost:5432/testdb',
}));

const { Pool } = require('pg');
const mockPool = Pool._mockPool;
const userRepository = require('../../repositories/userRepository');

describe('userRepository', () => {
  describe('findByEmail', () => {
    it('결과가 있을 때 첫 번째 row를 반환한다', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashed', created_at: new Date() };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userRepository.findByEmail('test@example.com');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, email, password, created_at FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('결과가 없을 때 null을 반환한다', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userRepository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('결과가 있을 때 첫 번째 row를 반환한다', async () => {
      const mockUser = { id: 42, email: 'user@example.com', password: 'hashed', created_at: new Date() };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userRepository.findById(42);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, email, password, created_at FROM users WHERE id = $1',
        [42]
      );
      expect(result).toEqual(mockUser);
    });

    it('결과가 없을 때 null을 반환한다', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('INSERT를 실행하고 생성된 row를 반환한다', async () => {
      const mockCreated = { id: 10, email: 'new@example.com', created_at: new Date() };
      mockPool.query.mockResolvedValueOnce({ rows: [mockCreated] });

      const result = await userRepository.create({ email: 'new@example.com', password: 'hashed_pw' });

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
        ['new@example.com', 'hashed_pw']
      );
      expect(result).toEqual(mockCreated);
    });
  });

  describe('deleteById', () => {
    it('DELETE 쿼리를 실행한다', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await userRepository.deleteById(5);

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = $1',
        [5]
      );
    });
  });
});
