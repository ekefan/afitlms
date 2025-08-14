package repository

import (
	"context"
	"database/sql"

	db "github.com/ekefan/afitlms/cloud-server/internal/db/sqlc"
)

type LecturerRepository interface {
	CreateLecturer(ctx context.Context, arg int64) (db.Lecturer, error)
	GetLecturerByID(ctx context.Context, id int64) (db.Lecturer, error)
	GetLecturerByUserID(ctx context.Context, userID int64) (db.Lecturer, error)
	UpdateLecturerCourses(ctx context.Context, arg db.UpdateLecturerCoursesParams) (db.Lecturer, error)
	DeleteLecturer(ctx context.Context, id int64) (sql.Result, error)
}

var _ LecturerRepository = (*lecturerStore)(nil)

type lecturerStore struct {
	dbConn *sql.DB
	*db.Queries
}

func NewLecturerStore(dbConn *sql.DB) LecturerRepository {
	return &lecturerStore{
		dbConn:  dbConn,
		Queries: db.New(dbConn),
	}
}
