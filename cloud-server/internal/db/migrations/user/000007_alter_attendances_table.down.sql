-- Revert lecture_sessions changes:
ALTER TABLE lecture_sessions
    ALTER COLUMN lecturer_sch_id TYPE BIGINT USING lecturer_sch_id::BIGINT;
ALTER TABLE lecture_sessions
    RENAME COLUMN lecturer_sch_id TO lecturer_id;

-- Revert lecture_attendance changes:
ALTER TABLE lecture_attendance
    DROP CONSTRAINT lecture_attendance_pkey;

ALTER TABLE lecture_attendance
    ALTER COLUMN student_sch_id TYPE BIGINT USING student_sch_id::BIGINT;
ALTER TABLE lecture_attendance
    RENAME COLUMN student_sch_id TO student_id;

ALTER TABLE lecture_attendance
    ADD PRIMARY KEY (session_id, student_id);