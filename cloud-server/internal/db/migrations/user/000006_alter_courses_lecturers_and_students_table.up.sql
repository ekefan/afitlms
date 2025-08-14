-- Migration: Add card_uid, full_name, sch_id to course_lecturers and course_students

-- === course_lecturers ===
ALTER TABLE course_lecturers
    ADD COLUMN card_uid VARCHAR(50),
    ADD COLUMN full_name TEXT,
    ADD COLUMN sch_id TEXT;


ALTER TABLE course_lecturers
    ALTER COLUMN card_uid SET NOT NULL,
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN sch_id SET NOT NULL;

-- === course_students ===
ALTER TABLE course_students
    ADD COLUMN card_uid VARCHAR(50),
    ADD COLUMN full_name TEXT,
    ADD COLUMN sch_id TEXT;


ALTER TABLE course_students
    ALTER COLUMN card_uid SET NOT NULL,
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN sch_id SET NOT NULL;
