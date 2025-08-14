package user

import (
	"context"
	"log/slog"
)

func (us *UserService) CreateStudent(ctx context.Context, args int64) error {
	_, err := us.studentRepo.CreateStudent(ctx, args)
	if err != nil {
		slog.Error("failed to create student from user")
		return err
	}
	return nil
}

func (us *UserService) CreateLecturer(ctx context.Context, args int64) error {
	_, err := us.lecturerService.CreateLecturer(ctx, args)
	if err != nil {
		slog.Error("failed to create lecturer from user")
		return err
	}
	return nil
}
