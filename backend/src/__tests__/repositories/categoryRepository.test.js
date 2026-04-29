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
const categoryRepository = require('../../repositories/categoryRepository');

describe('categoryRepository', () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  describe('findAllByUserId', () => {
    it('userId에 해당하는 카테고리 배열을 반환한다', async () => {
      const mockRows = [
        { id: 'cat-1', user_id: 'user-1', name: '업무', created_at: new Date() },
        { id: 'cat-2', user_id: 'user-1', name: '개인', created_at: new Date() },
      ];
      mockPool.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await categoryRepository.findAllByUserId('user-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, user_id, name, created_at FROM categories WHERE user_id = $1 ORDER BY created_at ASC',
        ['user-1']
      );
      expect(result).toEqual(mockRows);
    });

    it('카테고리가 없을 때 빈 배열을 반환한다', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await categoryRepository.findAllByUserId('user-no-cat');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('결과가 있을 때 해당 row를 반환한다', async () => {
      const mockCategory = { id: 'cat-1', user_id: 'user-1', name: '업무', created_at: new Date() };
      mockPool.query.mockResolvedValueOnce({ rows: [mockCategory] });

      const result = await categoryRepository.findById('cat-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, user_id, name, created_at FROM categories WHERE id = $1',
        ['cat-1']
      );
      expect(result).toEqual(mockCategory);
    });

    it('결과가 없을 때 null을 반환한다', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await categoryRepository.findById('not-exist');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('INSERT를 실행하고 생성된 row를 반환한다', async () => {
      const mockCreated = { id: 'cat-new', user_id: 'user-1', name: '학습', created_at: new Date() };
      mockPool.query.mockResolvedValueOnce({ rows: [mockCreated] });

      const result = await categoryRepository.create({ userId: 'user-1', name: '학습' });

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING id, user_id, name, created_at',
        ['user-1', '학습']
      );
      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('UPDATE를 실행하고 수정된 row를 반환한다', async () => {
      const mockUpdated = { id: 'cat-1', user_id: 'user-1', name: '업무2', created_at: new Date() };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUpdated] });

      const result = await categoryRepository.update('cat-1', { name: '업무2' });

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, user_id, name, created_at',
        ['업무2', 'cat-1']
      );
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('deleteById', () => {
    it('DELETE 쿼리를 실행한다', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await categoryRepository.deleteById('cat-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM categories WHERE id = $1',
        ['cat-1']
      );
    });
  });
});
