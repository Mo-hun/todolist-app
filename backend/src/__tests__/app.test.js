const request = require('supertest');
const express = require('express');

function buildRouter(registerRoutes) {
  const router = express.Router();
  registerRoutes(router);
  return router;
}

function loadApp({ queryImpl, authRoutes, categoryRoutes, todoRoutes } = {}) {
  jest.resetModules();

  const query = jest.fn(queryImpl || (() => Promise.resolve({ rows: [] })));

  jest.doMock('../config/db', () => ({
    pool: { query },
  }));

  if (authRoutes) {
    jest.doMock('../routes/authRoutes', () => authRoutes);
  }

  if (categoryRoutes) {
    jest.doMock('../routes/categoryRoutes', () => categoryRoutes);
  }

  if (todoRoutes) {
    jest.doMock('../routes/todoRoutes', () => todoRoutes);
  }

  return { app: require('../app'), query };
}

describe('app', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.dontMock('../config/db');
    jest.dontMock('../routes/authRoutes');
    jest.dontMock('../routes/categoryRoutes');
    jest.dontMock('../routes/todoRoutes');
  });

  it('GET /api/v1/health는 SELECT 1 후 서버 상태를 반환해야 한다', async () => {
    const { app, query } = loadApp();

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { status: 'ok' },
    });
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('헬스체크 DB 쿼리 실패는 500 에러 포맷으로 응답해야 한다', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { app } = loadApp({
      queryImpl: () => Promise.reject(new Error('db unavailable')),
    });

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 오류가 발생했습니다.',
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  it('등록되지 않은 경로는 404 에러 포맷으로 응답해야 한다', async () => {
    const { app } = loadApp({
      authRoutes: buildRouter(() => {}),
      categoryRoutes: buildRouter(() => {}),
      todoRoutes: buildRouter(() => {}),
    });

    const response = await request(app).get('/api/v1/missing');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '요청한 경로를 찾을 수 없습니다: /api/v1/missing',
      },
    });
  });

  it('Express 5 async 라우트에서 throw된 AppError를 errorHandler가 처리해야 한다', async () => {
    const { app } = loadApp({
      authRoutes: buildRouter((router) => {
        router.get('/async-error', async () => {
          const AppError = require('../utils/AppError');
          throw new AppError('비동기 라우트 실패', 418, 'ASYNC_ROUTE_ERROR');
        });
      }),
      categoryRoutes: buildRouter(() => {}),
      todoRoutes: buildRouter(() => {}),
    });

    const response = await request(app).get('/api/v1/auth/async-error');

    expect(response.status).toBe(418);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'ASYNC_ROUTE_ERROR',
        message: '비동기 라우트 실패',
      },
    });
  });
});
