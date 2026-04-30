import client from './client';

export const getCategories = () =>
  client.get('/api/v1/categories').then((r) => r.data);

export const createCategory = (data) =>
  client.post('/api/v1/categories', data).then((r) => r.data);

export const updateCategory = (id, data) =>
  client.put(`/api/v1/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id) =>
  client.delete(`/api/v1/categories/${id}`).then((r) => r.data);
