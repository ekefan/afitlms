# data_store.py
import requests
import json
from typing import List
courses = {}

enrollments = {}


def saveEnrollment(username, uid, uniqueId):
    enrollments[uniqueId] = {username, uid}


def fetch_students_for_course(course_code: str):
    """
    Returns a flat list of participants for the given course:
    - Lecturer comes first
    - Then all students
    """
    course = courses.get(course_code)
    if not course:
        return []

    participants = []

    # Add lecturer (if any)
    if "lecturer" in course:
        participants.append({
            "uid": course["lecturer"]["uid"],
            "name": course["lecturer"]["name"],
            "uniqueId": course["lecturer"]["uniqueId"],
            "present": course["lecturer"].get("present", False)
        })

    # Add students
    for student in course.get("students", []):
        participants.append({
            "uid": student["uid"],
            "name": student["name"],
            "uniqueId": student["uniqueId"],
            "present": student.get("present", False)
        })

    return participants



def sync_courses(course_codes: List[str]):

    base_url = "http://localhost:8080/attendances/attendancedata"

    for course_code in course_codes:
        try:
            url = f"{base_url}/{course_code}"
            
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                if "data" in data and course_code in data["data"]:
                    course_data = data["data"][course_code]
                    
                    
                    transformed_course = {
                        "students": []
                    }
                    
                    if "lecturer_data" in course_data:
                        lecturer = course_data["lecturer_data"]
                        transformed_course["lecturer"] = {
                            "uid": lecturer["uid"],
                            "name": lecturer["name"],
                            "uniqueId": lecturer["unique_id"],
                            "present": False
                        }
                    
                    # Add students data
                    if "students" in course_data:
                        for student in course_data["students"]:
                            transformed_course["students"].append({
                                "uid": student["uid"],
                                "name": student["name"],
                                "uniqueId": student["unique_id"],
                                "present": False  # Default to not present
                            })
                    
                    # Update the global courses dictionary
                    courses[course_code] = transformed_course
                    
                    print(f"Successfully synced course: {course_code}", courses)
                else:
                    print(f"No data found for course: {course_code}")
            
            else:
                print(f"Failed to fetch data for course {course_code}. Status code: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"Network error while fetching course {course_code}: {e}")
        except json.JSONDecodeError as e:
            print(f"JSON decode error for course {course_code}: {e}")
        except Exception as e:
            print(f"Unexpected error while syncing course {course_code}: {e}")
