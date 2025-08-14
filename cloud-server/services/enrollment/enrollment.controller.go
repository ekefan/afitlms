package enrollment

import (
	"log/slog"
	"slices"

	"github.com/ekefan/afitlms/cloud-server/services/user"
	"github.com/gin-gonic/gin"
)

func (es *EnrollmentService) Enroll(ctx *gin.Context) {
	var req FastAPIEnrollInitialRequest
	bindErr := ctx.ShouldBindJSON(&req)
	validateErr := es.validateUserRolesPolicy(req.Roles)
	if bindErr != nil || validateErr != nil {
		ctx.JSON(400, gin.H{
			"message": "invalid request",
			"error":   bindErr.Error(),
		})
		return
	}

	resp, err := es.enroll(ctx, req)
	if err != nil {
		slog.Error("failed to enroll user", "error", err)
		ctx.JSON(500, gin.H{
			"message": "failed to enroll user",
			"error":   err.Error(),
		})
		return
	}

	userId, err := es.userService.CreateUser(ctx, user.CreateUserReq{
		Fullname: req.Fullname,
		Email:    req.Email,
		Roles:    req.Roles,
		SchId:    req.SchId,
		CardUid:  resp.UID,
	})

	if err != nil {
		slog.Error("failed to create user", "error", err)
		ctx.JSON(500, gin.H{
			"message": "failed to create user",
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(200, gin.H{
		"data": resp,
	})
	if slices.Contains(req.Roles, rolesToString(lecturerRole)) {
		slog.Info("Creating a new Lecturer")
		err := es.userService.CreateLecturer(ctx, userId)
		if err != nil {
			slog.Error("failed to create student from user")
		}

	}
	if slices.Contains(req.Roles, rolesToString(studentRole)) {
		slog.Info("Creating a new student")
		err := es.userService.CreateStudent(ctx, userId)
		if err != nil {
			slog.Error("failed to create student from user")
		}
	}
}
