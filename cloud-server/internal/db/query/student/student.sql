-- name: CreateStudent :one
INSERT INTO students (
    user_id
) VALUES (
    $1
) RETURNING *;

-- name: GetStudentByID :one
SELECT * FROM students WHERE id = $1;

-- name: GetStudentByUserID :one
SELECT * FROM students WHERE user_id = $1;


-- name: UpdateStudentCourses :one
UPDATE students
SET courses = $2, updated_at = now()
WHERE id = $1
RETURNING *;


-- name: DeleteStudent :execresult
DELETE FROM students WHERE id = $1;


-- name: BatchGetEligibilityMetaData :many
SELECT u.full_name, u.sch_id
FROM users u
WHERE id = ANY(sqlc.arg(studentIDs)::bigint[]);
