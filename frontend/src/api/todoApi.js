import client from './client';

export const getTodos = (params) =>
  client.get('/api/v1/todos', { params }).then((r) => r.data);

export const createTodo = (data) =>
  client.post('/api/v1/todos', data).then((r) => r.data);

export const getTodoById = (id) =>
  client.get(`/api/v1/todos/${id}`).then((r) => r.data);

export const updateTodo = (id, data) =>
  client.put(`/api/v1/todos/${id}`, data).then((r) => r.data);

export const deleteTodo = (id) =>
  client.delete(`/api/v1/todos/${id}`).then((r) => r.data);

export const toggleTodo = (id) =>
  client.patch(`/api/v1/todos/${id}/complete`).then((r) => r.data);
