-- name: CreateUser :one
INSERT INTO users (
    full_name,
    email,
    roles,
    enrolled,
    card_uid,
    hashed_password,
    sch_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: UpdateUserPassword :one
UPDATE users
SET 
    hashed_password = $2,
    password_changed = TRUE,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: UpdateUserEmail :one
UPDATE users
SET 
    email = sqlc.arg(new_email), -- new_email
    updated_at = now()
WHERE id = sqlc.arg(id) AND email = sqlc.arg(old_email) -- old_email
RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;

-- name: DeleteUser :execresult
DELETE FROM users
WHERE id = $1;
