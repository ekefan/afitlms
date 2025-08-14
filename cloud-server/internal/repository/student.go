package repository

import (
	"context"
	"database/sql"

	db "github.com/ekefan/afitlms/cloud-server/internal/db/sqlc"
)

type StudentRepository interface {
	CreateStudent(ctx context.Context, arg int64) (db.Student, error)
	DeleteStudent(ctx context.Context, id int64) (sql.Result, error)
	GetStudentByID(ctx context.Context, id int64) (db.Student, error)
	GetStudentByUserID(ctx context.Context, userID int64) (db.Student, error)
	UpdateStudentCourses(ctx context.Context, arg db.UpdateStudentCoursesParams) (db.Student, error)
	BatchGetEligibilityMetaData(ctx context.Context, studentids []int64) ([]db.BatchGetEligibilityMetaDataRow, error)
}

var _ StudentRepository = (*studentStore)(nil)

type studentStore struct {
	dbConn *sql.DB
	*db.Queries
}

func NewStudentStore(dbConn *sql.DB) StudentRepository {
	return &studentStore{
		dbConn:  dbConn,
		Queries: db.New(dbConn),
	}
}
