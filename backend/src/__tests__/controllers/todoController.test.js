jest.mock('../../services/todoService');

const todoService = require('../../services/todoService');
const {
  getTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleComplete,
  completeTodo,
} = require('../../controllers/todoController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return {
    user: { id: 'user-uuid-1', email: 'test@test.com' },
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

describe('todoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodos', () => {
    it('목록 조회 시 pagination을 포함해 응답한다', async () => {
      todoService.getTodos.mockResolvedValueOnce({
        todos: [{ id: 'todo-1', title: '할 일' }],
        pagination: { page: 1, limit: 20, total: 1 },
      });

      const req = mockReq({ query: { category_id: '', status: 'completed' } });
      const res = mockRes();
      const next = jest.fn();

      await getTodos(req, res, next);

      expect(todoService.getTodos).toHaveBeenCalledWith('user-uuid-1', {
        categoryId: undefined,
        status: 'completed',
        sortBy: 'created_at',
        order: 'desc',
        page: 1,
        limit: 20,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 'todo-1', title: '할 일' }],
        pagination: { page: 1, limit: 20, total: 1 },
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('createTodo', () => {
    it('빈 문자열 due_date/category_id를 null로 정규화하고 201을 응답한다', async () => {
      const mockTodo = { id: 'todo-1', title: '할 일' };
      todoService.createTodo.mockResolvedValueOnce(mockTodo);

      const req = mockReq({
        body: { title: '  할 일  ', description: '', due_date: '', category_id: '' },
      });
      const res = mockRes();
      const next = jest.fn();

      await createTodo(req, res, next);

      expect(todoService.createTodo).toHaveBeenCalledWith('user-uuid-1', {
        title: '할 일',
        description: null,
        dueDate: null,
        categoryId: null,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { todo: mockTodo } });
    });
  });

  describe('getTodoById', () => {
    it('단건 조회 결과를 todo 키로 응답한다', async () => {
      const mockTodo = { id: 'todo-1', title: '할 일' };
      todoService.getTodoById.mockResolvedValueOnce(mockTodo);

      const req = mockReq({ params: { id: 'todo-1' } });
      const res = mockRes();
      const next = jest.fn();

      await getTodoById(req, res, next);

      expect(todoService.getTodoById).toHaveBeenCalledWith('user-uuid-1', 'todo-1');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { todo: mockTodo } });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('updateTodo', () => {
    it('빈 문자열 category_id를 null로 바꿔 전달한다', async () => {
      const mockTodo = { id: 'todo-1', title: '수정' };
      todoService.updateTodo.mockResolvedValueOnce(mockTodo);

      const req = mockReq({ params: { id: 'todo-1' }, body: { category_id: '', due_date: '' } });
      const res = mockRes();
      const next = jest.fn();

      await updateTodo(req, res, next);

      expect(todoService.updateTodo).toHaveBeenCalledWith('user-uuid-1', 'todo-1', {
        dueDate: null,
        categoryId: null,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { todo: mockTodo } });
    });
  });

  describe('deleteTodo', () => {
    it('삭제 성공 메시지를 응답한다', async () => {
      todoService.deleteTodo.mockResolvedValueOnce(undefined);

      const req = mockReq({ params: { id: 'todo-1' } });
      const res = mockRes();
      const next = jest.fn();

      await deleteTodo(req, res, next);

      expect(todoService.deleteTodo).toHaveBeenCalledWith('user-uuid-1', 'todo-1');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { message: '할일이 삭제되었습니다.' } });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('toggleComplete', () => {
    it('completeTodo alias를 통해 완료 토글 응답을 보낸다', async () => {
      const mockTodo = { id: 'todo-1', is_completed: true };
      todoService.toggleComplete.mockResolvedValueOnce(mockTodo);

      const req = mockReq({ params: { id: 'todo-1' } });
      const res = mockRes();
      const next = jest.fn();

      await completeTodo(req, res, next);

      expect(todoService.toggleComplete).toHaveBeenCalledWith('user-uuid-1', 'todo-1');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { todo: mockTodo } });
      expect(toggleComplete).toBe(completeTodo);
    });
  });
});
