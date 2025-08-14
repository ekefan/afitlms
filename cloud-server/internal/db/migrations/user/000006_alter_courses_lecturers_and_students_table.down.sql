-- === course_lecturers ===
ALTER TABLE course_lecturers
    DROP COLUMN IF EXISTS card_uid,
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS sch_id;

-- === course_students ===
ALTER TABLE course_students
    DROP COLUMN IF EXISTS card_uid,
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS sch_id;
