-- name: CreateCourse :one
INSERT INTO courses (
    name, 
    faculty, 
    department, 
    level, 
    course_code
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetCourse :one
SELECT * FROM courses
WHERE course_code = $1;

-- name: GetCoursesFiltered :many
SELECT * FROM courses
WHERE
    (sqlc.narg(faculty)::TEXT IS NULL OR faculty = sqlc.narg(faculty)::TEXT) AND
    (sqlc.narg(department)::TEXT IS NULL OR department = sqlc.narg(department)::TEXT) AND
    (sqlc.narg(level)::TEXT IS NULL OR level = sqlc.narg(level)::TEXT);

-- name: RegisterCourse :exec
INSERT INTO course_students (
    course_code,
    student_id,
    card_uid,
    sch_id,
    full_name
) VALUES (
    $1, $2, $3, $4, $5
);



-- name: DropCourse :execresult
DELETE FROM course_students
WHERE course_code = $1 AND student_id = $2;


-- name: AssignLecturerToCourse :exec
INSERT INTO course_lecturers (
    course_code,
    lecturer_id,
    card_uid,
    sch_id,
    full_name
) VALUES (
    $1, $2, $3, $4, $5
);

-- name: DeleteCourse :execresult
DELETE FROM courses
WHERE course_code = $1;

-- name: UnassignLecturerFromCourse :execresult
DELETE FROM course_lecturers
WHERE course_code = $1 AND lecturer_id = $2;

-- name: SetActiveLecturer :exec
UPDATE courses 
SET
    active_lecturer_id = $1
WHERE active_lecturer_id = 0 AND course_code = $2;


-- name: RemoveActiveLecturer :exec
UPDATE courses
set active_lecturer_id = 0
WHERE active_lecturer_id = $1 AND course_code = $2;

-- name: GetCourseMetaData :one
SELECT
    c.name,
    c.faculty,
    c.department,
    c.level
FROM courses c
WHERE c.course_code = $1;


-- name: UpdateLecturerAttendedCount :exec
UPDATE courses
SET lecturer_attended_count = lecturer_attended_count + 1,
    num_of_lectures_per_semester = num_of_lectures_per_semester + 1
WHERE course_code = $1;


-- name: UpdateCourseNumberOfLecturesPerSemester :exec
UPDATE courses
SET num_of_lectures_per_semester = $2
WHERE course_code = $1;

-- name: GetActiveLecturer :one
SELECT active_lecturer_id FROM courses
WHERE course_code = $1;

-- name: GetLecturerForAttendance :one
SELECT card_uid, full_name, sch_id FROM course_lecturers
WHERE lecturer_id = $1;

-- name: GetStudentsForAttendance :many
SELECT card_uid, full_name, sch_id FROM course_students
WHERE course_code = $1;