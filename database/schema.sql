-- =============================================================================
-- TodoList Application — Database Schema
-- Version  : 1.0.1
-- Date     : 2026-04-29
-- DB       : PostgreSQL
-- Encoding : UTF-8
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 변경 이력
-- -----------------------------------------------------------------------------
-- | 버전 | 날짜 | 변경 내용 |
-- |------|------|----------|
-- | 1.0 | 2026-04-28 | 초기 스키마 작성 (users, categories, todos 테이블 및 인덱스) |
-- | 1.0.1 | 2026-04-29 | ERD 및 마이그레이션 파일과 정합성 검증 완료 |

-- -----------------------------------------------------------------------------
-- 0. 확장 모듈
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- -----------------------------------------------------------------------------
-- 1. users
--    사용자 계정 정보
--    - 회원 탈퇴 시 Hard Delete (CASCADE 에 의해 하위 데이터 전부 삭제)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,           -- bcrypt 해시 (cost 12+)
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- 2. categories
--    사용자가 정의한 할일 분류 그룹
--    - user_id 삭제(CASCADE) → 해당 사용자의 카테고리 전부 삭제
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
    id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID          NOT NULL,
    name        VARCHAR(100)  NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);


-- -----------------------------------------------------------------------------
-- 3. todos
--    사용자의 할일 항목
--    - user_id 삭제(CASCADE) → 해당 사용자의 할일 전부 삭제
--    - category_id 삭제(SET NULL) → 할일은 보존, 미분류(null) 처리 (BR-DATA-03)
-- -----------------------------------------------------------------------------
CREATE TABLE todos (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID          NOT NULL,
    category_id   UUID          NULL,                -- 선택 항목, 미분류 허용
    title         VARCHAR(255)  NOT NULL,
    description   TEXT          NULL,
    due_date      TIMESTAMP     NULL,                -- 선택 항목 (BR-DATA-04)
    is_completed  BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_todos_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_todos_category
        FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE SET NULL
);


-- -----------------------------------------------------------------------------
-- 4. 인덱스
-- -----------------------------------------------------------------------------

-- 카테고리 조회 (사용자별)
CREATE INDEX idx_categories_user_id
    ON categories (user_id);

-- 할일 조회 (사용자별) — 가장 빈번한 쿼리
CREATE INDEX idx_todos_user_id
    ON todos (user_id);

-- 할일 조회 (카테고리 필터링) — FR-CAT-02
CREATE INDEX idx_todos_category_id
    ON todos (category_id);

-- 기한 임박·초과 판별 조회 — FR-VIEW-01, FR-VIEW-02
CREATE INDEX idx_todos_due_date
    ON todos (due_date)
    WHERE due_date IS NOT NULL;

-- 사용자별 미완료 할일 + 마감일 정렬 복합 인덱스 (목록 조회 최적화)
CREATE INDEX idx_todos_user_completed_due
    ON todos (user_id, is_completed, due_date);
