import json
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
}

def load_courses_from_json(path="courses.json"):
    with open(path, "r") as f:
        return json.load(f)


def insert_courses(courses):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    insert_query = """
        INSERT INTO courses (
            name, faculty, department, level, course_code, active_lecturer_id, num_of_lectures_per_semester
        ) VALUES (%s, %s, %s, %s, %s, default, default)"""
    
    for course in courses:
        cur.execute(insert_query, (
            course["name"],
            course["faculty"],
            course["department"],
            course["level"],
            course["course_code"]
        ))
    conn.commit()
    cur.close()
    conn.close()
    print(f"Inserted {len(courses)} courses.")

if __name__ == "__main__":
    data = load_courses_from_json()
    insert_courses(data)