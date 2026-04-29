const {
  request,
  app,
  resetTestDatabase,
  truncateTables,
  closePool,
  registerUser,
  loginUser,
  createUserAndLogin,
  authHeader,
  findUserByEmail,
  findCategoriesByUserId,
  findTodoById,
  countTodosByUserId,
} = require("./helpers/integrationTestUtils");

function uniqueEmail(prefix = "auth") {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

describe("BE-09 auth integration", () => {
  beforeAll(async () => {
    await resetTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await closePool();
  });

  it("register success: 신규 회원가입은 201과 생성된 user를 반환해야 한다", async () => {
    const email = uniqueEmail("register");

    const response = await registerUser({
      email,
      password: "Password123!",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email,
        created_at: expect.any(String),
      })
    );

    const savedUser = await findUserByEmail(email);
    expect(savedUser).toEqual(
      expect.objectContaining({
        id: response.body.data.user.id,
        email,
      })
    );
  });

  it("duplicate email 409 (BR-AUTH-02): 같은 이메일로 재가입하면 DUPLICATE_EMAIL을 반환해야 한다", async () => {
    const email = uniqueEmail("duplicate");

    await registerUser({
      email,
      password: "Password123!",
    });

    const response = await registerUser({
      email,
      password: "Password123!",
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "DUPLICATE_EMAIL",
        message: "이미 사용 중인 이메일입니다.",
      },
    });
  });

  it("login success: 로그인 성공 시 JWT와 user 정보를 반환해야 한다", async () => {
    const email = uniqueEmail("login");
    const password = "Password123!";

    await registerUser({ email, password });

    const response = await loginUser({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email,
          created_at: expect.any(String),
        }),
      })
    );
    expect(response.body.data.token.split(".")).toHaveLength(3);
  });

  it("wrong password 401: 비밀번호가 틀리면 INVALID_CREDENTIALS를 반환해야 한다", async () => {
    const email = uniqueEmail("wrong-password");

    await registerUser({
      email,
      password: "Password123!",
    });

    const response = await loginUser({
      email,
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      },
    });
  });

  it("unauthenticated protected route 401: 토큰 없이 보호된 라우트에 접근하면 UNAUTHORIZED를 반환해야 한다", async () => {
    const response = await request(app).get("/api/v1/categories");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "인증 토큰이 필요합니다.",
      },
    });
  });

  it("withdraw deletes user data cascade (BR-DATA-05): 회원탈퇴 시 사용자와 연관 데이터가 함께 삭제되어야 한다", async () => {
    const email = uniqueEmail("withdraw");
    const password = "Password123!";
    const { token, user } = await createUserAndLogin({ email, password });

    const categoryResponse = await request(app)
      .post("/api/v1/categories")
      .set(authHeader(token))
      .send({ name: "Work" });

    expect(categoryResponse.status).toBe(201);

    const categoryId = categoryResponse.body.data.category.id;

    const todoResponse = await request(app)
      .post("/api/v1/todos")
      .set(authHeader(token))
      .send({
        title: "Finish integration spec",
        description: "cascade target",
        category_id: categoryId,
      });

    expect(todoResponse.status).toBe(201);

    const todoId = todoResponse.body.data.todo.id;

    expect(await findUserByEmail(email)).toEqual(
      expect.objectContaining({
        id: user.id,
        email,
      })
    );
    expect(await findCategoriesByUserId(user.id)).toHaveLength(1);
    expect(await countTodosByUserId(user.id)).toBe(1);
    expect(await findTodoById(todoId)).toEqual(
      expect.objectContaining({
        id: todoId,
        user_id: user.id,
        category_id: categoryId,
        title: "Finish integration spec",
      })
    );

    const withdrawResponse = await request(app)
      .delete("/api/v1/auth/me")
      .set(authHeader(token))
      .send({ password });

    expect(withdrawResponse.status).toBe(200);
    expect(withdrawResponse.body).toEqual({
      success: true,
      data: {
        message: "회원탈퇴가 완료되었습니다.",
      },
    });

    expect(await findUserByEmail(email)).toBeNull();
    expect(await findCategoriesByUserId(user.id)).toEqual([]);
    expect(await countTodosByUserId(user.id)).toBe(0);
    expect(await findTodoById(todoId)).toBeNull();
  });
});
