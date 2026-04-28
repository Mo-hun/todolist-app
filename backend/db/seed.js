const bcrypt = require("bcrypt");
const { pool } = require("../src/config/db");
const env = require("../src/config/env");

const USERS = [
  {
    email: "test1@example.com",
    password: "Password123!",
    categories: ["업무", "개인", "학습"],
    todos: [
      {
        title: "기획 문서 검토",
        description: "PRD와 도메인 정의서를 다시 읽는다",
        dueOffsetHours: 6,
        category: "업무",
        isCompleted: false,
      },
      {
        title: "세금 신고 자료 준비",
        description: null,
        dueOffsetHours: -12,
        category: "개인",
        isCompleted: false,
      },
      {
        title: "PostgreSQL 인덱스 학습",
        description: "복합 인덱스 사례 정리",
        dueOffsetHours: 48,
        category: "학습",
        isCompleted: true,
      },
      {
        title: "분류 없는 할일 예시",
        description: "카테고리 없이 저장되는지 확인",
        dueOffsetHours: null,
        category: null,
        isCompleted: false,
      },
    ],
  },
  {
    email: "test2@example.com",
    password: "Password123!",
    categories: ["업무", "개인", "학습"],
    todos: [
      {
        title: "회의 준비",
        description: "오전 회의 안건 정리",
        dueOffsetHours: 20,
        category: "업무",
        isCompleted: false,
      },
      {
        title: "장보기",
        description: "우유와 과일 구매",
        dueOffsetHours: -4,
        category: "개인",
        isCompleted: true,
      },
      {
        title: "Node.js 문서 읽기",
        description: null,
        dueOffsetHours: 72,
        category: "학습",
        isCompleted: false,
      },
    ],
  },
];

function buildDueDate(offsetHours) {
  if (offsetHours === null || offsetHours === undefined) {
    return null;
  }

  const date = new Date();
  date.setHours(date.getHours() + offsetHours);
  return date;
}

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const userData of USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, env.BCRYPT_COST);
      const userResult = await client.query(
        `
          INSERT INTO users (email, password)
          VALUES ($1, $2)
          ON CONFLICT (email) DO UPDATE
            SET email = EXCLUDED.email
          RETURNING id
        `,
        [userData.email, hashedPassword]
      );

      const userId = userResult.rows[0].id;
      const categoryIds = new Map();

      for (const categoryName of userData.categories) {
        const categoryResult = await client.query(
          `
            INSERT INTO categories (user_id, name)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING id
          `,
          [userId, categoryName]
        );

        if (categoryResult.rows[0]) {
          categoryIds.set(categoryName, categoryResult.rows[0].id);
        } else {
          const existing = await client.query(
            "SELECT id FROM categories WHERE user_id = $1 AND name = $2",
            [userId, categoryName]
          );
          categoryIds.set(categoryName, existing.rows[0].id);
        }
      }

      for (const todo of userData.todos) {
        await client.query(
          `
            INSERT INTO todos (
              user_id,
              category_id,
              title,
              description,
              due_date,
              is_completed
            )
            SELECT
              $1::uuid,
              $2::uuid,
              $3::varchar(255),
              $4::text,
              $5::timestamp,
              $6::boolean
            WHERE NOT EXISTS (
              SELECT 1
              FROM todos
              WHERE user_id = $1::uuid AND title = $3::varchar(255)
            )
          `,
          [
            userId,
            todo.category ? categoryIds.get(todo.category) : null,
            todo.title,
            todo.description,
            buildDueDate(todo.dueOffsetHours),
            todo.isCompleted,
          ]
        );
      }
    }

    await client.query("COMMIT");
    console.log("Seed completed.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
