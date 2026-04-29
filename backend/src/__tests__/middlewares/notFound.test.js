const notFound = require('../../middlewares/notFound');
const AppError = require('../../utils/AppError');

describe('notFound 미들웨어', () => {
  it('next가 AppError 인스턴스와 함께 호출되어야 한다', () => {
    const req = { originalUrl: '/api/v1/unknown' };
    const res = {};
    const next = jest.fn();

    notFound(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
  });

  it('AppError의 statusCode가 404여야 한다', () => {
    const req = { originalUrl: '/api/v1/unknown' };
    const res = {};
    const next = jest.fn();

    notFound(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
  });

  it("AppError의 code가 'NOT_FOUND'여야 한다", () => {
    const req = { originalUrl: '/api/v1/unknown' };
    const res = {};
    const next = jest.fn();

    notFound(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.code).toBe('NOT_FOUND');
  });
});
