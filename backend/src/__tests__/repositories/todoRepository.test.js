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
const todoRepository = require('../../repositories/todoRepository');

describe('todoRepository', () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  describe('findAllByUserId', () => {
    it('기본 조건으로 count와 목록 조회를 수행한다', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '2' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'todo-1', user_id: 'user-1' },
            { id: 'todo-2', user_id: 'user-1' },
          ],
        });

      const result = await todoRepository.findAllByUserId('user-1');

      expect(mockPool.query).toHaveBeenNthCalledWith(
        1,
        'SELECT COUNT(*) FROM todos WHERE user_id = $1',
        ['user-1']
      );
      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('ORDER BY created_at DESC'),
        ['user-1', 20, 0]
      );
      expect(result).toEqual({
        rows: [
          { id: 'todo-1', user_id: 'user-1' },
          { id: 'todo-2', user_id: 'user-1' },
        ],
        total: 2,
      });
    });

    it('필터와 페이지네이션을 반영한다', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'todo-3', user_id: 'user-1' }] });

      await todoRepository.findAllByUserId('user-1', {
        categoryId: 'cat-1',
        status: 'in_progress',
        sortBy: 'due_date',
        order: 'asc',
        page: 2,
        limit: 5,
      });

      expect(mockPool.query).toHaveBeenNthCalledWith(
        1,
        'SELECT COUNT(*) FROM todos WHERE user_id = $1 AND category_id = $2 AND is_completed = false AND (due_date IS NULL OR due_date >= NOW())',
        ['user-1', 'cat-1']
      );
      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('ORDER BY due_date ASC'),
        ['user-1', 'cat-1', 5, 5]
      );
    });

    it('허용되지 않은 정렬 값은 안전한 기본값으로 대체한다', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await todoRepository.findAllByUserId('user-1', {
        sortBy: 'title',
        order: 'sideways',
      });

      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('ORDER BY created_at DESC'),
        ['user-1', 20, 0]
      );
    });
  });

  describe('findById', () => {
    it('row가 있으면 반환한다', async () => {
      const row = { id: 'todo-1', user_id: 'user-1' };
      mockPool.query.mockResolvedValueOnce({ rows: [row] });

      const result = await todoRepository.findById('todo-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, user_id, category_id, title, description, due_date, is_completed, created_at, updated_at FROM todos WHERE id = $1',
        ['todo-1']
      );
      expect(result).toEqual(row);
    });

    it('row가 없으면 null을 반환한다', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await todoRepository.findById('missing');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('INSERT를 실행하고 생성된 row를 반환한다', async () => {
      const row = { id: 'todo-1', user_id: 'user-1', title: '새 할일' };
      mockPool.query.mockResolvedValueOnce({ rows: [row] });

      const result = await todoRepository.create({
        userId: 'user-1',
        title: '새 할일',
        description: '설명',
        dueDate: '2026-04-30',
        categoryId: 'cat-1',
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO todos (user_id, category_id, title, description, due_date)'),
        ['user-1', 'cat-1', '새 할일', '설명', '2026-04-30']
      );
      expect(result).toEqual(row);
    });
  });

  describe('update', () => {
    it('전달된 필드만 SET에 포함하고 updated_at을 갱신한다', async () => {
      const row = { id: 'todo-1', user_id: 'user-1', title: '수정됨' };
      mockPool.query.mockResolvedValueOnce({ rows: [row] });

      const result = await todoRepository.update('todo-1', {
        title: '수정됨',
        categoryId: 'cat-1',
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE todos SET title = $1, category_id = $2, updated_at = NOW() WHERE id = $3'),
        ['수정됨', 'cat-1', 'todo-1']
      );
      expect(result).toEqual(row);
    });
  });

  describe('deleteById', () => {
    it('DELETE 쿼리를 실행한다', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await todoRepository.deleteById('todo-1');

      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM todos WHERE id = $1', ['todo-1']);
    });
  });

  describe('toggleComplete', () => {
    it('완료 상태 반전 UPDATE를 실행한다', async () => {
      const row = { id: 'todo-1', is_completed: true };
      mockPool.query.mockResolvedValueOnce({ rows: [row] });

      const result = await todoRepository.toggleComplete('todo-1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE todos SET is_completed = NOT is_completed, updated_at = NOW()'),
        ['todo-1']
      );
      expect(result).toEqual(row);
    });
  });
});
