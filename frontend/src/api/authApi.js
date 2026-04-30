import client from './client';

export const login = (credentials) =>
  client.post('/api/v1/auth/login', credentials).then((r) => r.data);

export const register = (userData) =>
  client.post('/api/v1/auth/register', userData).then((r) => r.data);

export const withdraw = () =>
  client.delete('/api/v1/auth/me').then((r) => r.data);
