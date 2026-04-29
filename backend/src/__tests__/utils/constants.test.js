const { HTTP_STATUS, ERROR_CODE } = require('../../utils/constants');

describe('constants', () => {
  describe('HTTP_STATUS', () => {
    test('주요 HTTP 상태 코드 값이 올바르다', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('ERROR_CODE', () => {
    test('주요 에러 코드 값이 올바르다', () => {
      expect(ERROR_CODE.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ERROR_CODE.TOKEN_INVALID).toBe('TOKEN_INVALID');
      expect(ERROR_CODE.FORBIDDEN).toBe('FORBIDDEN');
      expect(ERROR_CODE.NOT_FOUND).toBe('NOT_FOUND');
      expect(ERROR_CODE.DUPLICATE_EMAIL).toBe('DUPLICATE_EMAIL');
      expect(ERROR_CODE.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
      expect(ERROR_CODE.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
      expect(ERROR_CODE.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    });
  });

  test('HTTP_STATUS와 ERROR_CODE 모두 export된다', () => {
    expect(HTTP_STATUS).toBeDefined();
    expect(ERROR_CODE).toBeDefined();
  });
});
