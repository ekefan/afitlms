package repository

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"time"

	db "github.com/ekefan/afitlms/cloud-server/internal/db/sqlc"
)

type AttendanceRepository interface {
	CreateAttendanceSession(ctx context.Context, arg AttendanceSessionParams) error
	GetLectureAttendance(ctx context.Context, sessionID int64) ([]db.LectureAttendance, error)
	GetLectureSession(ctx context.Context, courseCode string) ([]db.LectureSession, error)
	GetAttendanceData(ctx context.Context, courseCode string) (AttendanceData, error)
}

var _ AttendanceRepository = (*attendanceStore)(nil)

type attendanceStore struct {
	dbConn *sql.DB
	*db.Queries
}

func NewAttendanceStore(dbConn *sql.DB) AttendanceRepository {
	return &attendanceStore{
		dbConn:  dbConn,
		Queries: db.New(dbConn),
	}
}

type AttendanceSessionParams struct {
	AttendanceData []LectureAttendanceParams
	db.CreateLectureSessionParams
}

type LectureAttendanceParams struct {
	SessionID      int64     `json:"session_id,omitempty"`
	StudentID      string    `json:"student_id" binding:"required"`
	AttendanceTime time.Time `json:"attendance_time" binding:"required"`
	Attended       bool      `json:"attended" binding:"required"`
}

func (as *attendanceStore) CreateAttendanceSession(ctx context.Context, arg AttendanceSessionParams) error {
	err := execTx(ctx, as.dbConn, func(q *db.Queries) error {
		fmt.Println("Session ID:", arg.ID)
		sessionID, err := q.CreateLectureSession(ctx, db.CreateLectureSessionParams{
			ID:            arg.ID,
			CourseCode:    arg.CourseCode,
			LecturerSchID: arg.LecturerSchID,
			SessionDate:   arg.SessionDate,
			CreatedAt:     time.Now(),
		})
		if err != nil {
			return err
		}

		fmt.Println("Created session with ID:", sessionID)
		for _, attendanceData := range arg.AttendanceData {
			attendanceData.SessionID = sessionID
			err := q.CreateLectureAttendance(ctx, db.CreateLectureAttendanceParams{
				SessionID:      attendanceData.SessionID,
				StudentSchID:   attendanceData.StudentID,
				AttendanceTime: attendanceData.AttendanceTime,
				Attended:       attendanceData.Attended,
			})
			if err != nil {
				return err
			}
		}
		return nil
	})
	return err
}

type AttendanceData struct {
	Data map[string]CourseAttendanceData `json:"data"`
}

type CourseAttendanceData struct {
	Lecturer UserAttendanceData   `json:"lecturer_data"`
	Students []UserAttendanceData `json:"students"`
}

type UserAttendanceData struct {
	CardUid  string `json:"uid"`
	Name     string `json:"name"`
	UniqueId string `json:"unique_id"`
}

func (as *attendanceStore) GetAttendanceData(ctx context.Context, courseCode string) (AttendanceData, error) {
	var attendanceData AttendanceData
	err := execTx(ctx, as.dbConn, func(q *db.Queries) error {
		activeLecturerId, err := q.GetActiveLecturer(ctx, courseCode)
		if err != nil {
			slog.Error("failed to get active Lecturer in GetAttendanceTransaction", "error", err)
			return err
		}
		activeLecturer, err := q.GetLecturerForAttendance(ctx, activeLecturerId)
		if err != nil {
			slog.Error("failed to get active Lecturer in GetAttendanceTransaction", "error", err)
			return err
		}
		students, err := q.GetStudentsForAttendance(ctx, courseCode)
		if err != nil {
			slog.Error("failed to get students for attendance in GetAttendanceTransaction", "error", err)
			return err
		}
		courseStudents := make([]UserAttendanceData, len(students))
		for i, student := range students {
			courseStudents[i] = UserAttendanceData{
				CardUid:  student.CardUid,
				Name:     student.FullName,
				UniqueId: student.SchID,
			}
		}
		attendanceData.Data = map[string]CourseAttendanceData{
			courseCode: {
				Lecturer: UserAttendanceData{
					CardUid:  activeLecturer.CardUid,
					Name:     activeLecturer.FullName,
					UniqueId: activeLecturer.SchID,
				},
				Students: courseStudents,
			},
		}
		return nil
	})
	if err != nil {
		return attendanceData, nil
	}
	return attendanceData, nil
}
