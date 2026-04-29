describe("env config", () => {
  let env;

  beforeAll(() => {
    env = require("../../config/env");
  });

  it("필수 키를 모두 export 해야 한다", () => {
    const requiredKeys = [
      "DB_HOST",
      "DB_PORT",
      "DB_NAME",
      "DB_USER",
      "DB_PASSWORD",
      "DATABASE_URL",
      "POSTGRES_CONNECTION_STRING",
      "JWT_SECRET",
      "PORT",
      "BCRYPT_COST",
    ];
    requiredKeys.forEach((key) => {
      expect(env).toHaveProperty(key);
    });
  });

  it("PORT는 숫자 타입이어야 한다", () => {
    expect(typeof env.PORT).toBe("number");
    expect(Number.isFinite(env.PORT)).toBe(true);
  });

  it("DB_PORT는 숫자 타입이어야 한다", () => {
    expect(typeof env.DB_PORT).toBe("number");
    expect(Number.isFinite(env.DB_PORT)).toBe(true);
  });

  it("BCRYPT_COST는 12 이상의 숫자여야 한다", () => {
    expect(typeof env.BCRYPT_COST).toBe("number");
    expect(env.BCRYPT_COST).toBeGreaterThanOrEqual(12);
  });

  it("환경변수 미설정 시 기본값을 사용해야 한다", () => {
    jest.resetModules();
    const savedEnv = { ...process.env };

    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.PORT;
    delete process.env.BCRYPT_COST;

    // dotenv.config이 .env를 읽어 덮어쓰므로, ENV_FILE을 없는 경로로 지정
    process.env.ENV_FILE = "/nonexistent/.env.missing";

    const freshEnv = require("../../config/env");

    expect(freshEnv.DB_HOST).toBe("localhost");
    expect(freshEnv.DB_PORT).toBe(5432);
    expect(freshEnv.DB_NAME).toBe("todolist_dev");
    expect(freshEnv.DB_USER).toBe("todolist_user");
    expect(freshEnv.PORT).toBe(3000);
    expect(freshEnv.BCRYPT_COST).toBe(12);

    process.env = savedEnv;
    jest.resetModules();
  });

  it("환경변수가 설정되면 해당 값을 사용해야 한다", () => {
    jest.resetModules();
    const savedEnv = { ...process.env };

    process.env.ENV_FILE = "/nonexistent/.env.missing";
    process.env.PORT = "4000";
    process.env.BCRYPT_COST = "14";
    process.env.DB_PORT = "5433";

    const freshEnv = require("../../config/env");

    expect(freshEnv.PORT).toBe(4000);
    expect(freshEnv.BCRYPT_COST).toBe(14);
    expect(freshEnv.DB_PORT).toBe(5433);

    process.env = savedEnv;
    jest.resetModules();
  });

  it("ENV_FILE이 존재하면 기본 .env 위에 override 되어야 한다", () => {
    jest.resetModules();
    const fs = require("fs");
    const os = require("os");
    const path = require("path");
    const savedEnv = { ...process.env };
    const savedCwd = process.cwd();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "env-config-"));
    const baseEnvPath = path.join(tempDir, ".env");
    const testEnvPath = path.join(tempDir, ".env.test");

    fs.writeFileSync(
      baseEnvPath,
      "DB_NAME=base_db\nPORT=3000\nBCRYPT_COST=12\nJWT_SECRET=base-secret\n"
    );
    fs.writeFileSync(
      testEnvPath,
      "DB_NAME=test_db\nPORT=3001\n"
    );

    process.chdir(tempDir);
    process.env = {
      ...savedEnv,
      ENV_FILE: ".env.test",
    };

    const freshEnv = require("../../config/env");

    expect(freshEnv.DB_NAME).toBe("test_db");
    expect(freshEnv.PORT).toBe(3001);

    process.chdir(savedCwd);
    process.env = savedEnv;
    jest.resetModules();
  });
});
