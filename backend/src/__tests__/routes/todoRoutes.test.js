jest.mock('../../middlewares/authenticateToken', () => jest.fn());
jest.mock('../../controllers/todoController', () => ({
  getTodos: jest.fn(),
  createTodo: jest.fn(),
  getTodoById: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  toggleComplete: jest.fn(),
  completeTodo: jest.fn(),
}));

const authenticateToken = require('../../middlewares/authenticateToken');
const todoController = require('../../controllers/todoController');
const todoRoutes = require('../../routes/todoRoutes');

function findRouteLayer(path, method) {
  return todoRoutes.stack.find((layer) => (
    layer.route
    && layer.route.path === path
    && layer.route.methods[method]
  ));
}

describe('todoRoutes', () => {
  it('모든 라우트 전에 authenticateToken 미들웨어를 적용한다', () => {
    expect(todoRoutes.stack[0].handle).toBe(authenticateToken);
  });

  it('GET /는 getTodos에 연결된다', () => {
    const layer = findRouteLayer('/', 'get');
    expect(layer.route.stack[0].handle).toBe(todoController.getTodos);
  });

  it('POST /는 createTodo에 연결된다', () => {
    const layer = findRouteLayer('/', 'post');
    expect(layer.route.stack[0].handle).toBe(todoController.createTodo);
  });

  it('GET /:id는 getTodoById에 연결된다', () => {
    const layer = findRouteLayer('/:id', 'get');
    expect(layer.route.stack[0].handle).toBe(todoController.getTodoById);
  });

  it('PUT /:id는 updateTodo에 연결된다', () => {
    const layer = findRouteLayer('/:id', 'put');
    expect(layer.route.stack[0].handle).toBe(todoController.updateTodo);
  });

  it('DELETE /:id는 deleteTodo에 연결된다', () => {
    const layer = findRouteLayer('/:id', 'delete');
    expect(layer.route.stack[0].handle).toBe(todoController.deleteTodo);
  });

  it('PATCH /:id/complete는 completeTodo에 연결된다', () => {
    const layer = findRouteLayer('/:id/complete', 'patch');
    expect(layer.route.stack[0].handle).toBe(todoController.completeTodo);
  });
});
