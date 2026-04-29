jest.mock("pg");

describe("db config", () => {
  let mockPool;

  beforeEach(() => {
    jest.resetModules();

    // resetModules 후 pg의 새 mock 참조를 가져와야 mockPool이 db.js에도 적용된다
    const { Pool } = require("pg");

    mockPool = {
      query: jest.fn(),
      on: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    Pool.mockImplementation(() => mockPool);
  });

  it("pool과 checkConnection을 export 해야 한다", () => {
    const db = require("../../config/db");

    expect(db.pool).toBeDefined();
    expect(typeof db.checkConnection).toBe("function");
  });

  it("pool 인스턴스가 다른 모듈에서 import 가능해야 한다", () => {
    const db = require("../../config/db");
    expect(db.pool).toBe(mockPool);
  });

  it("pool error 이벤트 핸들러가 등록되어야 한다", () => {
    require("../../config/db");
    expect(mockPool.on).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("pool error 핸들러는 에러 메시지를 콘솔에 출력해야 한다", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    require("../../config/db");

    const errorHandler = mockPool.on.mock.calls.find(([event]) => event === "error")[1];
    errorHandler(new Error("pool crash"));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected PostgreSQL pool error:",
      "pool crash"
    );
    consoleSpy.mockRestore();
  });

  it("Pool이 connectionString으로 초기화되어야 한다", () => {
    const { Pool } = require("pg");
    require("../../config/db");
    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({ connectionString: expect.any(String) })
    );
  });

  describe("checkConnection", () => {
    it("DB 연결 성공 시 'DB connected' 로그를 출력하고 row를 반환해야 한다", async () => {
      const mockNow = new Date("2026-04-29T00:00:00.000Z");
      mockPool.query.mockResolvedValue({ rows: [{ now: mockNow }] });
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      const db = require("../../config/db");
      const result = await db.checkConnection();

      expect(mockPool.query).toHaveBeenCalledWith("SELECT NOW() AS now");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("DB connected"));
      expect(result).toEqual({ now: mockNow });
      consoleSpy.mockRestore();
    });

    it("DB 연결 실패 시 에러를 throw 해야 한다 (잘못된 호스트)", async () => {
      mockPool.query.mockRejectedValue(new Error("Connection refused"));

      const db = require("../../config/db");
      await expect(db.checkConnection()).rejects.toThrow("Connection refused");
    });

    it("DB 연결 실패 시 에러를 throw 해야 한다 (잘못된 패스워드)", async () => {
      mockPool.query.mockRejectedValue(new Error("password authentication failed"));

      const db = require("../../config/db");
      await expect(db.checkConnection()).rejects.toThrow("password authentication failed");
    });

    it("연결 성공 시 SELECT NOW() 쿼리를 정확히 1회 실행해야 한다", async () => {
      const mockNow = new Date();
      mockPool.query.mockResolvedValue({ rows: [{ now: mockNow }] });
      jest.spyOn(console, "log").mockImplementation(() => {});

      const db = require("../../config/db");
      await db.checkConnection();

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith("SELECT NOW() AS now");
    });
  });
});
