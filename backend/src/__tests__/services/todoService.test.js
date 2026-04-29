jest.mock('../../repositories/todoRepository');
jest.mock('../../repositories/categoryRepository');

const todoRepository = require('../../repositories/todoRepository');
const categoryRepository = require('../../repositories/categoryRepository');
const { getTodos, createTodo, getTodoById, updateTodo, deleteTodo, toggleComplete, completeTodo } = require('../../services/todoService');

describe('todoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodos', () => {
    it('완료된 항목은 overdue가 아니고 status가 completed로 계산된다', async () => {
      const completedTodo = {
        id: 'todo-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        title: '완료한 일',
        description: null,
        due_date: '2026-04-01T00:00:00.000Z',
        is_completed: true,
        created_at: '2026-04-01T00:00:00.000Z',
        updated_at: '2026-04-01T00:00:00.000Z',
      };
      todoRepository.findAllByUserId.mockResolvedValueOnce({ rows: [completedTodo], total: 1 });

      const result = await getTodos('user-1', { page: 2, limit: 10 });

      expect(todoRepository.findAllByUserId).toHaveBeenCalledWith('user-1', { page: 2, limit: 10 });
      expect(result.pagination).toEqual({ page: 2, limit: 10, total: 1 });
      expect(result.todos[0]).toEqual(expect.objectContaining({
        id: 'todo-1',
        is_completed: true,
        is_overdue: false,
        is_due_soon: false,
        status: 'completed',
      }));
    });
  });

  describe('createTodo', () => {
    it('카테고리 소유권이 확인되면 create를 호출한다', async () => {
      categoryRepository.findById.mockResolvedValueOnce({ id: 'cat-1', user_id: 'user-1', name: '업무' });
      todoRepository.create.mockResolvedValueOnce({
        id: 'todo-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        title: '할 일',
        description: null,
        due_date: null,
        is_completed: false,
      });

      const result = await createTodo('user-1', { title: '할 일', description: null, dueDate: null, categoryId: 'cat-1' });

      expect(categoryRepository.findById).toHaveBeenCalledWith('cat-1');
      expect(todoRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        title: '할 일',
        description: null,
        dueDate: null,
        categoryId: 'cat-1',
      });
      expect(result).toEqual(expect.objectContaining({ id: 'todo-1', status: 'in_progress' }));
    });

    it('다른 사용자 카테고리를 지정하면 403을 던진다', async () => {
      categoryRepository.findById.mockResolvedValueOnce({ id: 'cat-1', user_id: 'other-user', name: '업무' });

      await expect(
        createTodo('user-1', { title: '할 일', description: null, dueDate: null, categoryId: 'cat-1' })
      ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });

      expect(todoRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getTodoById', () => {
    it('본인 할일만 조회한다', async () => {
      todoRepository.findById.mockResolvedValueOnce({
        id: 'todo-1',
        user_id: 'user-1',
        category_id: null,
        title: '할 일',
        description: null,
        due_date: null,
        is_completed: false,
      });

      const result = await getTodoById('user-1', 'todo-1');

      expect(todoRepository.findById).toHaveBeenCalledWith('todo-1');
      expect(result).toEqual(expect.objectContaining({ id: 'todo-1', status: 'in_progress' }));
    });
  });

  describe('updateTodo', () => {
    it('categoryId가 포함되면 소유권 검증 후 update를 호출한다', async () => {
      todoRepository.findById.mockResolvedValueOnce({
        id: 'todo-1',
        user_id: 'user-1',
        category_id: null,
        title: '기존',
        description: null,
        due_date: null,
        is_completed: false,
      });
      categoryRepository.findById.mockResolvedValueOnce({ id: 'cat-1', user_id: 'user-1', name: '업무' });
      todoRepository.update.mockResolvedValueOnce({
        id: 'todo-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        title: '수정',
        description: null,
        due_date: null,
        is_completed: false,
      });

      const result = await updateTodo('user-1', 'todo-1', { title: '수정', categoryId: 'cat-1' });

      expect(categoryRepository.findById).toHaveBeenCalledWith('cat-1');
      expect(todoRepository.update).toHaveBeenCalledWith('todo-1', { title: '수정', categoryId: 'cat-1' });
      expect(result).toEqual(expect.objectContaining({ title: '수정', status: 'in_progress' }));
    });
  });

  describe('deleteTodo', () => {
    it('소유권 검증 후 delete를 호출한다', async () => {
      todoRepository.findById.mockResolvedValueOnce({
        id: 'todo-1',
        user_id: 'user-1',
        category_id: null,
        title: '할 일',
        description: null,
        due_date: null,
        is_completed: false,
      });
      todoRepository.deleteById.mockResolvedValueOnce(undefined);

      await deleteTodo('user-1', 'todo-1');

      expect(todoRepository.deleteById).toHaveBeenCalledWith('todo-1');
    });
  });

  describe('toggleComplete', () => {
    it('완료 상태를 반전하고 completeTodo alias도 같은 함수를 가리킨다', async () => {
      todoRepository.findById.mockResolvedValueOnce({
        id: 'todo-1',
        user_id: 'user-1',
        category_id: null,
        title: '할 일',
        description: null,
        due_date: null,
        is_completed: false,
      });
      todoRepository.toggleComplete.mockResolvedValueOnce({
        id: 'todo-1',
        user_id: 'user-1',
        category_id: null,
        title: '할 일',
        description: null,
        due_date: null,
        is_completed: true,
      });

      const result = await toggleComplete('user-1', 'todo-1');

      expect(todoRepository.toggleComplete).toHaveBeenCalledWith('todo-1');
      expect(result).toEqual(expect.objectContaining({ is_completed: true, status: 'completed' }));
      expect(completeTodo).toBe(toggleComplete);
    });
  });
});
