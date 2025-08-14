package enrollment

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"time"

	"github.com/ekefan/afitlms/cloud-server/services/user"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func init() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("rolesonly", rolesOnly)
	}
}

var (
	ErrRolesViolatesRolesPolicy = errors.New("roles violates the role policy")
	ErrNoBioMetricTemplate      = errors.New("students or lecturers must enroll with a biometric template")
)

type FastAPIEnrollInitialRequest struct {
	Fullname string   `json:"fullname" binding:"required"`
	Email    string   `json:"email" binding:"email,required"`
	SchId    string   `json:"sch_id" binding:"required"`
	Roles    []string `json:"roles" binding:"required"`
}

type WebSocketMessage struct {
	Type      string          `json:"type"` // e.g., "status", "COMPLETED", "FAILED"
	Data      json.RawMessage `json:"data"` // Raw JSON to be parsed based on Type
	Timestamp float64         `json:"timestamp"`
}

type WebSocketStatusData struct {
	Stage   string `json:"stage"`
	Details string `json:"details"`
}

// Data for "COMPLETED" type messages
type WebSocketCompletedData struct {
	Message  string `json:"message"`
	UID      string `json:"uid"`
	Username string `json:"username"`
	UniqueID string `json:"unique_id"`
	Success  bool   `json:"success"`
}

// Data for "FAILED" type messages
type WebSocketFailedData struct {
	Message string            `json:"message"`
	Success bool              `json:"success"`
	Details map[string]string `json:"details"` // Optional error details
}

type EnrollmentService struct {
	FastAPIBaseURL string
	userService    *user.UserService
}

func NewEnrollmentService(fastAPIBaseURL string, us *user.UserService) *EnrollmentService {
	return &EnrollmentService{
		FastAPIBaseURL: fastAPIBaseURL,
		userService:    us,
	}
}

func (es *EnrollmentService) enroll(ctx context.Context, req FastAPIEnrollInitialRequest) (WebSocketCompletedData, error) {
	slog.Info("Initiating enrollment for:", "user", req.Fullname, "unique id", req.SchId)

	initialPayload := struct {
		UniqueId string `json:"unique_id" binding:"required"`
		Username string `json:"username" binding:"required"`
	}{
		Username: req.Fullname,
		UniqueId: req.SchId,
	}

	jsonPayload, err := json.Marshal(initialPayload)
	if err != nil {
		slog.Error("Failed to marshal initial JSON payload", "error", err)
		return WebSocketCompletedData{}, fmt.Errorf("failed to marshal initial JSON payload: %w", err)
	}

	httpPostURL := fmt.Sprintf("%s/cs/enroll", es.FastAPIBaseURL)
	httpRequest, err := http.NewRequestWithContext(ctx, "POST", httpPostURL, bytes.NewBuffer(jsonPayload))
	if err != nil {
		slog.Error("Failed to create initial HTTP request", "error", err)
		return WebSocketCompletedData{}, fmt.Errorf("failed to create initial HTTP request: %w", err)
	}
	httpRequest.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	httpResponse, err := client.Do(httpRequest)
	if err != nil {
		slog.Error("Failed to send initial HTTP request to FastAPI", "error", err)
		return WebSocketCompletedData{}, fmt.Errorf("failed to send initial HTTP request to FastAPI: %w", err)
	}
	defer httpResponse.Body.Close()

	slog.Info("response", "data", httpResponse.StatusCode)
	if httpResponse.StatusCode != http.StatusOK {
		buf := new(bytes.Buffer)
		buf.ReadFrom(httpResponse.Body)
		return WebSocketCompletedData{}, fmt.Errorf("FastAPI initial enrollment endpoint returned non-OK status: %s, Body: %s", httpResponse.Status, buf.String())
	}

	var initialResponse struct {
		Message string `json:"message"`
		JobID   string `json:"job_id"`
		PollURL string `json:"poll_url"`
	}
	err = json.NewDecoder(httpResponse.Body).Decode(&initialResponse)
	if err != nil {
		return WebSocketCompletedData{}, fmt.Errorf("failed to decode response: %w", err)
	}
	return es.pollForCompletion(ctx, initialResponse.JobID)
}

func (es *EnrollmentService) pollForCompletion(ctx context.Context, jobID string) (WebSocketCompletedData, error) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	statusURL := fmt.Sprintf("%s/cs/enroll/status/%s", es.FastAPIBaseURL, jobID)

	for {
		select {
		case <-ctx.Done():
			return WebSocketCompletedData{}, ctx.Err()
		case <-ticker.C:
			resp, err := http.Get(statusURL)
			if err != nil {
				continue // Keep polling
			}

			var status struct {
				Status   string `json:"status"`
				Success  bool   `json:"success"`
				UID      string `json:"uid"`
				Username string `json:"username"`
				UniqueID string `json:"unique_id"`
				Message  string `json:"message"`
			}

			if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
				resp.Body.Close()
				continue
			}
			resp.Body.Close()

			switch status.Status {
			case "COMPLETED":
				return WebSocketCompletedData{
					Success:  status.Success,
					Message:  status.Message,
					UID:      status.UID,
					Username: status.Username,
					UniqueID: status.UniqueID,
				}, nil
			case "FAILED":
				return WebSocketCompletedData{}, fmt.Errorf("enrollment failed: %s", status.Message)
				// Continue polling for other statuses
			}
		}
	}
}

func (es *EnrollmentService) validateUserRolesPolicy(roles Roles) error {
	if slices.Contains(roles, rolesToString(studentRole)) &&
		slices.Contains(roles, rolesToString(qaAdminRole)) {
		return ErrRolesViolatesRolesPolicy
	}
	return nil
}

type Roles []string

const (
	// roles
	studentRole = iota
	lecturerRole
	qaAdminRole
	courseAdminRole
)

const (
	// string rep of roles
	StudentRole     = "student"
	LecturerRole    = "lecturer"
	QaAdminRole     = "qa_admin"
	CourseAdminRole = "course_admin"
)

func rolesToString(role int) string {
	switch role {
	case studentRole:
		return "student"
	case lecturerRole:
		return "lecturer"
	case qaAdminRole:
		return "qa_admin"
	case courseAdminRole:
		return "course_admin"
	}
	return ""
}

var allowedRoles = map[string]bool{
	"student":      true,
	"lecturer":     true,
	"qa_admin":     true,
	"course_admin": true,
}

func rolesOnly(fl validator.FieldLevel) bool {
	roles, ok := fl.Field().Interface().([]string)
	if !ok {
		return false
	}
	for _, role := range roles {
		if !allowedRoles[role] {
			return false
		}
	}
	return true
}
