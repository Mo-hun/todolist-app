describe('server', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    jest.resetModules();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('start는 DB 연결 성공 후 설정된 PORT로 서버를 시작해야 한다', async () => {
    const listen = jest.fn((port, callback) => callback());
    const checkConnection = jest.fn().mockResolvedValue({ now: new Date('2026-04-29T00:00:00.000Z') });

    jest.doMock('../app', () => ({
      listen,
    }));
    jest.doMock('../config/env', () => ({
      PORT: 4321,
    }));
    jest.doMock('../config/db', () => ({
      checkConnection,
    }));

    const { start } = require('../server');
    await start();

    expect(checkConnection).toHaveBeenCalledTimes(1);
    expect(listen).toHaveBeenCalledWith(4321, expect.any(Function));
    expect(consoleLogSpy).toHaveBeenCalledWith('Server running on port 4321');
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it('run은 DB 연결 실패를 로그로 남기고 프로세스를 종료해야 하며 서버를 시작하지 않아야 한다', async () => {
    const listen = jest.fn();
    const checkConnection = jest.fn().mockRejectedValue(new Error('database unavailable'));

    jest.doMock('../app', () => ({
      listen,
    }));
    jest.doMock('../config/env', () => ({
      PORT: 4321,
    }));
    jest.doMock('../config/db', () => ({
      checkConnection,
    }));

    const { run } = require('../server');
    await run();

    expect(checkConnection).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to start server:', 'database unavailable');
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(listen).not.toHaveBeenCalled();
  });

  it('run은 listen 단계의 예외도 최상위에서 로깅하고 프로세스를 종료해야 한다', async () => {
    const checkConnection = jest.fn().mockResolvedValue({ now: new Date('2026-04-29T00:00:00.000Z') });
    const listen = jest.fn(() => {
      throw new Error('listen crash');
    });

    jest.doMock('../app', () => ({
      listen,
    }));
    jest.doMock('../config/env', () => ({
      PORT: 4321,
    }));
    jest.doMock('../config/db', () => ({
      checkConnection,
    }));

    const { run } = require('../server');
    await run();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to start server:', 'listen crash');
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
