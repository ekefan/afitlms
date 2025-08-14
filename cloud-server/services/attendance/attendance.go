package attendance

import (
	"context"
	"errors"
	"log/slog"
	"time"

	db "github.com/ekefan/afitlms/cloud-server/internal/db/sqlc"
	"github.com/ekefan/afitlms/cloud-server/internal/repository"
	"github.com/ekefan/afitlms/cloud-server/services/course"
)

var (
	ErrFailedToCreateAttendanceSession = errors.New("failed to create attendance session")
)

type AttendanceService struct {
	repo          repository.AttendanceRepository
	courseService *course.CourseService
}

func NewAttendanceService(courseService *course.CourseService, attendanceRepository repository.AttendanceRepository) *AttendanceService {
	return &AttendanceService{
		repo:          attendanceRepository,
		courseService: courseService,
	}
}

type AttendanceSession struct {
	SessionID      int64                                `json:"session_id"`
	CourseCode     string                               `json:"course_code"`
	LecturerID     string                               `json:"lecturer_id"`
	SessionDate    time.Time                            `json:"session_date"`
	AttendanceData []repository.LectureAttendanceParams `json:"attendance_data"`
}

func (as *AttendanceService) createNewAttendanceSession(ctx context.Context, attendanceSession AttendanceSession) error {
	err := as.repo.CreateAttendanceSession(ctx, repository.AttendanceSessionParams{
		AttendanceData: attendanceSession.AttendanceData,
		CreateLectureSessionParams: db.CreateLectureSessionParams{
			ID:            attendanceSession.SessionID,
			CourseCode:    attendanceSession.CourseCode,
			LecturerSchID: attendanceSession.LecturerID,
			SessionDate:   attendanceSession.SessionDate,
		},
	})

	if err != nil {
		slog.Error("failed to create attendance session", "error", err)
		return ErrFailedToCreateAttendanceSession
	}

	studentData := make([]repository.StudentAttendanceData, len(attendanceSession.AttendanceData))
	for i, data := range attendanceSession.AttendanceData {
		studentData[i] = repository.StudentAttendanceData{
			StudentID: data.StudentID,
			Attended:  data.Attended,
		}
	}
	lectureMetaDataUpdate := course.UpdateCourseLectureMetaData{
		CourseCode:               attendanceSession.CourseCode,
		LecturerSchId:            attendanceSession.LecturerID,
		StudentAttendanceRecords: studentData,
	}
	err = as.courseService.OnAttendanceSessionCreated(ctx, lectureMetaDataUpdate)
	if err != nil {
		slog.Error("failed to update availability and eligibility for users", "error", err)
		return err
	}
	return nil
}

func (as *AttendanceService) getEdgeServerAttendanceData(ctx context.Context, courseCode string) (repository.AttendanceData, error) {
	data, err := as.repo.GetAttendanceData(ctx, courseCode)
	if err != nil {
		slog.Error("failed to get attendance data", "error", err)
		return repository.AttendanceData{}, err
	}

	return data, nil
}
