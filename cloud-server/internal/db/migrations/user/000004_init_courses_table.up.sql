CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    faculty TEXT NOT NULL,
    department TEXT NOT NULL,
    level TEXT NOT NULL,
    course_code VARCHAR(10) UNIQUE NOT NULL,
    num_of_lectures_per_semester INT NOT NULL DEFAULT 0,
    lecturer_attended_count INT NOT NULL DEFAULT 0,
    active_lecturer_id BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_courses_faculty_department_level ON courses(faculty, department, level);

CREATE TABLE course_lecturers (
    course_code VARCHAR(10),
    lecturer_id BIGINT,
    availability INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT now(),
    
    PRIMARY KEY (course_code, lecturer_id),
    
    FOREIGN KEY (course_code) REFERENCES courses(course_code)
);

CREATE TABLE course_students (
    course_code VARCHAR(10),
    student_id BIGINT,
    attended_lecture_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT now(),

    PRIMARY KEY (course_code, student_id),
    FOREIGN KEY (course_code) REFERENCES courses(course_code)
);


-- CREATE TABLE lecture_sessions (
--     id BIGSERIAL PRIMARY KEY,
--     course_code VARCHAR(10) NOT NULL,
--     lecturer_id BIGINT NOT NULL,
--     scheduled_date DATE NOT NULL,
--     status VARCHAR(20) DEFAULT 'pending',  -- ['pending', 'held', 'missed', 'cancelled']
--     reason TEXT DEFAULT NULL,  -- Optional explanation
--     qa_approved BOOLEAN DEFAULT FALSE,

--     FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE CASCADE
-- );
