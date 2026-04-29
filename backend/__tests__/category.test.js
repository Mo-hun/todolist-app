const {
  request,
  app,
  resetTestDatabase,
  truncateTables,
  closePool,
  createUserAndLogin,
  authHeader,
  findCategoriesByUserId,
  findTodoById,
} = require('./helpers/integrationTestUtils');

async function createCategory(token, name) {
  return request(app)
    .post('/api/v1/categories')
    .set(authHeader(token))
    .send({ name });
}

async function createTodo(token, payload) {
  return request(app)
    .post('/api/v1/todos')
    .set(authHeader(token))
    .send(payload);
}

describe('BE-09 Category integration', () => {
  beforeAll(async () => {
    await resetTestDatabase();
  });

  afterEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await closePool();
  });

  it('supports category CRUD for the authenticated user', async () => {
    const owner = await createUserAndLogin({ email: 'category-owner@example.com' });
    const outsider = await createUserAndLogin({ email: 'category-outsider@example.com' });

    const createResponse = await createCategory(owner.token, '업무');

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.category).toEqual(
      expect.objectContaining({
        user_id: owner.user.id,
        name: '업무',
      })
    );

    const createdCategoryId = createResponse.body.data.category.id;

    const ownerListResponse = await request(app)
      .get('/api/v1/categories')
      .set(authHeader(owner.token));

    expect(ownerListResponse.status).toBe(200);
    expect(ownerListResponse.body.success).toBe(true);
    expect(ownerListResponse.body.data.categories).toHaveLength(1);
    expect(ownerListResponse.body.data.categories[0]).toEqual(
      expect.objectContaining({
        id: createdCategoryId,
        user_id: owner.user.id,
        name: '업무',
      })
    );

    const outsiderListResponse = await request(app)
      .get('/api/v1/categories')
      .set(authHeader(outsider.token));

    expect(outsiderListResponse.status).toBe(200);
    expect(outsiderListResponse.body.data.categories).toEqual([]);

    const updateResponse = await request(app)
      .put(`/api/v1/categories/${createdCategoryId}`)
      .set(authHeader(owner.token))
      .send({ name: '개인' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.category).toEqual(
      expect.objectContaining({
        id: createdCategoryId,
        user_id: owner.user.id,
        name: '개인',
      })
    );

    const deleteResponse = await request(app)
      .delete(`/api/v1/categories/${createdCategoryId}`)
      .set(authHeader(owner.token));

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      success: true,
      data: { message: '카테고리가 삭제되었습니다.' },
    });

    const remainingCategories = await findCategoriesByUserId(owner.user.id);
    expect(remainingCategories).toEqual([]);
  });

  it('returns 403 when updating another user category (BR-AUTH-03)', async () => {
    const owner = await createUserAndLogin({ email: 'category-update-owner@example.com' });
    const attacker = await createUserAndLogin({ email: 'category-update-attacker@example.com' });
    const createResponse = await createCategory(owner.token, '소유자 카테고리');

    const updateResponse = await request(app)
      .put(`/api/v1/categories/${createResponse.body.data.category.id}`)
      .set(authHeader(attacker.token))
      .send({ name: '탈취 시도' });

    expect(updateResponse.status).toBe(403);
    expect(updateResponse.body).toEqual({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '접근 권한이 없습니다.',
      },
    });
  });

  it('returns 403 when deleting another user category (BR-AUTH-03)', async () => {
    const owner = await createUserAndLogin({ email: 'category-delete-owner@example.com' });
    const attacker = await createUserAndLogin({ email: 'category-delete-attacker@example.com' });
    const createResponse = await createCategory(owner.token, '보호 카테고리');

    const deleteResponse = await request(app)
      .delete(`/api/v1/categories/${createResponse.body.data.category.id}`)
      .set(authHeader(attacker.token));

    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body).toEqual({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '접근 권한이 없습니다.',
      },
    });
  });

  it('preserves linked todos by nulling category_id when a category is deleted (BR-DATA-03)', async () => {
    const owner = await createUserAndLogin({ email: 'category-nullify-owner@example.com' });
    const createCategoryResponse = await createCategory(owner.token, '연결 카테고리');
    const categoryId = createCategoryResponse.body.data.category.id;

    const createTodoResponse = await createTodo(owner.token, {
      title: '카테고리 삭제 후에도 남아야 하는 할일',
      description: '연결만 제거되어야 한다',
      category_id: categoryId,
    });

    expect(createTodoResponse.status).toBe(201);
    expect(createTodoResponse.body.success).toBe(true);
    expect(createTodoResponse.body.data.todo.category_id).toBe(categoryId);

    const todoId = createTodoResponse.body.data.todo.id;

    const deleteCategoryResponse = await request(app)
      .delete(`/api/v1/categories/${categoryId}`)
      .set(authHeader(owner.token));

    expect(deleteCategoryResponse.status).toBe(200);

    const persistedTodo = await findTodoById(todoId);
    expect(persistedTodo).toEqual(
      expect.objectContaining({
        id: todoId,
        user_id: owner.user.id,
        title: '카테고리 삭제 후에도 남아야 하는 할일',
        category_id: null,
      })
    );
  });
});
