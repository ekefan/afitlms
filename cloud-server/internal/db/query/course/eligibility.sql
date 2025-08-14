-- name: GetStudentEligibilityForAllCourses :many
SELECT
    c.name AS course_name,
    c.course_code,
    cs.attended_lecture_count,
    c.num_of_lectures_per_semester
FROM course_students cs
JOIN courses c ON c.course_code = cs.course_code
WHERE cs.student_id = $1;

-- name: GetAllStudentsEligibilityForCourse :many
SELECT
    cs.student_id,
    cs.attended_lecture_count,
    c.num_of_lectures_per_semester
FROM course_students cs
JOIN courses c ON c.course_code = cs.course_code
WHERE cs.course_code = $1;


-- name: UpdateStudentStudentEligibility :exec
UPDATE course_students
SET attended_lecture_count = attended_lecture_count + 1
WHERE sch_id = $2 AND course_code = $1;