CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    courses TEXT[], -- list of course IDs (can be UUID or strings)
    updated_at TIMESTAMP DEFAULT now()
);