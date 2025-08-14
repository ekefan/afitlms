# http_server.py
from contextlib import asynccontextmanager
from data_store import enrollments
from models import EnrollRequest, AttendanceData, AttendanceSession, LectureAttendanceParams
from database import init_db
from data_store import fetch_students_for_course, saveEnrollment, sync_courses
from sync import Sync
from datetime import datetime, timezone
from fastapi.responses import JSONResponse
import subprocess
import random
import time
import requests
import sys
import asyncio
from fastapi import (
    FastAPI, 
    BackgroundTasks, 
    HTTPException,
)


courses_to_fetch = [
  "EEE508"
]

session_id = random.randint(1000, 10000)
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event to initialize the database connection.
    This will run once when the application starts.
    """
    init_db()
    sync_courses(courses_to_fetch)
    print('Application startup: Database schema initialized')
    yield
    print('Application shutdown: All services stopped')


# Store job statuses in memory (in production, consider using Redis or database)
job_status: dict[str, dict] = {}

app = FastAPI(title="AFIT LMS Central Server",
              lifespan=lifespan,
              description='Handles sync via HTTP and real-time data via MQTT'
              )
sync_router = Sync(app)

@app.get('/')
async def read_root():
    return {"message": "Central Edge Server is running! HTTP and MQTT services active"}

@app.post("/cs/enroll")
async def enroll_user(data: EnrollRequest, background_tasks: BackgroundTasks):
    """
    Initiates enrollment process and returns job ID for polling status.
    """
    if data.unique_id not in enrollments:
        job_id = f'enroll_{data.unique_id}_{int(time.time())}'
        
        # Initialize job status
        job_status[job_id] = {
            "status": "INITIATED", 
            "progress": "Starting enrollment...",
            "success": None,
            "message": "Enrollment process initiated",
            "uid": None,
            "username": data.username,
            "unique_id": data.unique_id,
            "created_at": time.time()
        }
        
        # Start background task
        background_tasks.add_task(_run_serial_enrollment_with_job_id, 
                                data.username, data.unique_id, job_id)
        
        return {
            "message": "Enrollment initiated",
            "job_id": job_id,
            "poll_url": f"/cs/enroll/status/{job_id}"
        }
    else:
        return {"message": "User Already Enrolled"}

@app.get("/cs/enroll/status/{job_id}")
async def get_enrollment_status(job_id: str):
    """
    Get current status of enrollment job.
    """
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job_status[job_id]

@app.delete("/cs/enroll/status/{job_id}")
async def cleanup_enrollment_job(job_id: str):
    """
    Clean up completed or failed job from memory.
    """
    if job_id in job_status:
        del job_status[job_id]
        return {"message": "Job cleaned up successfully"}
    else:
        raise HTTPException(status_code=404, detail="Job not found")

@app.get("/attendance/request/{course_code}")
async def sendLectureParticipantsToEsp(course_code: str):
    participants = fetch_students_for_course(course_code)
    if not participants:
        return JSONResponse(
            content={"error": f"No course found for code: {course_code}"},
            status_code=404
        )
    
    # Send all participant fields including `present`
    return JSONResponse(content=participants)


@app.post("/attendance/response/{course_code}")
async def receiveAttendanceLecture(course_code: str, attendanceData: list[AttendanceData]):
    
    studentsData = []
    global session_id
    
    for data in attendanceData:
        sd = LectureAttendanceParams(
        student_id = data.uniqueId,
        attendance_time = datetime.now(timezone.utc).isoformat(), # TODO: implement the attendance time to be at time of taking attendance
        attended = data.present
        )
        studentsData.append(sd)

    newAS = AttendanceSession(
        session_id=session_id,
        course_code=course_code,
        lecturer_id=attendanceData[0].uniqueId,  # Assuming the first entry has the lecturer's UID
        session_date=datetime.now(timezone.utc).isoformat(),
        attendance_data=studentsData
        )
    session_id += 1
    jsonAS = newAS.model_dump(mode="json")
    print(jsonAS, "line 133 app.py")
    try:
        res = requests.post(
            "http://localhost:8080/attendances",
            json=jsonAS,
            headers={"Content-Type": "application/json"}
        )
        res.raise_for_status()  # Raise an error for bad responses
    except requests.RequestException as e:
        print(f"Error sending attendance data: {e}")
        return JSONResponse(
            content={"error": "Failed to send attendance data"},
            status_code=500
        )
    return JSONResponse(
        content={"message": "received"},
        status_code=200
    )


def extract_uid_from_output(stdout: str) -> str:
    """
    Extract UID from serial_enroll.py output.
    """
    for line in stdout.splitlines():
        if line.startswith("Card ") and "enrolled for" in line:
            parts = line.split(" ")
            if len(parts) >= 2:
                return parts[1]
        elif line.startswith("UID_RECEIVED:"):
            return line.split("UID_RECEIVED:")[1].strip()
    return None


async def _run_serial_enrollment_with_job_id(username: str, unique_id: str, job_id: str):
    """
    Runs the serial_enroll.py script and updates job status.
    This function will be run in a background task.
    """
    
    try:
        # Update status: Connecting to ESP32
        job_status[job_id].update({
            "status": "CONNECTING",
            "progress": "Connecting to ESP32...",
            "message": "Establishing connection with ESP32 device"
        })
        
        # Small delay to simulate connection process
        await asyncio.sleep(0.5)
        
        # Update status: Waiting for card
        job_status[job_id].update({
            "status": "WAITING_FOR_CARD",
            "progress": "Please present RFID card on terminal",
            "message": "Ready to scan RFID card. Please present your card to the terminal."
        })
        
        # Run the serial enrollment script
        result = await asyncio.to_thread(
            subprocess.run,
            [sys.executable, "serial_enroll.py", username, unique_id, 'COM7'],
            capture_output=True,
            text=True,
            check=True  # Raise CalledProcessError if serial_enroll.py fails
        )
        
        # Extract UID from output
        uid = extract_uid_from_output(result.stdout)
        
        if uid:
            # Success case
            enrollments[uid] = {"username": username, "unique_id": unique_id}
            
            job_status[job_id].update({
                "status": "COMPLETED",
                "progress": "Enrollment completed successfully",
                "success": True,
                "message": f"Enrollment successful for {username} with UID {uid}",
                "uid": uid,
                "completed_at": time.time()
            })
            
            print(f"Enrollment for {username} completed. UID: {uid}")
            saveEnrollment(username, uid, unique_id)
            
        else:
            # Failed to get UID
            job_status[job_id].update({
                "status": "FAILED",
                "progress": "Failed to retrieve UID",
                "success": False,
                "message": "Enrollment failed: Could not retrieve UID from ESP32",
                "error_details": {
                    "stdout": result.stdout.strip(),
                    "stderr": result.stderr.strip()
                },
                "failed_at": time.time()
            })
            print(f"Enrollment for {username} failed: No UID retrieved")

    except subprocess.CalledProcessError as e:
        # Serial script failed
        error_message = f"Serial enrollment script failed: {e.stderr.strip() if e.stderr else 'Unknown error'}"
        job_status[job_id].update({
            "status": "FAILED",
            "progress": "Script execution failed",
            "success": False,
            "message": error_message,
            "error_details": {
                "stdout": e.stdout.strip() if e.stdout else "",
                "stderr": e.stderr.strip() if e.stderr else "",
                "return_code": e.returncode
            },
            "failed_at": time.time()
        })
        print(f"Serial enrollment script failed for {username}: {error_message}")
        
    except Exception as e:
        # Unexpected error
        error_message = f"An unexpected error occurred during enrollment: {str(e)}"
        job_status[job_id].update({
            "status": "FAILED",
            "progress": "Unexpected error occurred",
            "success": False,
            "message": error_message,
            "error_details": {
                "exception_type": type(e).__name__,
                "exception_message": str(e)
            },
            "failed_at": time.time()
        })
        print(f"Unexpected error during enrollment for {username}: {error_message}")

# Optional: Background task to clean up old jobs
async def cleanup_old_jobs():
    """
    Clean up jobs older than 1 hour to prevent memory leaks.
    """
    current_time = time.time()
    jobs_to_remove = []
    
    for job_id, job_data in job_status.items():
        # Remove jobs older than 1 hour
        if current_time - job_data.get("created_at", 0) > 3600:
            jobs_to_remove.append(job_id)
    
    for job_id in jobs_to_remove:
        del job_status[job_id]
        print(f"Cleaned up old job: {job_id}")
