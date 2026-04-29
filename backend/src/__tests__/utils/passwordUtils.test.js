jest.setTimeout(10000);

jest.mock('../../config/env', () => ({
  BCRYPT_COST: 4,
}));

const { hashPassword, comparePassword } = require('../../utils/passwordUtils');

describe('passwordUtils', () => {
  describe('hashPassword', () => {
    test('string 타입의 해시를 반환한다', async () => {
      const hash = await hashPassword('password');
      expect(typeof hash).toBe('string');
    });

    test('같은 평문을 두 번 해시하면 결과가 다르다 (salt 적용 확인)', async () => {
      const hash1 = await hashPassword('password');
      const hash2 = await hashPassword('password');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    test('올바른 평문은 true를 반환한다', async () => {
      const hash = await hashPassword('password');
      const result = await comparePassword('password', hash);
      expect(result).toBe(true);
    });

    test('잘못된 평문은 false를 반환한다', async () => {
      const hash = await hashPassword('password');
      const result = await comparePassword('wrong', hash);
      expect(result).toBe(false);
    });
  });
});
