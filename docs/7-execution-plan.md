# TodoList 프로젝트 실행계획

**버전**: 1.0
**작성일**: 2026-04-28
**작성자**: Project Planner / Claude

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2026-04-28 | Project Planner / Claude | 최초 작성 — DB(5) / BE(9) / FE(9) 총 23개 태스크 |

---

## 전체 태스크 개요

| 구분 | 태스크 수 | 예상 소요 |
|------|----------|-----------|
| Database | 5개 | 약 3.5시간 |
| Backend | 9개 | 약 8.5시간 |
| Frontend | 9개 | 약 8.8시간 |
| **합계** | **23개** | **약 12시간** (병렬 진행 시) |

---

## 전체 의존성 맵

```
[DB]
TASK-DB-01
  ├── TASK-DB-02
  │     └── TASK-DB-03
  │           └── TASK-DB-04
  │                 └── TASK-DB-05
  └── (BE-01, BE-02 에 의해 참조)

[Backend]  — DB-01 완료 후 시작
TASK-BE-01
  ├── TASK-BE-02 ──────────────────┐
  ├── TASK-BE-04 ──┐               │
  └── (구조 준비)   ├── TASK-BE-05 ─┤
TASK-BE-03 ────────┘   TASK-BE-06 ─┤─→ TASK-BE-08 → TASK-BE-09
                        TASK-BE-07 ─┘

[Frontend]  — BE-01과 병렬 시작 가능
TASK-FE-01
  ├── TASK-FE-02 ─────────────────────────────┐
  ├── TASK-FE-03 ──┐                           │
  ├── TASK-FE-04   ├── TASK-FE-05              │
  └── (구조 준비)   │     └── TASK-FE-06       │
                    │     └── TASK-FE-07 ──────┤
                    └───────────────────────── TASK-FE-08 → TASK-FE-09
```

---

## Phase 1 일정 (2026-04-28 ~ 2026-04-30)

| 일자 | 병렬 A (DB/BE) | 병렬 B (FE) |
|------|--------------|-------------|
| 04-28 | DB-01 → DB-02~03 / BE-01 → BE-02, BE-04 | FE-01 → FE-02, FE-03, FE-04 |
| 04-29 | DB-04~05 / BE-03, BE-05, BE-06 | FE-05, FE-06, FE-07 |
| 04-30 | BE-07 → BE-08 → BE-09 | FE-08 → FE-09 |

---

## 1. Database 태스크

### TASK-DB-01: PostgreSQL 환경 설정 및 DB/유저 생성

- **목적**: 로컬 개발 환경에서 애플리케이션 전용 PostgreSQL DB와 유저를 생성하고 환경변수로 관리한다.
- **작업 내용**:
  - [ ] PostgreSQL 설치 확인 및 서비스 실행 (`brew services start postgresql` 또는 `pg_ctl start`)
  - [ ] 전용 DB 유저 생성: `CREATE USER todolist_user WITH PASSWORD '...';`
  - [ ] 개발용 DB 생성: `CREATE DATABASE todolist_dev OWNER todolist_user;`
  - [ ] 테스트용 DB 생성: `CREATE DATABASE todolist_test OWNER todolist_user;`
  - [ ] `backend/.env` 파일 작성 (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, PORT 등)
  - [ ] `backend/.env.example` 파일 작성 (키만, 값 제외)
  - [ ] `.gitignore`에 `.env` 등록 확인
- **완료 조건**:
  - [ ] `psql -U todolist_user -d todolist_dev` 접속 성공
  - [ ] `todolist_dev`, `todolist_test` 두 DB 모두 존재 확인
  - [ ] `.env` 파일이 Git에 포함되지 않음
- **의존성**: 없음
- **예상 소요**: 30분

---

### TASK-DB-02: 마이그레이션 파일 작성 (001 ~ 003)

- **목적**: `users`, `categories`, `todos` 테이블과 인덱스를 순번 prefix SQL 파일로 관리하여 스키마 이력을 추적한다.
- **작업 내용**:
  - [ ] `backend/db/migrations/` 디렉토리 생성
  - [ ] `001_create_users.sql` 작성 (uuid-ossp 확장, users 테이블)
  - [ ] `002_create_categories.sql` 작성 (categories 테이블, FK→users CASCADE, idx_categories_user_id)
  - [ ] `003_create_todos.sql` 작성
    - [ ] todos 테이블 (FK→users CASCADE, FK→categories SET NULL)
    - [ ] `idx_todos_user_id`, `idx_todos_category_id`
    - [ ] `idx_todos_due_date` (WHERE due_date IS NOT NULL)
    - [ ] `idx_todos_user_completed_due` (복합 인덱스)
  - [ ] 각 파일에 DOWN(롤백) 섹션 주석으로 포함
- **완료 조건**:
  - [ ] 세 파일 모두 `backend/db/migrations/` 하위에 순번 prefix로 존재
  - [ ] `psql`로 직접 실행 시 오류 없이 테이블 및 인덱스 생성됨
  - [ ] `\d todos`로 FK 제약조건 및 기본값 확인
  - [ ] 인덱스 5개 모두 존재 확인 (`\di`)
- **의존성**: TASK-DB-01
- **예상 소요**: 45분

---

### TASK-DB-03: 마이그레이션 실행 스크립트 작성

- **목적**: SQL 마이그레이션 파일을 순서대로 자동 적용하고 중복 실행을 방지하는 스크립트를 구축한다.
- **작업 내용**:
  - [ ] `backend/db/migrate.js` 스크립트 작성
    - [ ] `schema_migrations` 추적 테이블 자동 생성
    - [ ] `migrations/` 디렉토리의 `.sql` 파일을 파일명 기준 오름차순 정렬 후 순차 실행
    - [ ] 이미 적용된 파일은 건너뜀 (멱등성 보장)
    - [ ] 실행 실패 시 트랜잭션 롤백 후 `process.exit(1)`
  - [ ] `backend/package.json` scripts 등록
    - [ ] `"db:migrate": "node db/migrate.js"`
    - [ ] `"db:migrate:fresh"`: 개발 전용 DB 초기화 후 마이그레이션 재실행
- **완료 조건**:
  - [ ] `npm run db:migrate` 최초 실행 시 3개 파일 모두 적용
  - [ ] 재실행 시 중복 오류 없이 "already applied" 메시지 출력
  - [ ] `SELECT * FROM schema_migrations;` 결과에 3개 레코드 존재
- **의존성**: TASK-DB-02
- **예상 소요**: 45분

---

### TASK-DB-04: 개발용 시드 데이터 작성

- **목적**: 개발·테스트 환경에서 즉시 사용할 수 있는 샘플 데이터를 제공한다.
- **작업 내용**:
  - [ ] `backend/db/seed.js` 스크립트 작성
    - [ ] 테스트 유저 2명 INSERT (bcrypt 해시 적용): `test1@example.com`, `test2@example.com`
    - [ ] 각 유저별 카테고리 3개 INSERT (`업무`, `개인`, `학습`)
    - [ ] 할일 다양한 상태로 INSERT: 완료/미완료, due_date 있는 것/없는 것, 기한 임박, 기한 초과 혼합
    - [ ] `ON CONFLICT DO NOTHING`으로 멱등성 보장
  - [ ] `backend/package.json` scripts 등록: `"db:seed": "node db/seed.js"`
- **완료 조건**:
  - [ ] `npm run db:seed` 실행 후 `SELECT COUNT(*) FROM todos` 결과가 0보다 큼
  - [ ] 시드 유저로 로그인 API 호출 시 정상 응답
  - [ ] 재실행 시 중복 데이터 미생성
- **의존성**: TASK-DB-03
- **예상 소요**: 30분

---

### TASK-DB-05: DB 연결 모듈 및 연결 검증

- **목적**: `pg.Pool` 기반 공유 연결 모듈을 작성하고 앱 시작 시 연결 상태를 검증한다.
- **작업 내용**:
  - [ ] `backend/src/config/db.js` 작성: `pg.Pool` 인스턴스를 `.env` 값 기반으로 초기화 후 export
  - [ ] `pool.on('error', ...)` 핸들러 등록 (연결 실패 시 에러 로깅)
  - [ ] 헬스체크 함수 작성: `pool.query('SELECT NOW()')` 실행 후 성공/실패 로그 출력
  - [ ] 실패 시 `process.exit(1)` 처리
  - [ ] `"db:check": "node src/config/db.js"` scripts 등록
- **완료 조건**:
  - [ ] `npm run db:check` 실행 시 `DB connected: <timestamp>` 출력
  - [ ] 잘못된 DB 설정 시 명확한 에러 메시지와 exit code 1 확인
  - [ ] `db.js`가 싱글턴으로 동작하여 모든 모듈에서 동일 인스턴스 공유
- **의존성**: TASK-DB-01
- **예상 소요**: 30분

---

## 2. Backend 태스크

### TASK-BE-01: 백엔드 프로젝트 초기 설정

- **목적**: Node.js 24 + Express 5 기반 백엔드 프로젝트의 기초 골격을 구성하고 환경변수 및 디렉토리 구조를 확립한다.
- **작업 내용**:
  - [ ] `backend/` 디렉토리 생성 및 `npm init -y` 실행
  - [ ] 프로덕션 의존성 설치: `express@^5`, `pg`, `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`, `helmet`
  - [ ] 개발 의존성 설치: `nodemon`, `jest`, `supertest`
  - [ ] `backend/src/` 하위 디렉토리 생성: `routes/`, `controllers/`, `services/`, `repositories/`, `middlewares/`, `utils/`, `config/`
  - [ ] `.env`, `.env.example` 파일 작성
  - [ ] `.gitignore`에 `.env`, `node_modules/` 추가
  - [ ] `package.json` scripts: `"dev": "nodemon src/server.js"`, `"start": "node src/server.js"`
- **완료 조건**:
  - [ ] `npm run dev` 실행 시 서버가 지정 PORT에서 기동됨
  - [ ] 디렉토리 구조가 설계(`docs/4-architecture-principles.md`)와 일치함
  - [ ] `.env`가 `.gitignore`에 포함되어 버전 관리에서 제외됨
- **의존성**: TASK-DB-01
- **예상 소요**: 30분

---

### TASK-BE-02: DB 연결 풀(pg Pool) 및 config 설정

- **목적**: PostgreSQL 연결 Pool을 싱글턴으로 구성하고 앱 전역에서 재사용 가능하게 한다.
- **작업 내용**:
  - [ ] `backend/src/config/db.js`: `pg.Pool` 인스턴스를 `.env` 값 기반으로 초기화
  - [ ] `backend/src/config/env.js`: `process.env` 값을 읽어 상수로 export (PORT, JWT_SECRET, BCRYPT_COST 등)
  - [ ] DB 접속 실패 시 명확한 에러 메시지 출력 및 `process.exit(1)` 처리
  - [ ] `pool.on('error', ...)` 핸들러 등록
- **완료 조건**:
  - [ ] 앱 기동 시 DB 연결 성공 로그 출력
  - [ ] 잘못된 DB 설정 시 프로세스가 종료됨
  - [ ] `pool` 인스턴스가 다른 모듈에서 import하여 사용 가능함
- **의존성**: TASK-BE-01, TASK-DB-01
- **예상 소요**: 30분

---

### TASK-BE-03: 공통 미들웨어 구현

- **목적**: JWT 인증 검증, 전역 에러 처리, 404 처리를 미들웨어로 분리한다.
- **작업 내용**:
  - [ ] `AppError` 커스텀 에러 클래스 작성 (`statusCode`, `code`, `message` 포함)
  - [ ] `backend/src/middlewares/authenticateToken.js` 구현
    - [ ] `Authorization: Bearer <token>` 헤더 파싱
    - [ ] `jsonwebtoken.verify()`로 HS-512 서명 검증
    - [ ] 검증 성공 시 `req.user = { id, email }` 주입
    - [ ] 토큰 누락 → `401 UNAUTHORIZED`, 만료/위조 → `401 TOKEN_INVALID`
  - [ ] `backend/src/middlewares/errorHandler.js` 구현
    - [ ] `err.statusCode`, `err.code`, `err.message` 기반 에러 응답 포맷 적용
    - [ ] 에러 응답 포맷: `{ success: false, error: { code, message } }`
    - [ ] 예상치 못한 에러 → `500 INTERNAL_SERVER_ERROR`
    - [ ] `500` 응답에 스택 트레이스·SQL 미포함
  - [ ] `backend/src/middlewares/notFound.js` 구현: 매칭 없는 라우트 `404` 응답
- **완료 조건**:
  - [ ] 유효한 JWT로 보호 라우트 접근 시 `req.user`가 정상 주입됨
  - [ ] 토큰 없이 보호 라우트 접근 시 `401` 응답
  - [ ] 존재하지 않는 경로 요청 시 `404` 응답
  - [ ] Service에서 `AppError` throw 시 `errorHandler`가 올바른 포맷으로 응답함
- **의존성**: TASK-BE-01, TASK-BE-04
- **예상 소요**: 60분

---

### TASK-BE-04: 공통 유틸리티 구현

- **목적**: JWT 발급/검증, 성공/에러 응답 생성, 공통 상수를 유틸리티로 분리한다.
- **작업 내용**:
  - [ ] `backend/src/utils/jwtUtils.js`
    - [ ] `generateToken(payload)`: HS-512 서명, 만료시간 설정
    - [ ] `verifyToken(token)`: 검증 후 payload 반환, 실패 시 `AppError` throw
  - [ ] `backend/src/utils/responseHelper.js`
    - [ ] `sendSuccess(res, data, statusCode = 200)`: `{ success: true, data }` 응답
    - [ ] `sendError(res, code, message, statusCode)`: `{ success: false, error: { code, message } }` 응답
  - [ ] `backend/src/utils/constants.js`
    - [ ] HTTP 상태 코드 상수 (`HTTP_STATUS`)
    - [ ] 에러 코드 상수 (`ERROR_CODE`: `DUPLICATE_EMAIL`, `NOT_FOUND`, `UNAUTHORIZED` 등)
  - [ ] bcrypt 래퍼 함수: `hashPassword(plain)`, `comparePassword(plain, hash)` — cost 12+ 적용
- **완료 조건**:
  - [ ] `generateToken` → `verifyToken` 왕복 테스트 통과
  - [ ] `sendSuccess`, `sendError`가 각각 올바른 포맷의 JSON을 응답함
  - [ ] `hashPassword` 결과가 `comparePassword`로 검증 가능함
- **의존성**: TASK-BE-01
- **예상 소요**: 45분

---

### TASK-BE-05: 인증 기능 구현 (register / login / 탈퇴)

- **목적**: 회원가입, 로그인, 회원탈퇴 API를 Repository → Service → Controller → Route 순서로 구현한다.
- **작업 내용**:
  - [ ] **Repository** `userRepository.js`: `findByEmail`, `create`, `deleteById`
  - [ ] **Service** `authService.js`
    - [ ] `register`: 이메일 중복 검사(BR-AUTH-02), bcrypt 해싱, 사용자 생성
    - [ ] `login`: 이메일 조회, 비밀번호 검증, JWT 발급
    - [ ] `withdraw`: 사용자 존재 확인 후 Hard Delete (BR-DATA-05)
  - [ ] **Controller** `authController.js`: `register`(201), `login`(200+JWT), `withdraw`(200)
  - [ ] **Route** `authRoutes.js`
    - [ ] `POST /api/v1/auth/register`
    - [ ] `POST /api/v1/auth/login`
    - [ ] `DELETE /api/v1/auth/me` (authenticateToken 적용)
  - [ ] 이메일 형식 및 비밀번호 최소 길이 입력값 검증
- **완료 조건**:
  - [ ] 신규 이메일 회원가입 시 `201` 응답
  - [ ] 중복 이메일 가입 시 `409 DUPLICATE_EMAIL` 에러 응답 (BR-AUTH-02)
  - [ ] 올바른 자격증명 로그인 시 JWT 포함 `200` 응답
  - [ ] 잘못된 비밀번호 로그인 시 `401` 에러 응답
  - [ ] 회원탈퇴 시 관련 데이터 Hard Delete 및 `200` 응답 (BR-DATA-05)
- **의존성**: TASK-BE-02, TASK-BE-03, TASK-BE-04, TASK-DB-02
- **예상 소요**: 90분

---

### TASK-BE-06: 카테고리 기능 구현 (CRUD)

- **목적**: 카테고리 목록 조회, 생성, 수정, 삭제 API를 구현하고 소유권 검증 및 삭제 시 할일 보존 규칙을 적용한다.
- **작업 내용**:
  - [ ] **Repository** `categoryRepository.js`: `findAllByUserId`, `findById`, `create`, `update`, `deleteById`
  - [ ] **Service** `categoryService.js`
    - [ ] `getCategories(userId)`: 소유 카테고리 목록 반환
    - [ ] `createCategory(userId, { name })`: 생성
    - [ ] `updateCategory(userId, categoryId, { name })`: 소유권 검증(BR-AUTH-03) 후 수정
    - [ ] `deleteCategory(userId, categoryId)`: 소유권 검증(BR-AUTH-03) 후 삭제 (DB FK SET NULL으로 할일 보존, BR-DATA-03)
  - [ ] **Controller** `categoryController.js`: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`
  - [ ] **Route** `categoryRoutes.js` (모든 라우트 `authenticateToken` 적용)
    - [ ] `GET /api/v1/categories`
    - [ ] `POST /api/v1/categories`
    - [ ] `PUT /api/v1/categories/:id`
    - [ ] `DELETE /api/v1/categories/:id`
- **완료 조건**:
  - [ ] `GET /api/v1/categories`: 인증 사용자의 카테고리 목록만 반환
  - [ ] `POST /api/v1/categories`: 카테고리 생성 후 `201` 응답
  - [ ] `PUT /api/v1/categories/:id`: 타인 카테고리 수정 시 `403` 에러 (BR-AUTH-03)
  - [ ] `DELETE /api/v1/categories/:id`: 삭제 후 해당 카테고리의 할일이 `category_id = NULL`로 보존 (BR-DATA-03)
- **의존성**: TASK-BE-02, TASK-BE-03, TASK-BE-04, TASK-DB-02
- **예상 소요**: 75분

---

### TASK-BE-07: 할일 기능 구현 (CRUD + 완료 토글)

- **목적**: 할일 목록 조회, 생성, 수정, 삭제, 완료 토글 API를 구현하고 비즈니스 규칙을 적용한다.
- **작업 내용**:
  - [ ] **Repository** `todoRepository.js`: `findAllByUserId(userId, filters)`, `findById`, `create`, `update`, `deleteById`, `toggleComplete`
  - [ ] **Service** `todoService.js`
    - [ ] `getTodos(userId, filters)`: 목록 반환, 완료된 항목은 기한초과 분류 제외 (BR-DATA-02)
    - [ ] `createTodo`, `getTodoById`, `updateTodo`, `deleteTodo`: 소유권 검증 (BR-AUTH-03)
    - [ ] `toggleComplete(userId, todoId)`: 소유권 검증 후 완료 상태 반전
  - [ ] **Controller** `todoController.js`: `getTodos`, `createTodo`, `getTodoById`, `updateTodo`, `deleteTodo`, `toggleComplete`
  - [ ] **Route** `todoRoutes.js` (모든 라우트 `authenticateToken` 적용)
    - [ ] `GET /api/v1/todos`
    - [ ] `POST /api/v1/todos`
    - [ ] `GET /api/v1/todos/:id`
    - [ ] `PUT /api/v1/todos/:id`
    - [ ] `DELETE /api/v1/todos/:id`
    - [ ] `PATCH /api/v1/todos/:id/complete`
- **완료 조건**:
  - [ ] `GET /api/v1/todos`: 인증 사용자의 할일만 반환, 완료된 항목은 기한초과 필드 `false` (BR-DATA-02)
  - [ ] `POST /api/v1/todos`: 생성 후 `201` 응답
  - [ ] `PUT /api/v1/todos/:id`: 타인 할일 수정 시 `403` (BR-AUTH-03)
  - [ ] `PATCH /api/v1/todos/:id/complete`: 완료 상태가 반전되어 응답됨
- **의존성**: TASK-BE-02, TASK-BE-03, TASK-BE-04, TASK-BE-06, TASK-DB-02
- **예상 소요**: 90분

---

### TASK-BE-08: Express 앱 통합 및 서버 기동 검증

- **목적**: 구현된 라우터·미들웨어를 Express 앱에 통합하고 실제 서버 기동을 검증한다.
- **작업 내용**:
  - [ ] `backend/src/app.js` 생성
    - [ ] `helmet()`, `cors()`, `express.json()` 전역 미들웨어 등록
    - [ ] `GET /api/v1/health` 헬스체크 엔드포인트 등록 (`SELECT 1` 포함)
    - [ ] `authRoutes`, `categoryRoutes`, `todoRoutes` 마운트 (`/api/v1`)
    - [ ] `notFound`, `errorHandler` 미들웨어 최후 등록
  - [ ] `backend/src/server.js` 생성: DB 연결 확인 후 `app.listen(PORT)`
  - [ ] Express 5 비동기 라우트 핸들러 에러 자동 전파 동작 확인
- **완료 조건**:
  - [ ] `npm run dev` 실행 시 "Server running on port XXXX" 및 "DB connected" 로그 출력
  - [ ] `GET /api/v1/health` → `200 { success: true, data: { status: "ok" } }`
  - [ ] 미등록 경로 요청 시 `404 NOT_FOUND` 응답
  - [ ] Service `AppError`가 `errorHandler`까지 전파되어 올바른 포맷으로 응답됨
- **의존성**: TASK-BE-03, TASK-BE-04, TASK-BE-05, TASK-BE-06, TASK-BE-07
- **예상 소요**: 45분

---

### TASK-BE-09: API 통합 테스트 (Supertest)

- **목적**: Supertest를 사용한 통합 테스트로 각 API의 정상 동작 및 에러 케이스를 자동 검증한다.
- **작업 내용**:
  - [ ] 테스트 환경 설정: `.env.test` 분리, 테스트용 DB 스키마 초기화 스크립트
  - [ ] **인증 테스트** `backend/__tests__/auth.test.js`
    - [ ] 회원가입 성공 (201)
    - [ ] 중복 이메일 가입 실패 (409, BR-AUTH-02)
    - [ ] 로그인 성공 → JWT 수신 확인
    - [ ] 잘못된 비밀번호 로그인 실패 (401)
    - [ ] 미인증 보호 라우트 접근 실패 (401)
    - [ ] 회원탈퇴 후 데이터 삭제 확인 (BR-DATA-05)
  - [ ] **카테고리 테스트** `backend/__tests__/category.test.js`
    - [ ] CRUD 정상 동작
    - [ ] 타인 카테고리 수정·삭제 시 `403` (BR-AUTH-03)
    - [ ] 카테고리 삭제 후 할일 미분류 보존 확인 (BR-DATA-03)
  - [ ] **할일 테스트** `backend/__tests__/todo.test.js`
    - [ ] CRUD 정상 동작
    - [ ] 타인 할일 접근 시 `403` (BR-AUTH-03)
    - [ ] 완료 토글 동작 확인
    - [ ] 완료된 할일의 기한초과 필드 검증 (BR-DATA-02)
  - [ ] `beforeEach` / `afterAll` DB 정리
  - [ ] `"test": "jest --runInBand"` scripts 등록
- **완료 조건**:
  - [ ] `npm test` 실행 시 전체 테스트 통과 (0 failed)
  - [ ] 모든 비즈니스 규칙(BR-AUTH-02, BR-AUTH-03, BR-DATA-02, BR-DATA-03, BR-DATA-05)에 대한 테스트 케이스 존재
  - [ ] 테스트가 독립적으로 실행 가능하며 순서에 의존하지 않음
- **의존성**: TASK-BE-05, TASK-BE-06, TASK-BE-07, TASK-BE-08
- **예상 소요**: 90분

---

## 3. Frontend 태스크

### TASK-FE-01: 프론트엔드 프로젝트 초기 설정

- **목적**: Vite 기반 React 19 프로젝트를 생성하고 필요한 패키지를 설치하며 디렉토리 구조를 확립한다.
- **작업 내용**:
  - [ ] `npm create vite@latest frontend -- --template react` 실행
  - [ ] 패키지 설치: `react-router-dom`, `axios`, `@tanstack/react-query`, `zustand`, `tailwindcss`, `postcss`, `autoprefixer`
  - [ ] `tailwind.config.js`, `postcss.config.js` 설정 및 `index.css`에 Tailwind 디렉티브 추가
  - [ ] `vite.config.js`에 경로 별칭(`@/`) 설정
  - [ ] 디렉토리 생성: `src/api/`, `src/components/common/`, `src/components/todo/`, `src/components/category/`, `src/hooks/`, `src/pages/`, `src/stores/`, `src/utils/`, `src/router/`
  - [ ] `src/main.jsx`에 `QueryClientProvider` 래핑 설정
  - [ ] `frontend/.env` 파일 생성 및 `VITE_API_BASE_URL` 환경변수 정의
- **완료 조건**:
  - [ ] `npm run dev` 실행 시 브라우저에서 Vite 기본 페이지 정상 렌더링
  - [ ] Tailwind 유틸리티 클래스가 적용됨 (임시 클래스 테스트)
  - [ ] 모든 디렉토리가 정의된 구조대로 생성되어 있음
- **의존성**: 없음
- **예상 소요**: 30분

---

### TASK-FE-02: API Client 구현

- **목적**: 백엔드와 통신하는 axios 인스턴스 및 도메인별 API 함수를 구현하여 모든 HTTP 요청의 기반을 마련한다.
- **작업 내용**:
  - [ ] `src/api/client.js`: axios 인스턴스 생성, `VITE_API_BASE_URL` 기반 `baseURL` 설정
  - [ ] 요청 인터셉터: `authStore`에서 토큰을 읽어 `Authorization: Bearer <token>` 헤더 자동 주입
  - [ ] 응답 인터셉터: `401` 응답 시 `authStore` 초기화 후 `/login` 리다이렉트
  - [ ] `src/api/authApi.js`: `login(credentials)`, `register(userData)` 함수
  - [ ] `src/api/todoApi.js`: `getTodos(params)`, `createTodo(data)`, `updateTodo(id, data)`, `deleteTodo(id)`, `toggleTodo(id)` 함수
  - [ ] `src/api/categoryApi.js`: `getCategories()`, `createCategory(data)`, `updateCategory(id, data)`, `deleteCategory(id)` 함수
- **완료 조건**:
  - [ ] axios 인스턴스가 모든 요청에 `Authorization` 헤더를 자동으로 포함함
  - [ ] `401` 응답 시 자동 로그아웃 및 리다이렉트 동작
  - [ ] 각 API 함수가 올바른 엔드포인트와 HTTP 메서드를 사용함
- **의존성**: TASK-FE-01
- **예상 소요**: 45분

---

### TASK-FE-03: Zustand 스토어 구현

- **목적**: 전역 클라이언트 상태(인증, 할일 필터/정렬, 선택된 카테고리)를 Zustand로 관리한다.
- **작업 내용**:
  - [ ] `src/stores/authStore.js`: 상태(`token`, `user`, `isAuthenticated`), 액션(`setAuth`, `clearAuth`), `persist` 미들웨어로 `localStorage` 영속화
  - [ ] `src/stores/todoStore.js`: 상태(`filter`, `sortBy`), 액션(`setFilter`, `setSortBy`)
  - [ ] `src/stores/categoryStore.js`: 상태(`selectedCategoryId`), 액션(`selectCategory`, `clearCategory`)
- **완료 조건**:
  - [ ] 페이지 새로고침 후에도 `authStore`의 `token`, `user`가 유지됨
  - [ ] `todoStore`의 필터/정렬 변경이 컴포넌트에 즉시 반영됨
  - [ ] `categoryStore`의 선택 상태가 페이지 간 이동 시 유지됨
- **의존성**: TASK-FE-01
- **예상 소요**: 40분

---

### TASK-FE-04: 공통 컴포넌트 구현

- **목적**: 프로젝트 전반에서 재사용되는 UI 기본 단위 컴포넌트를 구현하여 UI 일관성을 확보한다.
- **작업 내용**:
  - [ ] `src/components/common/Button.jsx`: `variant`(primary/secondary/danger), `size`, `disabled`, `loading` props; Tailwind 조건 클래스 적용
  - [ ] `src/components/common/InputField.jsx`: `label`, `error`, `placeholder` props; 에러 메시지 표시 영역 포함
  - [ ] `src/components/common/Modal.jsx`: `isOpen`, `onClose`, `title`, `children` props; 오버레이 클릭·ESC 키로 닫힘
  - [ ] `src/components/common/Badge.jsx`: `color`(gray/orange/red/green) props; 할일 상태 표시용 색상 변형
  - [ ] `src/components/common/Spinner.jsx`: Tailwind `animate-spin` 활용 로딩 표시
  - [ ] `src/components/common/index.js`: 일괄 export
- **완료 조건**:
  - [ ] 각 컴포넌트가 props에 따라 올바른 Tailwind 클래스를 렌더링함
  - [ ] Modal의 ESC 키 닫힘 및 오버레이 클릭 닫힘 정상 동작
  - [ ] Button `loading` 상태에서 Spinner 표시 및 클릭 비활성화
  - [ ] `import { Button, Modal } from '@/components/common'` 형태로 임포트 가능
- **의존성**: TASK-FE-01
- **예상 소요**: 60분

---

### TASK-FE-05: 라우팅 설정 및 인증 가드 구현

- **목적**: React Router로 페이지 라우팅을 구성하고 인증 상태에 따른 접근 제어를 구현한다.
- **작업 내용**:
  - [ ] `src/router/PrivateRoute.jsx`: `authStore.isAuthenticated`가 `false`이면 `/login`으로 리다이렉트
  - [ ] `src/router/PublicRoute.jsx`: 인증 사용자가 `/login`, `/register` 접근 시 `/`로 리다이렉트
  - [ ] `src/router/AppRouter.jsx`:
    - [ ] `/login` → `PublicRoute` → `LoginPage`
    - [ ] `/register` → `PublicRoute` → `RegisterPage`
    - [ ] `/` → `PrivateRoute` → `MainPage`
    - [ ] `/categories` → `PrivateRoute` → `CategoryPage`
    - [ ] `*` → `/`로 리다이렉트
  - [ ] `src/main.jsx`에 `<BrowserRouter>` 래핑 추가
- **완료 조건**:
  - [ ] 비인증 상태에서 `/` 접근 시 `/login`으로 자동 이동
  - [ ] 인증 상태에서 `/login` 접근 시 `/`로 자동 이동
  - [ ] 존재하지 않는 경로 접근 시 `/`로 리다이렉트
  - [ ] 브라우저 뒤로가기/앞으로가기 정상 동작
- **의존성**: TASK-FE-01, TASK-FE-03
- **예상 소요**: 40분

---

### TASK-FE-06: 인증 페이지 구현

- **목적**: 로그인·회원가입 페이지와 TanStack Query 기반 인증 훅을 구현하여 사용자 인증 흐름을 완성한다.
- **작업 내용**:
  - [ ] `src/hooks/useAuth.js`
    - [ ] `useLoginMutation`: `authApi.login` 호출 → 성공 시 `authStore.setAuth()` 후 `/`로 이동
    - [ ] `useRegisterMutation`: `authApi.register` 호출 → 성공 시 `/login`으로 이동
  - [ ] `src/pages/LoginPage.jsx`: 이메일/비밀번호 입력 폼, 로딩 중 버튼 비활성화, 에러 메시지 표시, 회원가입 링크
  - [ ] `src/pages/RegisterPage.jsx`: 이메일/비밀번호/비밀번호 확인 폼, 비밀번호 불일치 클라이언트 검증, 에러 메시지 표시
- **완료 조건**:
  - [ ] 올바른 자격증명 로그인 시 `authStore`에 토큰 저장 후 `/`로 이동
  - [ ] 잘못된 자격증명 로그인 시 에러 메시지가 폼 아래에 표시됨
  - [ ] 회원가입 성공 시 `/login`으로 이동
  - [ ] 비밀번호 불일치 시 제출 전 클라이언트 에러 표시
  - [ ] 요청 중 버튼이 비활성화되고 Spinner 표시
- **의존성**: TASK-FE-02, TASK-FE-03, TASK-FE-04, TASK-FE-05
- **예상 소요**: 60분

---

### TASK-FE-07: 카테고리 기능 구현

- **목적**: 카테고리 CRUD 기능을 위한 훅, 컴포넌트, 페이지를 구현한다.
- **작업 내용**:
  - [ ] `src/hooks/useCategories.js`: `useGetCategories`, `useCreateCategoryMutation`, `useUpdateCategoryMutation`, `useDeleteCategoryMutation` (성공 시 `['categories']` 쿼리 무효화)
  - [ ] `src/components/category/CategoryForm.jsx`: 이름 입력, 생성/수정 모드 분기
  - [ ] `src/components/category/CategoryItem.jsx`: 카테고리 이름, 수정/삭제 버튼, 삭제 시 확인 Modal
  - [ ] `src/components/category/CategoryList.jsx`: `useGetCategories` 사용, 로딩 시 `Spinner`, 빈 목록 안내 문구
  - [ ] `src/components/category/index.js`: 일괄 export
  - [ ] `src/pages/CategoryPage.jsx`: `CategoryList` + Modal 내 `CategoryForm` 조합
- **완료 조건**:
  - [ ] 카테고리 생성 후 목록이 즉시 갱신됨 (쿼리 무효화 확인)
  - [ ] 수정 Modal에 기존 이름이 채워짐
  - [ ] 삭제 확인 Modal에서 취소 시 삭제 미진행
  - [ ] 빈 목록 시 안내 문구 표시
- **의존성**: TASK-FE-02, TASK-FE-04, TASK-FE-05
- **예상 소요**: 75분

---

### TASK-FE-08: 할일 기능 구현

- **목적**: 할일 CRUD, 상태별 색상 구분, 카테고리 필터/정렬을 포함한 핵심 기능을 완성한다.
- **작업 내용**:
  - [ ] `src/utils/todoUtils.js` — `getTodoColorClass(todo)` 함수
    - [ ] 완료: `bg-green-50 line-through text-gray-400`
    - [ ] 기한초과 (현재 > dueDate, 미완료): `bg-red-50 border-red-300`
    - [ ] 기한임박 (현재 + 24h > dueDate, 미완료): `bg-orange-50 border-orange-300`
    - [ ] 진행중: `bg-white` (기본)
    - [ ] dueDate 없음: 기한초과 판별 제외 (BR-DATA-04)
  - [ ] `src/hooks/useTodos.js`: `useGetTodos`(filter, sortBy, categoryId를 queryKey 포함), `useCreateTodoMutation`, `useUpdateTodoMutation`, `useDeleteTodoMutation`, `useToggleTodoMutation`
  - [ ] `src/components/todo/TodoForm.jsx`: 제목(필수), 설명, 마감일(`<input type="date">`), 카테고리 선택(`<select>`)
  - [ ] `src/components/todo/TodoItem.jsx`: `getTodoColorClass`로 행 배경색 적용, 체크박스 완료 토글, `Badge`로 카테고리 표시, 수정/삭제 버튼
  - [ ] `src/components/todo/TodoList.jsx`: `useGetTodos` 사용, 로딩 시 `Spinner`, 빈 목록 안내 문구
  - [ ] `src/components/todo/index.js`: 일괄 export
  - [ ] `src/pages/MainPage.jsx`
    - [ ] 카테고리 필터 버튼 목록 (`categoryStore.selectCategory`)
    - [ ] 상태 필터 탭: 전체/진행중/완료 (`todoStore.setFilter`)
    - [ ] 정렬 드롭다운 (`todoStore.setSortBy`)
    - [ ] "할일 추가" 버튼 → Modal 내 `TodoForm`
    - [ ] `TodoList` 렌더링
    - [ ] 로그아웃 버튼: `authStore.clearAuth()` 후 `/login` 이동
- **완료 조건**:
  - [ ] 완료 할일: 초록 배경 + 취소선 표시
  - [ ] 기한초과 할일: 빨간 배경 표시
  - [ ] 기한임박(24h 이내) 할일: 주황/노랑 배경 표시 (FR-VIEW-02)
  - [ ] 카테고리 필터 클릭 시 해당 카테고리의 할일만 표시
  - [ ] 완료 토글 후 색상이 즉시 변경됨
  - [ ] 생성/수정/삭제 후 목록이 즉시 갱신됨
  - [ ] 로그아웃 후 `/login`으로 이동하고 보호 경로 접근 차단
- **의존성**: TASK-FE-02, TASK-FE-03, TASK-FE-04, TASK-FE-05, TASK-FE-07
- **예상 소요**: 120분

---

### TASK-FE-09: 반응형 UI 검증 및 통합 테스트

- **목적**: 모든 페이지와 기능이 통합된 상태에서 정상 동작하는지 검증하고, 모바일/태블릿/데스크탑 레이아웃을 확인한다.
- **작업 내용**:
  - [ ] Tailwind 반응형 접두사(`sm:`, `md:`, `lg:`) 적용 검토
    - [ ] `MainPage`: 모바일에서 카테고리 필터가 가로 스크롤 또는 드롭다운 전환
    - [ ] `TodoItem`: 좁은 화면에서 버튼이 세로 배치로 전환
    - [ ] `Modal`: 모바일에서 전체 너비 적용
  - [ ] 전체 사용자 시나리오 수동 검증 (회원가입 → 로그인 → 카테고리 생성 → 할일 생성/완료/수정/삭제 → 로그아웃)
  - [ ] 엣지 케이스 검증:
    - [ ] 네트워크 오류 시 에러 메시지 표시
    - [ ] 토큰 만료(401) 시 자동 로그아웃 동작
    - [ ] 빈 목록 상태(할일 없음, 카테고리 없음) UI 표시
    - [ ] 마감일 없는 할일의 색상 로직 정상 처리 (BR-DATA-04)
  - [ ] `QueryClientProvider`의 `staleTime`, `retry` 옵션 검토 및 조정
  - [ ] 불필요한 `console.log` 및 임시 코드 제거
- **완료 조건**:
  - [ ] 모바일(375px), 태블릿(768px), 데스크탑(1280px)에서 레이아웃이 깨지지 않음
  - [ ] 전체 사용자 시나리오가 오류 없이 완주됨
  - [ ] `401` 응답 시 자동 로그아웃 및 리다이렉트 동작
  - [ ] 브라우저 콘솔에 불필요한 에러·경고 없음
- **의존성**: TASK-FE-01 ~ TASK-FE-08 전체
- **예상 소요**: 60분

---

## 태스크 전체 요약

### Database

| 태스크 | 설명 | 예상 소요 | 의존성 |
|--------|------|-----------|--------|
| TASK-DB-01 | PostgreSQL 환경 설정 및 DB/유저 생성 | 30분 | 없음 |
| TASK-DB-02 | 마이그레이션 파일 작성 (001~003) | 45분 | DB-01 |
| TASK-DB-03 | 마이그레이션 실행 스크립트 작성 | 45분 | DB-02 |
| TASK-DB-04 | 개발용 시드 데이터 작성 | 30분 | DB-03 |
| TASK-DB-05 | DB 연결 모듈 및 연결 검증 | 30분 | DB-01 |

### Backend

| 태스크 | 설명 | 예상 소요 | 의존성 |
|--------|------|-----------|--------|
| TASK-BE-01 | 백엔드 프로젝트 초기 설정 | 30분 | DB-01 |
| TASK-BE-02 | DB 연결 풀 및 config 설정 | 30분 | BE-01, DB-01 |
| TASK-BE-03 | 공통 미들웨어 구현 | 60분 | BE-01, BE-04 |
| TASK-BE-04 | 공통 유틸리티 구현 | 45분 | BE-01 |
| TASK-BE-05 | 인증 기능 구현 | 90분 | BE-02, BE-03, BE-04, DB-02 |
| TASK-BE-06 | 카테고리 기능 구현 | 75분 | BE-02, BE-03, BE-04, DB-02 |
| TASK-BE-07 | 할일 기능 구현 | 90분 | BE-02, BE-03, BE-04, BE-06, DB-02 |
| TASK-BE-08 | Express 앱 통합 및 서버 기동 검증 | 45분 | BE-03~07 |
| TASK-BE-09 | API 통합 테스트 (Supertest) | 90분 | BE-05~08 |

### Frontend

| 태스크 | 설명 | 예상 소요 | 의존성 |
|--------|------|-----------|--------|
| TASK-FE-01 | 프론트엔드 프로젝트 초기 설정 | 30분 | 없음 |
| TASK-FE-02 | API Client 구현 | 45분 | FE-01 |
| TASK-FE-03 | Zustand 스토어 구현 | 40분 | FE-01 |
| TASK-FE-04 | 공통 컴포넌트 구현 | 60분 | FE-01 |
| TASK-FE-05 | 라우팅 설정 및 인증 가드 구현 | 40분 | FE-01, FE-03 |
| TASK-FE-06 | 인증 페이지 구현 | 60분 | FE-02, FE-03, FE-04, FE-05 |
| TASK-FE-07 | 카테고리 기능 구현 | 75분 | FE-02, FE-04, FE-05 |
| TASK-FE-08 | 할일 기능 구현 | 120분 | FE-02, FE-03, FE-04, FE-05, FE-07 |
| TASK-FE-09 | 반응형 UI 검증 및 통합 테스트 | 60분 | FE-01~08 전체 |
