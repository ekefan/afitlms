-- 1. Alter lecture_sessions: Rename and change data type
ALTER TABLE lecture_sessions
    RENAME COLUMN lecturer_id TO lecturer_sch_id;

ALTER TABLE lecture_sessions
    ALTER COLUMN lecturer_sch_id TYPE TEXT USING lecturer_sch_id::TEXT;

-- 2. Alter lecture_attendance: Rename and change data type
-- Drop existing primary key since we need to change part of it
ALTER TABLE lecture_attendance
    DROP CONSTRAINT lecture_attendance_pkey;

-- Change type
ALTER TABLE lecture_attendance
    RENAME COLUMN student_id TO student_sch_id;
ALTER TABLE lecture_attendance
    ALTER COLUMN student_sch_id TYPE TEXT USING student_sch_id::TEXT;

ALTER TABLE lecture_attendance
    ADD PRIMARY KEY (session_id, student_sch_id);