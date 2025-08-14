package repository

import (
	"context"
	"database/sql"

	db "github.com/ekefan/afitlms/cloud-server/internal/db/sqlc"
)

type CourseRepository interface {
	CreateCourse(ctx context.Context, arg db.CreateCourseParams) (db.Course, error)
	DropCourse(ctx context.Context, arg db.DropCourseParams) (sql.Result, error)
	RegisterCourse(ctx context.Context, arg db.RegisterCourseParams) error
	GetStudentEligibilityForAllCourses(ctx context.Context, studentID int64) ([]db.GetStudentEligibilityForAllCoursesRow, error)
	GetCourse(ctx context.Context, courseCode string) (db.Course, error)
	UnassignLecturerFromCourse(ctx context.Context, arg db.UnassignLecturerFromCourseParams) (sql.Result, error)
	AssignLecturerToCourse(ctx context.Context, arg db.AssignLecturerToCourseParams) error
	GetLecturerAvailabilityForAllCourses(ctx context.Context, lecturerID int64) ([]db.GetLecturerAvailabilityForAllCoursesRow, error)
	GetAllStudentsEligibilityForCourse(ctx context.Context, courseCode string) ([]db.GetAllStudentsEligibilityForCourseRow, error)
	GetCourseMetaData(ctx context.Context, courseCode string) (db.GetCourseMetaDataRow, error)
	GetCoursesFiltered(ctx context.Context, arg db.GetCoursesFilteredParams) ([]db.Course, error)
	DeleteCourse(ctx context.Context, courseCode string) (sql.Result, error)
	SetActiveLecturer(ctx context.Context, arg db.SetActiveLecturerParams) error
	RemoveActiveLecturer(ctx context.Context, arg db.RemoveActiveLecturerParams) error
	UpdateCourseNumberOfLecturesPerSemester(ctx context.Context, arg db.UpdateCourseNumberOfLecturesPerSemesterParams) error
	HandleAttendanceSessionCreatedEvent(ctx context.Context, arg AttendanceSessionEventParams) error
}

var _ CourseRepository = (*courseStore)(nil)

type courseStore struct {
	dbConn *sql.DB
	*db.Queries
}

func NewCourseStore(dbConn *sql.DB) CourseRepository {
	return &courseStore{
		dbConn:  dbConn,
		Queries: db.New(dbConn),
	}
}

type AttendanceSessionEventParams struct {
	CourseCode     string
	LecturerSchID  string
	StudentDetails []StudentAttendanceData
}
type StudentAttendanceData struct {
	Attended  bool
	StudentID string
}

func (cs *courseStore) HandleAttendanceSessionCreatedEvent(ctx context.Context, arg AttendanceSessionEventParams) error {
	err := execTx(ctx, cs.dbConn, func(q *db.Queries) error {
		err := q.UpdateLecturerAttendedCount(ctx, arg.CourseCode)
		if err != nil {
			return err
		}

		err = q.UpdateLecturerAvailability(ctx, db.UpdateLecturerAvailabilityParams{
			CourseCode: arg.CourseCode,
			SchID:      arg.LecturerSchID,
		})
		if err != nil {
			return err
		}

		for _, attendanceData := range arg.StudentDetails {
			if attendanceData.Attended {
				err := q.UpdateStudentStudentEligibility(ctx, db.UpdateStudentStudentEligibilityParams{
					CourseCode: arg.CourseCode,
					SchID:      attendanceData.StudentID,
				})
				if err != nil {
					return err
				}
			}

		}

		return nil
	})

	return err
}
