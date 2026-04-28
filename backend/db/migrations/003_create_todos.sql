-- Up
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    category_id UUID NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    due_date TIMESTAMP NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_todos_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_todos_category
        FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_todos_user_id
    ON todos (user_id);

CREATE INDEX idx_todos_category_id
    ON todos (category_id);

CREATE INDEX idx_todos_due_date
    ON todos (due_date)
    WHERE due_date IS NOT NULL;

CREATE INDEX idx_todos_user_completed_due
    ON todos (user_id, is_completed, due_date);

-- Down
-- DROP INDEX IF EXISTS idx_todos_user_completed_due;
-- DROP INDEX IF EXISTS idx_todos_due_date;
-- DROP INDEX IF EXISTS idx_todos_category_id;
-- DROP INDEX IF EXISTS idx_todos_user_id;
-- DROP TABLE IF EXISTS todos;
