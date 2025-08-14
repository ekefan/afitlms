-- name: CreateLectureSession :one
INSERT INTO lecture_sessions (
    id,
    course_code,
    lecturer_sch_id,
    session_date,
    created_at
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING id;

-- name: CreateLectureAttendance :exec
INSERT INTO lecture_attendance (
    session_id,
    student_sch_id,
    attendance_time,
    attended
) VALUES (
    $1, $2, $3, $4
);


-- name: GetLectureAttendance :many
SELECT * FROM lecture_attendance
WHERE session_id = $1;

-- name: GetLectureSession :many
SELECT * FROM lecture_sessions
WHERE course_code = $1;