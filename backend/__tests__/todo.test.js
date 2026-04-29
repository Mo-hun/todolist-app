const {
  request,
  app,
  resetTestDatabase,
  truncateTables,
  closePool,
  createUserAndLogin,
  authHeader,
  findTodoById,
  countTodosByUserId,
} = require("./helpers/integrationTestUtils");

async function createCategory(token, name) {
  const response = await request(app)
    .post("/api/v1/categories")
    .set(authHeader(token))
    .send({ name });

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);

  return response.body.data.category;
}

describe("BE-09 todo integration", () => {
  beforeAll(async () => {
    await resetTestDatabase();
  });

  afterEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await closePool();
  });

  it("todo CRUD를 수행한다", async () => {
    const owner = await createUserAndLogin({ email: "todo-owner@example.com" });
    const category = await createCategory(owner.token, "Work");

    const createResponse = await request(app)
      .post("/api/v1/todos")
      .set(authHeader(owner.token))
      .send({
        title: "  First todo  ",
        description: "draft",
        due_date: "2099-12-31T09:00:00.000Z",
        category_id: category.id,
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.todo).toMatchObject({
      user_id: owner.user.id,
      category_id: category.id,
      title: "First todo",
      description: "draft",
      is_completed: false,
      status: "in_progress",
      is_overdue: false,
    });

    const todoId = createResponse.body.data.todo.id;
    expect(await countTodosByUserId(owner.user.id)).toBe(1);

    const listResponse = await request(app)
      .get("/api/v1/todos")
      .set(authHeader(owner.token));

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.pagination).toMatchObject({
      page: 1,
      limit: 20,
      total: 1,
    });
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0]).toMatchObject({
      id: todoId,
      title: "First todo",
      category_id: category.id,
    });

    const detailResponse = await request(app)
      .get(`/api/v1/todos/${todoId}`)
      .set(authHeader(owner.token));

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.success).toBe(true);
    expect(detailResponse.body.data.todo).toMatchObject({
      id: todoId,
      title: "First todo",
      description: "draft",
      category_id: category.id,
    });

    const updateResponse = await request(app)
      .put(`/api/v1/todos/${todoId}`)
      .set(authHeader(owner.token))
      .send({
        title: "Updated todo",
        description: "",
        due_date: "",
        category_id: "",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.todo).toMatchObject({
      id: todoId,
      title: "Updated todo",
      description: null,
      due_date: null,
      category_id: null,
      status: "in_progress",
      is_overdue: false,
      is_due_soon: false,
    });

    expect(await findTodoById(todoId)).toMatchObject({
      id: todoId,
      title: "Updated todo",
      description: null,
      due_date: null,
      category_id: null,
      is_completed: false,
    });

    const deleteResponse = await request(app)
      .delete(`/api/v1/todos/${todoId}`)
      .set(authHeader(owner.token));

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      success: true,
      data: { message: "할일이 삭제되었습니다." },
    });
    expect(await findTodoById(todoId)).toBeNull();
    expect(await countTodosByUserId(owner.user.id)).toBe(0);
  });

  it("다른 사용자의 todo 조회/수정/삭제는 403을 반환한다 (BR-AUTH-03)", async () => {
    const owner = await createUserAndLogin({ email: "todo-owner-2@example.com" });
    const intruder = await createUserAndLogin({ email: "todo-intruder@example.com" });

    const createResponse = await request(app)
      .post("/api/v1/todos")
      .set(authHeader(owner.token))
      .send({ title: "Private todo" });

    expect(createResponse.status).toBe(201);
    const todoId = createResponse.body.data.todo.id;

    const getResponse = await request(app)
      .get(`/api/v1/todos/${todoId}`)
      .set(authHeader(intruder.token));

    expect(getResponse.status).toBe(403);
    expect(getResponse.body).toEqual({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "접근 권한이 없습니다.",
      },
    });

    const updateResponse = await request(app)
      .put(`/api/v1/todos/${todoId}`)
      .set(authHeader(intruder.token))
      .send({ title: "Hacked title" });

    expect(updateResponse.status).toBe(403);
    expect(updateResponse.body).toEqual({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "접근 권한이 없습니다.",
      },
    });

    const deleteResponse = await request(app)
      .delete(`/api/v1/todos/${todoId}`)
      .set(authHeader(intruder.token));

    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body).toEqual({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "접근 권한이 없습니다.",
      },
    });

    expect(await findTodoById(todoId)).toMatchObject({
      id: todoId,
      user_id: owner.user.id,
      title: "Private todo",
      is_completed: false,
    });
  });

  it("complete endpoint는 완료 상태를 토글하고 완료된 지난 할일은 overdue가 아니어야 한다 (BR-DATA-02)", async () => {
    const owner = await createUserAndLogin({ email: "todo-owner-3@example.com" });

    const createResponse = await request(app)
      .post("/api/v1/todos")
      .set(authHeader(owner.token))
      .send({
        title: "Past due todo",
        due_date: "2000-01-01T00:00:00.000Z",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.todo).toMatchObject({
      title: "Past due todo",
      is_completed: false,
      status: "overdue",
      is_overdue: true,
    });

    const todoId = createResponse.body.data.todo.id;

    const toggleResponse = await request(app)
      .patch(`/api/v1/todos/${todoId}/complete`)
      .set(authHeader(owner.token));

    expect(toggleResponse.status).toBe(200);
    expect(toggleResponse.body.success).toBe(true);
    expect(toggleResponse.body.data.todo).toMatchObject({
      id: todoId,
      is_completed: true,
      status: "completed",
      is_overdue: false,
      is_due_soon: false,
    });

    const detailResponse = await request(app)
      .get(`/api/v1/todos/${todoId}`)
      .set(authHeader(owner.token));

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.data.todo).toMatchObject({
      id: todoId,
      is_completed: true,
      status: "completed",
      is_overdue: false,
    });

    const listResponse = await request(app)
      .get("/api/v1/todos")
      .set(authHeader(owner.token));

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: todoId,
          is_completed: true,
          status: "completed",
          is_overdue: false,
        }),
      ])
    );

    expect(await findTodoById(todoId)).toMatchObject({
      id: todoId,
      is_completed: true,
    });
  });
});
