# TodoList 구조 설계 원칙 문서

**버전**: 1.2
**작성일**: 2026-04-28
**작성자**: Backend Developer / Claude

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2026-04-28 | Backend Developer / Claude | 최초 작성 |
| 1.1 | 2026-04-28 | Backend Developer / Claude | 1.5 환경변수 분리 원칙 추가 |
| 1.2 | 2026-04-28 | Backend Developer / Claude | 모노레포 구조 반영 (섹션 6 추가, 기존 6→7, 7→8 재번호) |

---

## 1. 최상위 공통 원칙

프론트엔드와 백엔드를 불문하고 이 프로젝트의 모든 코드에 적용되는 공통 원칙이다.

### 1.1 단일 책임 원칙 (SRP)

하나의 파일, 하나의 함수, 하나의 모듈은 **하나의 이유로만 변경**되어야 한다.

- 함수는 한 가지 동작만 수행한다. 함수명만 읽어도 동작을 예측할 수 있어야 한다.
- 파일은 하나의 도메인 관심사만 담는다. `auth`, `todo`, `category`가 하나의 파일에 혼재하지 않는다.
- 백엔드에서 HTTP 파싱, 비즈니스 로직, SQL 실행을 같은 함수에 작성하지 않는다.
- 프론트엔드에서 API 호출, 상태 변경, UI 렌더링을 같은 컴포넌트 함수에 직접 작성하지 않는다.

### 1.2 관심사의 분리 (SoC)

- 백엔드: HTTP 요청/응답 처리 / 비즈니스 로직 / 데이터 접근은 각각 다른 레이어에 위치한다.
- 프론트엔드: 서버 상태(TanStack Query) / 클라이언트 전역 상태(Zustand) / UI 렌더링(React 컴포넌트)은 각각 다른 계층에서 관리한다.
- 스타일(Tailwind CSS 클래스)은 JSX 마크업 안에만 작성한다. 별도 CSS 파일에 비즈니스 로직 관련 계산식을 넣지 않는다.

### 1.3 코드 재사용 vs 중복 허용 기준

| 상황 | 방침 |
|------|------|
| 동일한 로직이 **3회 이상** 반복될 때 | 반드시 함수/훅/유틸리티로 추출하여 재사용 |
| 유사하지만 맥락이 다른 로직 | 섣불리 추상화하지 않고 중복을 허용한다 (AHA 원칙) |
| UI 패턴이 2개 이상 페이지에서 반복될 때 | 공용 컴포넌트(`src/components/common/`)로 추출 |
| 단순 1회성 유틸 | 해당 파일 내 로컬 함수로 유지 |

> **AHA(Avoid Hasty Abstractions)**: 중복 제거보다 잘못된 추상화가 더 큰 기술 부채를 유발한다. 패턴이 명확해질 때까지 중복을 허용한다.

### 1.4 파일 하나의 적절한 크기와 역할 기준

- **권장**: 하나의 파일은 **150줄 이내**를 목표로 한다.
- **경고**: 200줄을 초과하면 분리를 검토한다.
- **강제**: 300줄을 초과하면 반드시 분리한다.
- 하나의 파일이 여러 도메인의 책임을 동시에 가지면 즉시 분리한다.
- 파일명만 읽어도 해당 파일의 역할을 알 수 있어야 한다.

### 1.5 환경변수 분리 원칙

코드와 설정(환경 의존값)은 반드시 분리한다. 실행 환경(개발/운영)이 바뀌어도 코드는 변경되지 않아야 한다.

- **하드코딩 금지**: DB 접속 정보, JWT 시크릿, API 베이스 URL 등 환경에 따라 달라지는 값은 코드에 직접 작성하지 않는다.
- **환경변수 파일 구분**

  | 파일 | 용도 | Git 추적 |
  |------|------|----------|
  | `.env` | 실제 시크릿/설정값 | **제외** (`.gitignore` 필수) |
  | `.env.example` | 필요한 키 목록 + 설명 (값은 더미) | **포함** |
  | `.env.test` | 테스트 전용 설정 | **제외** |

- **접근 단일화**: 환경변수는 반드시 전용 설정 모듈(`src/config/env.js` 또는 `src/config/index.js`)을 통해서만 읽는다. 각 파일에서 `process.env.XXX`를 직접 참조하지 않는다.
- **시작 시 유효성 검증**: 앱 기동 시점에 필수 환경변수 누락 여부를 검증하고, 누락된 경우 즉시 프로세스를 종료한다.
- **프론트엔드**: Vite 기준 `VITE_` 접두사를 붙인 변수만 클라이언트에 노출된다. 시크릿 값은 절대 `VITE_` 접두사를 사용하지 않는다.

---

## 2. 의존성 / 레이어 원칙

### 2.1 레이어 간 의존 방향 규칙 (단방향 의존)

레이어 간 호출은 반드시 **상위 → 하위** 방향으로만 흐른다. 하위 레이어가 상위 레이어를 참조하는 것은 금지한다.

```
[백엔드]  Route → Controller → Service → Repository → DB
[프론트]  Page → Component → Hook → API Client
```

- 역방향 의존(예: Repository가 Controller를 import) 금지
- 레이어 건너뛰기(예: Controller가 직접 SQL 실행) 금지
- 같은 레이어 간 수평 의존은 동일 도메인 내에서만 허용한다

### 2.2 백엔드 레이어 정의

| 레이어 | 위치 | 책임 |
|--------|------|------|
| **Route** | `src/routes/` | URL 경로와 HTTP 메서드 매핑, 미들웨어 체인 연결. 비즈니스 로직 없음 |
| **Controller** | `src/controllers/` | 요청 파싱(req.body, req.params, req.query), 응답 직렬화(res.json), 입력값 1차 검증. Service 호출 후 결과를 HTTP 응답으로 변환 |
| **Service** | `src/services/` | 핵심 비즈니스 로직 구현. 도메인 규칙 적용(BR-AUTH, BR-DATA 등). 트랜잭션 조율. DB 세부사항을 알지 못하고 Repository 인터페이스에만 의존 |
| **Repository** | `src/repositories/` | SQL 쿼리 실행, pg pool을 이용한 DB 통신. 비즈니스 로직 없음. 단순 CRUD 및 조회 쿼리만 담당 |
| **DB** | PostgreSQL | 실제 데이터 저장소. 마이그레이션으로 스키마 버전 관리 |

**각 레이어의 금지 사항:**
- Route: `pool.query()` 직접 호출 금지
- Controller: SQL 문자열 작성 금지, 복잡한 조건 분기 금지
- Service: `req`, `res` 객체 참조 금지, `pool.query()` 직접 호출 금지
- Repository: HTTP 상태 코드 참조 금지, 비즈니스 규칙 판단 금지

### 2.3 프론트엔드 레이어 정의

| 레이어 | 위치 | 책임 |
|--------|------|------|
| **Page** | `src/pages/` | 라우트 단위 최상위 컴포넌트. 레이아웃 구성, Hook 조합, Component에 데이터 전달. API 직접 호출 금지 |
| **Component** | `src/components/` | UI 렌더링 단위. props로 데이터를 받아 표시. 독립적이고 재사용 가능하게 설계. 전역 스토어 직접 접근 최소화 |
| **Hook** | `src/hooks/` | TanStack Query 기반 서버 상태 관리(useQuery, useMutation), Zustand 스토어 접근 로직 캡슐화. UI 코드 없음 |
| **API Client** | `src/api/` | HTTP 요청 함수 모음. fetch 또는 axios 래핑. 엔드포인트 URL, 헤더(Authorization), 직렬화/역직렬화 처리. 상태 관리 코드 없음 |

**각 레이어의 금지 사항:**
- Page: `fetch()`/`axios` 직접 호출 금지
- Component: API Client 직접 import 금지, 복잡한 비즈니스 로직 금지
- Hook: JSX 반환 금지 (커스텀 훅은 일반 함수)
- API Client: React 컴포넌트 생명주기 코드 금지, 상태(useState) 사용 금지

### 2.4 레이어 건너뛰기 금지 규칙

아래 패턴은 코드 리뷰에서 반드시 반려한다:

```
// 금지: Controller에서 pg pool 직접 사용
const result = await pool.query('SELECT * FROM todos');  // Controller 내부 - 금지

// 금지: Page 컴포넌트에서 fetch 직접 호출
const res = await fetch('/api/v1/todos');  // Page 컴포넌트 내부 - 금지

// 금지: Repository에서 비즈니스 규칙 판단
if (todo.user_id !== requestUserId) throw new Error('Forbidden');  // Repository 내부 - 금지
```

---

## 3. 코드 / 네이밍 원칙

### 3.1 파일명 규칙

| 구분 | 규칙 | 예시 |
|------|------|------|
| 백엔드 일반 파일 | `camelCase.js` | `todoService.js`, `authController.js` |
| 프론트엔드 React 컴포넌트 | `PascalCase.jsx` | `TodoCard.jsx`, `CategoryBadge.jsx` |
| 프론트엔드 페이지 컴포넌트 | `PascalCase.jsx` | `LoginPage.jsx`, `MainPage.jsx` |
| 프론트엔드 훅 | `camelCase.js` | `useTodos.js`, `useAuth.js` |
| 프론트엔드 API 클라이언트 | `camelCase.js` | `todoApi.js`, `authApi.js` |
| 프론트엔드 Zustand 스토어 | `camelCase.js` | `authStore.js`, `todoStore.js` |
| 설정 파일 | `camelCase.js` or `kebab-case.js` | `dbPool.js`, `jest.config.js` |
| 테스트 파일 | 원본파일명 + `.test.js` | `todoService.test.js` |
| 마이그레이션 파일 | `순번_snake_case.sql` | `001_create_users.sql` |

> 프론트엔드에서 `.jsx` 확장자는 JSX 문법이 포함된 파일에만 사용한다. 순수 JavaScript 유틸리티는 `.js`를 사용한다.

### 3.2 함수/변수 네이밍 규칙

- **변수, 함수**: `camelCase`
- **불리언 변수**: `is`, `has`, `can` 접두사 사용 (`isCompleted`, `hasCategory`, `canDelete`)
- **이벤트 핸들러**: `handle` 접두사 사용 (`handleSubmit`, `handleDelete`)
- **비동기 함수**: 동사 + 명사 형태 (`createTodo`, `fetchTodos`, `deleteCategory`)
- **유틸리티 함수**: 동작을 명확히 드러내는 동사 + 명사 (`formatDueDate`, `parseJwt`, `buildWhereClause`)
- 단일 문자 변수명은 루프 인덱스(`i`, `j`) 외 사용 금지
- 약어는 널리 알려진 것만 허용 (`id`, `url`, `jwt`, `req`, `res`)

### 3.3 상수 네이밍 규칙

- 전역 상수: `UPPER_SNAKE_CASE`
- 파일 스코프 내 변경 불가 값: `UPPER_SNAKE_CASE`

```js
// 예시
const JWT_ALGORITHM = 'HS512';
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
const TODO_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};
```

### 3.4 API 엔드포인트 네이밍 규칙 (RESTful)

- 모든 엔드포인트는 `/api/v1/` 접두사로 시작한다.
- 리소스명은 복수형 `kebab-case` 명사를 사용한다.
- 동사를 URL에 포함하지 않는다 (HTTP 메서드가 동사 역할).

| HTTP 메서드 | 엔드포인트 | 동작 |
|-------------|-----------|------|
| `POST` | `/api/v1/auth/register` | 회원가입 |
| `POST` | `/api/v1/auth/login` | 로그인 |
| `DELETE` | `/api/v1/auth/me` | 회원 탈퇴 |
| `GET` | `/api/v1/todos` | 할일 목록 조회 |
| `POST` | `/api/v1/todos` | 할일 생성 |
| `GET` | `/api/v1/todos/:id` | 할일 단건 조회 |
| `PUT` | `/api/v1/todos/:id` | 할일 전체 수정 |
| `PATCH` | `/api/v1/todos/:id/complete` | 할일 완료 상태 전환 |
| `DELETE` | `/api/v1/todos/:id` | 할일 삭제 |
| `GET` | `/api/v1/categories` | 카테고리 목록 조회 |
| `POST` | `/api/v1/categories` | 카테고리 생성 |
| `PUT` | `/api/v1/categories/:id` | 카테고리 수정 |
| `DELETE` | `/api/v1/categories/:id` | 카테고리 삭제 |

- 상태 전환처럼 특정 동작을 표현할 때는 리소스 하위의 명사형 서브리소스(`:id/complete`)를 허용한다.
- 필터링/정렬/페이지네이션은 쿼리 파라미터로 표현한다 (`?category_id=&status=&page=&limit=`).

### 3.5 React 컴포넌트 네이밍 규칙

- 컴포넌트 함수명과 파일명은 일치시킨다 (`TodoCard.jsx` → `function TodoCard()`).
- 이름은 `PascalCase`를 사용한다.
- 역할을 드러내는 접미사를 권장한다:
  - 페이지 수준: `LoginPage`, `MainPage`
  - 폼 UI: `TodoForm`, `CategoryForm`
  - 목록: `TodoList`, `CategoryList`
  - 개별 아이템: `TodoItem`, `CategoryItem`
  - 재사용 UI: `Button`, `Modal`, `Badge`, `InputField`
- default export를 사용하고 named export는 유틸리티/훅에서만 사용한다.

### 3.6 DB 컬럼/테이블 네이밍 규칙

- 테이블명: 복수형 `snake_case` (`users`, `todos`, `categories`)
- 컬럼명: `snake_case` (`user_id`, `is_completed`, `due_date`, `created_at`)
- Primary Key: `id` (UUID 타입)
- Foreign Key: 참조 테이블 단수형 + `_id` (`user_id`, `category_id`)
- 불리언 컬럼: `is_` 접두사 (`is_completed`)
- 일시 컬럼: `_at` 접미사 (`created_at`, `updated_at`)
- 인덱스명: `idx_테이블명_컬럼명` (`idx_todos_user_id`)

### 3.7 환경 변수 네이밍 규칙

- 모든 환경 변수는 `UPPER_SNAKE_CASE`를 사용한다.
- 관련 변수는 공통 접두사로 그룹화한다.

```
# DB 관련
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

# JWT 관련
JWT_SECRET
JWT_EXPIRES_IN

# 서버 관련
PORT
NODE_ENV
CORS_ORIGIN
```

---

## 4. 테스트 / 품질 원칙

### 4.1 테스트 전략 및 우선순위

이 프로젝트는 **단위 테스트 > 통합 테스트 > E2E 테스트** 순으로 우선순위를 둔다.

| 테스트 유형 | 우선순위 | 대상 | 도구 |
|------------|---------|------|------|
| 단위 테스트 | 최우선 | Service 레이어 비즈니스 로직, 유틸리티 함수 | Jest |
| 통합 테스트 | 2순위 | API 엔드포인트 전체 흐름 (Route → DB) | Jest + Supertest |
| E2E 테스트 | Phase 2 | 사용자 시나리오 전체 | 미정 |

**단위 테스트 우선 이유**: 비즈니스 규칙(BR-DATA, BR-AUTH)이 Service에 집중되어 있으며, 외부 의존성 없이 빠른 피드백이 가능하다.

### 4.2 테스트 파일 위치 규칙

```
백엔드: src/__tests__/ 디렉토리 아래, 원본 파일 구조를 미러링
  - src/__tests__/services/todoService.test.js
  - src/__tests__/controllers/todoController.test.js
  - src/__tests__/repositories/todoRepository.test.js

프론트엔드: 각 소스 파일과 동일한 디렉토리에 .test.js 파일로 위치
  - src/hooks/useTodos.test.js
  - src/utils/formatDueDate.test.js
```

- 테스트 파일명은 원본 파일명 + `.test.js`를 사용한다.
- 테스트 내 `describe` 블록명은 파일/모듈명으로, `it` 블록명은 `"~해야 한다"` 형식으로 작성한다.

### 4.3 커버리지 목표

| 레이어 | 목표 커버리지 |
|--------|-------------|
| 백엔드 Service | 80% 이상 |
| 백엔드 Controller | 70% 이상 (통합 테스트로 보완) |
| 백엔드 Repository | 통합 테스트로 커버 |
| 프론트엔드 유틸리티/훅 | 70% 이상 |
| 프론트엔드 컴포넌트 | Phase 2에서 목표 설정 |

- 커버리지는 라인 기준으로 측정한다.
- 커버리지 수치 달성보다 **핵심 비즈니스 규칙(BR-*)의 테스트 여부**를 우선 확인한다.

### 4.4 코드 리뷰 기준

코드 리뷰에서 반드시 확인하는 항목:

1. 레이어 경계 위반 여부 (레이어 건너뛰기, 역방향 의존)
2. 입력값 검증 누락 (Controller 레벨)
3. SQL 인젝션 가능성 (파라미터 바인딩 사용 여부)
4. JWT 시크릿 하드코딩 여부
5. 에러 메시지에 민감 정보 노출 여부
6. `async/await` 함수의 `try/catch` 누락 여부
7. 네이밍 원칙 준수 여부
8. 단일 책임 원칙 준수 여부 (하나의 함수가 너무 많은 일을 하지 않는지)

### 4.5 ESLint 설정 방향

- 기본: `eslint:recommended`
- 추가 규칙:
  - `no-console`: `warn` (프로덕션 console.log 사용 경고)
  - `no-unused-vars`: `error`
  - `eqeqeq`: `error` (`===` 강제)
  - `no-var`: `error` (`let`/`const` 강제)
  - `prefer-const`: `warn`
  - `no-implicit-coercion`: `warn`
- 프론트엔드: `eslint-plugin-react`, `eslint-plugin-react-hooks` 추가
  - `react-hooks/rules-of-hooks`: `error`
  - `react-hooks/exhaustive-deps`: `warn`

---

## 5. 설정 / 보안 / 운영 원칙

### 5.1 환경 변수 관리

- 모든 환경 의존 설정값은 환경 변수로 관리하며 코드에 하드코딩하지 않는다.
- `.env` 파일은 절대 git에 커밋하지 않는다. `.gitignore`에 반드시 포함한다.
- `.env.example` 파일은 **필수**로 관리하며 실제 값 없이 키 이름과 설명만 기재한다.
- `dotenv` 패키지는 애플리케이션 엔트리포인트(`server.js`)에서 최초 1회만 로드한다.

```
# .env.example 구조 예시
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist
DB_USER=
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=1h

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 5.2 시크릿 관리 규칙

- `JWT_SECRET`는 최소 32자 이상의 무작위 문자열을 사용한다.
- DB 패스워드, JWT 시크릿은 절대 소스코드, 로그, 에러 응답에 노출하지 않는다.
- 프로덕션 환경에서는 환경 변수를 OS 레벨 또는 시크릿 관리 도구(예: Docker Secrets)로 주입한다.
- 개발 환경용 `.env`와 프로덕션 환경용 `.env.production`을 분리 관리한다. (`.env.production`도 git 제외)
- bcrypt cost factor는 `12` 이상을 사용한다.

### 5.3 CORS 정책

- CORS 허용 출처(`CORS_ORIGIN`)는 환경 변수로 관리한다.
- 개발 환경: `http://localhost:5173` (Vite 기본 포트)
- 프로덕션 환경: 실제 프론트엔드 도메인만 허용 (와일드카드 `*` 금지)
- 허용 메서드: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- 허용 헤더: `Content-Type, Authorization`
- 인증 관련 쿠키가 없으므로 `credentials: false`

### 5.4 에러 응답 포맷 표준화

모든 API 에러 응답은 아래 구조를 따른다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 보여줄 메시지",
    "details": {}
  }
}
```

성공 응답 구조:

```json
{
  "success": true,
  "data": {}
}
```

목록 조회 성공 응답 구조:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**에러 코드 규칙**: 도메인 + 동작으로 구성 (`AUTH_INVALID_CREDENTIALS`, `TODO_NOT_FOUND`, `CATEGORY_DUPLICATE_NAME`)

### 5.5 HTTP 상태 코드 사용 기준

| 상황 | 상태 코드 |
|------|----------|
| 조회 성공 | `200 OK` |
| 생성 성공 | `201 Created` |
| 수정/삭제 성공 | `200 OK` |
| 입력값 유효성 오류 | `400 Bad Request` |
| 인증 토큰 없음/만료/무효 | `401 Unauthorized` |
| 권한 없음 (타인 데이터 접근) | `403 Forbidden` |
| 리소스 없음 | `404 Not Found` |
| 중복 데이터 (이메일 중복 등) | `409 Conflict` |
| 서버 내부 오류 | `500 Internal Server Error` |

- `2xx`가 아닌 응답에는 반드시 표준 에러 응답 포맷을 사용한다.
- `500` 응답에는 내부 스택 트레이스나 SQL을 절대 포함하지 않는다.

### 5.6 로깅 원칙

| 레벨 | 사용 기준 | 예시 |
|------|----------|------|
| `ERROR` | 예상치 못한 서버 오류, DB 연결 실패, 처리되지 않은 예외 | `pool.query()` 실패, 미들웨어 처리 불가 오류 |
| `WARN` | 비정상이지만 복구 가능한 상황, 인증 실패 반복 | 401/403 응답, 만료된 토큰 사용 시도 |
| `INFO` | 서버 시작/종료, 주요 비즈니스 이벤트 | 서버 포트 바인딩, 사용자 가입, 로그인 |
| `DEBUG` | 개발 중 상세 진단 정보 | SQL 쿼리 파라미터, 요청 본문 (개발 환경만) |

- 로그에는 반드시 타임스탬프, 로그 레벨, 요청 ID(또는 userId)를 포함한다.
- 비밀번호, JWT 시크릿, DB 패스워드는 어떠한 로그 레벨에서도 출력하지 않는다.
- `NODE_ENV=production`에서는 `DEBUG` 레벨 출력을 비활성화한다.
- 구조화된 로그(JSON 형식)를 권장하며, 개발 환경에서는 가독성을 위해 plain text를 허용한다.

### 5.7 API 버전 관리 방침

- 모든 API는 `/api/v1/` 접두사를 사용한다.
- 백엔드 Express 라우터는 버전별로 분리 등록한다:
  ```js
  app.use('/api/v1', v1Router);
  ```
- 하위 호환성이 깨지는 변경이 필요할 때 `/api/v2/`로 신규 버전을 추가한다.
- 구버전 엔드포인트는 최소 1개 버전 기간 동안 `Deprecated` 헤더와 함께 유지한다.
- Phase 1에서는 v1만 운영하며, v2 계획은 Phase 2에서 결정한다.

---

## 6. 모노레포 전체 구조

이 프로젝트는 **npm workspaces** 기반 모노레포로 구성한다. 하나의 git 저장소 안에 `frontend`와 `backend`를 독립 패키지로 관리하여 공통 설정 공유, 단일 버전 관리, 통합 스크립트 실행을 가능하게 한다.

### 6.1 모노레포 루트 구조

```text
todolist-app/                        # 모노레포 루트 (git 저장소)
├── frontend/                        # 프론트엔드 패키지 (섹션 7 참조)
├── backend/                         # 백엔드 패키지 (섹션 8 참조)
│
├── package.json                     # 루트 워크스페이스 설정 (workspaces 선언, 공통 스크립트)
├── .gitignore                       # 모노레포 공통 gitignore (node_modules, .env 등)
├── .env.example                     # 루트 수준 환경변수 키 목록 (참고용)
└── docs/                            # 프로젝트 문서
    ├── 1-domain-definition.md
    ├── 2-prd.md
    ├── 3-user-scenario.md
    └── 4-architecture-principles.md
```

### 6.2 루트 package.json 워크스페이스 설정

```json
{
  "name": "todolist-app",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev -w frontend\" \"npm run dev -w backend\"",
    "dev:fe": "npm run dev -w frontend",
    "dev:be": "npm run dev -w backend",
    "test": "npm run test -w frontend && npm run test -w backend",
    "lint": "npm run lint -w frontend && npm run lint -w backend"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

### 6.3 모노레포 운영 원칙

- **패키지 독립성**: `frontend`와 `backend`는 각자 독립된 `package.json`과 `node_modules`를 가진다. 두 패키지 간 코드를 직접 `import`하지 않는다.
- **루트 스크립트**: 개발 서버 동시 실행(`npm run dev`), 전체 테스트(`npm test`), 전체 린트(`npm run lint`)는 루트에서 수행한다.
- **의존성 설치 위치**: 특정 패키지에만 필요한 의존성은 해당 패키지에 설치한다. (`npm install <pkg> -w frontend`)
- **공통 설정 파일**: `.gitignore`는 루트에 하나만 관리한다. ESLint 설정은 각 패키지에 별도 유지한다.
- **환경변수**: `.env` 파일은 각 패키지(`frontend/.env`, `backend/.env`) 아래에 위치한다. 루트 레벨 `.env`는 사용하지 않는다.
- **git 관리**: 단일 저장소(Single Repository)로 FE/BE를 함께 커밋하여 변경 이력을 통합 관리한다.

---

## 7. 프론트엔드 디렉토리 구조

```text
frontend/
├── public/                         # 정적 자산 (favicon, og 이미지 등)
│
├── src/
│   ├── api/                        # API Client 레이어: HTTP 요청 함수 모음
│   │   ├── authApi.js              # 회원가입, 로그인 요청 함수
│   │   ├── todoApi.js              # 할일 CRUD 요청 함수
│   │   ├── categoryApi.js          # 카테고리 CRUD 요청 함수
│   │   └── client.js               # axios 인스턴스 or fetch 래퍼 (baseURL, Authorization 헤더 공통 설정)
│   │
│   ├── components/                 # 재사용 UI 컴포넌트
│   │   ├── common/                 # 도메인과 무관한 범용 컴포넌트
│   │   │   ├── Button.jsx          # 공용 버튼 컴포넌트
│   │   │   ├── InputField.jsx      # 공용 입력 필드 컴포넌트
│   │   │   ├── Modal.jsx           # 공용 모달 컴포넌트
│   │   │   ├── Badge.jsx           # 상태/카테고리 뱃지 컴포넌트
│   │   │   └── Spinner.jsx         # 로딩 스피너 컴포넌트
│   │   │
│   │   ├── todo/                   # 할일 도메인 컴포넌트
│   │   │   ├── TodoList.jsx        # 할일 목록 렌더링
│   │   │   ├── TodoItem.jsx        # 할일 카드 단건 (상태별 색상 구분 포함)
│   │   │   └── TodoForm.jsx        # 할일 생성/수정 폼
│   │   │
│   │   └── category/               # 카테고리 도메인 컴포넌트
│   │       ├── CategoryList.jsx    # 카테고리 목록 렌더링
│   │       ├── CategoryItem.jsx    # 카테고리 단건
│   │       └── CategoryForm.jsx    # 카테고리 생성/수정 폼
│   │
│   ├── hooks/                      # Hook 레이어: 서버/클라이언트 상태 로직
│   │   ├── useAuth.js              # TanStack Query: 로그인, 회원가입, 탈퇴 mutation
│   │   ├── useTodos.js             # TanStack Query: 할일 목록 조회, CRUD mutation
│   │   └── useCategories.js        # TanStack Query: 카테고리 목록 조회, CRUD mutation
│   │
│   ├── pages/                      # Page 레이어: 라우트 단위 최상위 컴포넌트
│   │   ├── LoginPage.jsx           # 로그인 페이지 (비인증 전용)
│   │   ├── RegisterPage.jsx        # 회원가입 페이지 (비인증 전용)
│   │   ├── MainPage.jsx            # 메인 페이지: 할일 목록 + 카테고리 필터
│   │   └── CategoryPage.jsx        # 카테고리 관리 페이지
│   │
│   ├── stores/                     # Zustand 클라이언트 전역 상태 스토어
│   │   ├── authStore.js            # 인증 상태: token, user 정보, isAuthenticated
│   │   ├── todoStore.js            # 할일 UI 상태: 선택된 필터, 정렬 기준
│   │   └── categoryStore.js        # 카테고리 UI 상태: 선택된 카테고리 ID
│   │
│   ├── utils/                      # 순수 유틸리티 함수 (React 미사용)
│   │   ├── formatDueDate.js        # 날짜 포맷팅, 기한 임박/초과 판별 함수
│   │   ├── getTodoStatus.js        # 할일 상태(in_progress/overdue/completed) 도출 함수
│   │   └── constants.js            # 프론트엔드 공통 상수 (TODO_STATUS, QUERY_KEYS 등)
│   │
│   ├── router/                     # 라우팅 설정
│   │   └── AppRouter.jsx           # React Router 라우트 정의, 인증 가드(PrivateRoute)
│   │
│   ├── App.jsx                     # 애플리케이션 루트 컴포넌트: QueryClientProvider, 라우터 마운트
│   └── main.jsx                    # Vite 엔트리포인트: ReactDOM.createRoot
│
├── .env                            # 실제 환경 변수 (git 제외)
├── .env.example                    # 환경 변수 키 목록 (git 포함)
├── .eslintrc.js                    # ESLint 설정
├── index.html                      # Vite HTML 템플릿
├── package.json
├── tailwind.config.js              # Tailwind CSS 설정
└── vite.config.js                  # Vite 빌드 설정
```

**디렉토리 역할 요약:**

| 디렉토리 | 역할 |
|----------|------|
| `src/api/` | 모든 HTTP 요청 함수 집중. 컴포넌트/훅에서 직접 fetch 사용 금지 |
| `src/components/common/` | 도메인 무관 재사용 UI 원자 단위 |
| `src/components/todo/` | 할일 도메인 전용 UI 컴포넌트 |
| `src/components/category/` | 카테고리 도메인 전용 UI 컴포넌트 |
| `src/hooks/` | TanStack Query useQuery/useMutation 래핑, Zustand 접근 캡슐화 |
| `src/pages/` | 라우트 1개당 파일 1개. 컴포넌트 조합과 레이아웃만 담당 |
| `src/stores/` | Zustand 스토어. 서버 상태(서버 데이터)는 TanStack Query로, 클라이언트 UI 상태만 여기서 관리 |
| `src/utils/` | React 의존성 없는 순수 함수. 테스트 용이성을 위해 사이드 이펙트 없이 작성 |
| `src/router/` | 라우트 선언과 인증 가드를 한 곳에서 관리 |

---

## 8. 백엔드 디렉토리 구조

```text
backend/
├── src/
│   ├── config/                         # 설정 및 인프라 초기화
│   │   └── dbPool.js                   # pg Pool 인스턴스 생성 및 내보내기 (연결 풀 관리)
│   │
│   ├── routes/                         # Route 레이어: URL 매핑 및 미들웨어 체인
│   │   ├── index.js                    # 도메인별 라우터 통합, /api/v1 마운트
│   │   ├── authRoutes.js               # /api/v1/auth/* 경로 정의
│   │   ├── todoRoutes.js               # /api/v1/todos/* 경로 정의 (authenticateToken 적용)
│   │   └── categoryRoutes.js           # /api/v1/categories/* 경로 정의 (authenticateToken 적용)
│   │
│   ├── controllers/                    # Controller 레이어: 요청 파싱 및 응답 반환
│   │   ├── authController.js           # 회원가입, 로그인, 회원탈퇴 요청 처리
│   │   ├── todoController.js           # 할일 CRUD, 완료 상태 전환 요청 처리
│   │   └── categoryController.js       # 카테고리 CRUD 요청 처리
│   │
│   ├── services/                       # Service 레이어: 비즈니스 로직 및 도메인 규칙
│   │   ├── authService.js              # 회원가입(이메일 중복 검증, bcrypt 해싱), 로그인(JWT 발급)
│   │   ├── todoService.js              # 할일 생성/수정/삭제, 소유권 검증(BR-AUTH-03), 상태 판별
│   │   └── categoryService.js          # 카테고리 생성/수정/삭제, 소유권 검증, 할일 null 처리(BR-DATA-03)
│   │
│   ├── repositories/                   # Repository 레이어: SQL 쿼리 실행
│   │   ├── userRepository.js           # users 테이블 CRUD 쿼리
│   │   ├── todoRepository.js           # todos 테이블 CRUD, 필터링 쿼리
│   │   └── categoryRepository.js       # categories 테이블 CRUD 쿼리
│   │
│   ├── middlewares/                    # Express 미들웨어
│   │   ├── authenticateToken.js        # JWT Bearer 토큰 검증, req.user에 페이로드 주입
│   │   ├── errorHandler.js             # 전역 에러 핸들러: 표준 에러 응답 포맷 반환
│   │   └── notFound.js                 # 404 핸들러: 존재하지 않는 라우트 처리
│   │
│   ├── utils/                          # 순수 유틸리티 함수
│   │   ├── jwtUtils.js                 # JWT 발급(sign), 검증(verify) 래퍼 함수
│   │   ├── responseHelper.js           # 표준 성공/에러 응답 객체 생성 헬퍼
│   │   └── constants.js                # 서버 공통 상수 (HTTP_STATUS, ERROR_CODES 등)
│   │
│   └── server.js                       # Express 앱 생성, 미들웨어 등록, 라우터 마운트, 서버 기동
│
├── db/
│   └── migrations/                     # SQL 마이그레이션 스크립트 (순번 관리)
│       ├── 001_create_users.sql        # users 테이블 생성
│       ├── 002_create_categories.sql   # categories 테이블 생성
│       └── 003_create_todos.sql        # todos 테이블 생성, FK 설정, 인덱스 생성
│
├── src/__tests__/                      # 테스트 파일 (src 미러링 구조)
│   ├── services/
│   │   ├── authService.test.js         # 회원가입/로그인 비즈니스 로직 단위 테스트
│   │   ├── todoService.test.js         # 할일 서비스 단위 테스트 (소유권, 상태 판별 등)
│   │   └── categoryService.test.js     # 카테고리 서비스 단위 테스트
│   ├── controllers/
│   │   └── todoController.test.js      # Controller 통합 테스트 (Supertest)
│   └── utils/
│       └── jwtUtils.test.js            # JWT 발급/검증 단위 테스트
│
├── .env                                # 실제 환경 변수 (git 제외)
├── .env.example                        # 환경 변수 키 목록 (git 포함)
├── .eslintrc.js                        # ESLint 설정
├── jest.config.js                      # Jest 테스트 설정
└── package.json
```

**디렉토리 역할 요약:**

| 디렉토리/파일 | 역할 |
|--------------|------|
| `src/config/dbPool.js` | pg Pool 단일 인스턴스 관리. 전체 앱에서 이 Pool만 사용 |
| `src/routes/` | Express Router 선언. 미들웨어(`authenticateToken`) 적용 위치 결정 |
| `src/controllers/` | req/res 처리만 담당. 비즈니스 로직 없음. 입력값 1차 검증 |
| `src/services/` | 모든 비즈니스 규칙(BR-*)이 집중되는 핵심 레이어 |
| `src/repositories/` | 파라미터화된 SQL 쿼리만 포함. 비즈니스 판단 없음 |
| `src/middlewares/authenticateToken.js` | 모든 인증 필요 라우트에 적용. `req.user`에 `{ id, email }` 주입 |
| `src/middlewares/errorHandler.js` | `next(error)` 호출 시 최종 에러 응답 생성. 상태 코드 결정 |
| `src/utils/responseHelper.js` | `{ success, data }`, `{ success, error }` 포맷 생성 함수 |
| `db/migrations/` | 순번 prefix(`001_`, `002_`)로 실행 순서 보장. 한 번 적용한 파일은 수정하지 않음 |
| `src/__tests__/` | 소스 디렉토리 구조를 그대로 미러링. 테스트 파일 탐색 용이성 확보 |
