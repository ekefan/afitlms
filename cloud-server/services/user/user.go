package user

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	db "github.com/ekefan/afitlms/cloud-server/internal/db/sqlc"
	"github.com/ekefan/afitlms/cloud-server/internal/repository"
	"github.com/ekefan/afitlms/cloud-server/services/user/lecturer"
	"github.com/ekefan/afitlms/cloud-server/services/user/student"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

var (
	ErrIncorrectPassword = errors.New("incorrect password, user not authorized")
)

const DEFAULT_PASSWORD = "1234Afit"

type CreateUserReq struct {
	Fullname string   `json:"fullname" binding:"required"`
	Email    string   `json:"email" binding:"email,required"`
	SchId    string   `json:"sch_id" binding:"required"`
	Roles    []string `json:"roles" binding:"required"`
	CardUid  string   `json:"card_uid"`
}

type ChangeUserPasswordReq struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type ChangeUserEmailReq struct {
	OldEmail string `json:"old_email" binding:"required,email"`
	NewEmail string `json:"new_email" binding:"required,email"`
}

type UserDTO struct {
	ID              int64     `json:"id,omitempty"`
	Fullname        string    `json:"fullname,omitempty"`
	Password        string    `json:"passowrd,omitempty"`
	Roles           []string  `json:"roles,omitempty"`
	SchID           string    `json:"sch_id"`
	Email           string    `json:"email,omitempty"`
	PasswordChanged bool      `json:"password_changed"`
	CreatedAt       time.Time `json:"created_at,omitempty"`
	UpdatedAt       time.Time `json:"updated_at,omitempty"`
}

// TODO: remove studentRepo from userService
type UserService struct {
	userRepo        repository.UserRespository
	studentService  *student.StudentService
	lecturerService *lecturer.LecturerService
	studentRepo     repository.StudentRepository
}

func NewUserService(userRepo repository.UserRespository,
	studentRepo repository.StudentRepository,
	studentService *student.StudentService,
	lecturerService *lecturer.LecturerService) *UserService {
	us := &UserService{
		userRepo:        userRepo,
		studentRepo:     studentRepo,
		studentService:  studentService,
		lecturerService: lecturerService,
	}
	return us
}

func (us *UserService) DeleteUser(ctx *gin.Context) {
	fmt.Println("deleting a user")

	userId, err := strconv.Atoi(ctx.Param("id"))
	if userId < 1 || err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "valid integer user id is required",
		})
		return
	}

	res, err := us.userRepo.DeleteUser(ctx, int64(userId))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to delete a user with id: %v", userId),
		})
		return
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil || rowsAffected == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("user with id %d doesn't exist", userId),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("deleted user with id: %v", userId),
	})
}

func (us *UserService) GetUser(ctx *gin.Context) {
	fmt.Println("getting a user")

	userId, err := strconv.Atoi(ctx.Param("id"))
	if userId < 1 || err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "valid integer user id is required",
		})
		return
	}

	user, err := us.userRepo.GetUserByID(ctx, int64(userId))
	if err != nil {
		slog.Error("Unhandled userRepo error", "dtails", err)
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": fmt.Sprintf("user with id: %v not found", userId),
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to get a user with id: %v", userId),
		})
		return
	}
	resp := UserDTO{
		ID:              user.ID,
		Fullname:        user.FullName,
		Email:           user.Email,
		CreatedAt:       user.CreatedAt,
		UpdatedAt:       user.UpdatedAt.Time,
		PasswordChanged: user.PasswordChanged,
	}

	ctx.JSON(http.StatusOK, resp)
}

type Tokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
type LoginResponse struct {
	UserData UserDTO `json:"user_data"`
	Tokens   Tokens  `json:"tokens"`
}

func (us *UserService) loginUser(ctx context.Context, data LoginRequest) (LoginResponse, error) {
	user, err := us.userRepo.GetUserByEmail(ctx, data.Email)
	resp := LoginResponse{}
	if err != nil {
		//TODO: handle common db errors
		return resp, err
	}

	if user.HashedPassword != data.Password {
		return resp, ErrIncorrectPassword
	}

	// Create new user session
	resp.UserData = UserDTO{
		ID:              user.ID,
		Fullname:        user.FullName,
		SchID:           user.SchID,
		Roles:           user.Roles,
		Email:           user.Email,
		PasswordChanged: user.PasswordChanged,
		UpdatedAt:       user.UpdatedAt.Time,
		CreatedAt:       user.CreatedAt,
	}
	resp.Tokens = Tokens{
		AccessToken:  "not yet implemented",
		RefreshToken: "not yet implemented",
	}
	return resp, nil
}

type ChangeUserPasswordData struct {
	UserId      int64
	OldPassword string
	NewPassword string
}

// TODO: handle hashing passwords and comparing hashes
func (us *UserService) changeUserPassword(ctx context.Context, data ChangeUserPasswordData) (UserDTO, error) {
	userResponse := UserDTO{}

	user, err := us.userRepo.GetUserByID(ctx, data.UserId)
	if err != nil {
		return userResponse, err
	}

	if user.HashedPassword != data.OldPassword {
		return userResponse, ErrIncorrectPassword
	}

	uu, err := us.userRepo.UpdateUserPassword(ctx, db.UpdateUserPasswordParams{
		ID:             data.UserId,
		HashedPassword: data.NewPassword,
	})
	if err != nil {
		return userResponse, err
	}
	userResponse = UserDTO{
		ID:              uu.ID,
		Fullname:        uu.FullName,
		SchID:           uu.SchID,
		Roles:           uu.Roles,
		Email:           uu.Email,
		PasswordChanged: uu.PasswordChanged,
		UpdatedAt:       uu.UpdatedAt.Time,
		CreatedAt:       uu.CreatedAt,
	}
	return userResponse, nil
}

type ChangeUserEmailData struct {
	UserID   int64
	OldEmail string
	NewEmail string
}

func (us *UserService) changeUserEmail(ctx context.Context, data ChangeUserEmailData) (UserDTO, error) {
	userResponse := UserDTO{}

	uu, err := us.userRepo.UpdateUserEmail(ctx, db.UpdateUserEmailParams{
		ID:       data.UserID,
		NewEmail: data.NewEmail,
		OldEmail: data.OldEmail,
	})
	if err != nil {
		return userResponse, err
	}
	userResponse = UserDTO{
		ID:              uu.ID,
		Fullname:        uu.FullName,
		SchID:           uu.SchID,
		Roles:           uu.Roles,
		Email:           uu.Email,
		PasswordChanged: uu.PasswordChanged,
		UpdatedAt:       uu.UpdatedAt.Time,
		CreatedAt:       uu.CreatedAt,
	}
	return userResponse, nil
}

func (us *UserService) CreateUser(ctx context.Context, req CreateUserReq) (userId int64, err error) {
	user, err := us.userRepo.CreateUser(ctx, db.CreateUserParams{
		Email:          req.Email,
		FullName:       req.Fullname,
		SchID:          req.SchId,
		Roles:          req.Roles,
		CardUid:        req.CardUid,
		Enrolled:       true,
		HashedPassword: DEFAULT_PASSWORD,
	})
	if err != nil {
		slog.Error("Unhandled error here", "detals", err)
		if pqErr, ok := err.(*pq.Error); ok {
			switch pqErr.Code.Name() {
			case "unique_violation":
				column := ""
				if pqErr.Constraint == "users_email_key" {
					column = "email"
				}
				if pqErr.Constraint == "users_sch_id_key" {
					column = "sch_id"
				}
				msg := fmt.Sprintf("%v already exists", column)
				return 0, fmt.Errorf("%s", msg)
			default:
				slog.Error("Unhandled pq error", "details", pqErr)
			}
			return 0, err
		}
		return 0, err
	}
	return user.ID, nil
}
