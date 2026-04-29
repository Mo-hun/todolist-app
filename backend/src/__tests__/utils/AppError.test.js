const AppError = require('../../utils/AppError');

describe('AppError', () => {
  it('Error를 extends 해야 한다', () => {
    const error = new AppError('테스트 메시지', 400, 'BAD_REQUEST');
    expect(error).toBeInstanceOf(Error);
  });

  it('instanceof AppError를 만족해야 한다', () => {
    const error = new AppError('테스트 메시지', 400, 'BAD_REQUEST');
    expect(error).toBeInstanceOf(AppError);
  });

  it('message가 올바르게 설정되어야 한다', () => {
    const error = new AppError('테스트 메시지', 400, 'BAD_REQUEST');
    expect(error.message).toBe('테스트 메시지');
  });

  it('statusCode가 올바르게 설정되어야 한다', () => {
    const error = new AppError('테스트 메시지', 404, 'NOT_FOUND');
    expect(error.statusCode).toBe(404);
  });

  it('code가 올바르게 설정되어야 한다', () => {
    const error = new AppError('테스트 메시지', 401, 'UNAUTHORIZED');
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('다양한 statusCode와 code 조합이 올바르게 동작해야 한다', () => {
    const error = new AppError('서버 오류', 500, 'INTERNAL_SERVER_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.message).toBe('서버 오류');
  });
});
