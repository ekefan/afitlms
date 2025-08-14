-- name: GetLecturerAvailabilityForAllCourses :many
SELECT
    c.name As course_name,
    cl.availability,
    c.course_code,
    c.active_lecturer_id
FROM course_lecturers cl
JOIN courses c ON c.course_code = cl.course_code
WHERE cl.lecturer_id = $1;

-- -- name: GetAllLecturersAvailabilityForCourse :many
-- SELECT
--     cl.lecturer_id,
--     cl.availability
-- FROM course_lecturers cl
-- WHERE cl.course_code = $1;

-- name: UpdateLecturerAvailability :exec
UPDATE course_lecturers
SET availability = 1
WHERE course_code = $1 AND  sch_id = $2;