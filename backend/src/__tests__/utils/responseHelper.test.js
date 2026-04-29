const { sendSuccess, sendError } = require('../../utils/responseHelper');

describe('responseHelper', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('sendSuccess', () => {
    test('기본 statusCode 200으로 success: true와 data를 응답한다', () => {
      const data = { id: 1, title: '할 일' };
      sendSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    test('statusCode 201을 지정하면 201로 응답한다', () => {
      const data = { id: 2 };
      sendSuccess(res, data, 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });
  });

  describe('sendError', () => {
    test('success: false와 error 객체를 지정한 statusCode로 응답한다', () => {
      sendError(res, 'NOT_FOUND', '메시지', 404);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'NOT_FOUND', message: '메시지' },
      });
    });
  });
});
