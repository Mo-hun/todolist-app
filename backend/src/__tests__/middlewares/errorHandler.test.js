const errorHandler = require('../../middlewares/errorHandler');
const AppError = require('../../utils/AppError');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler 미들웨어', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('AppError(404, NOT_FOUND)이면 404 상태코드와 올바른 포맷으로 응답해야 한다', () => {
    const err = new AppError('리소스를 찾을 수 없습니다.', 404, 'NOT_FOUND');
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'NOT_FOUND', message: '리소스를 찾을 수 없습니다.' },
    });
  });

  it('AppError(401, UNAUTHORIZED)이면 401 상태코드로 응답해야 한다', () => {
    const err = new AppError('인증이 필요합니다.', 401, 'UNAUTHORIZED');
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' },
    });
  });

  it('일반 Error이면 500 상태코드와 INTERNAL_SERVER_ERROR 응답을 반환해야 한다', () => {
    const err = new Error('예상치 못한 오류');
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' },
    });
  });

  it('500 응답에 stack trace가 포함되지 않아야 한다', () => {
    const err = new Error('예상치 못한 오류');
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    const responseBody = res.json.mock.calls[0][0];
    expect(JSON.stringify(responseBody)).not.toContain('stack');
  });

  it('500 에러는 console.error로 로깅해야 한다', () => {
    const err = new Error('서버 오류');
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(err);
  });
});
