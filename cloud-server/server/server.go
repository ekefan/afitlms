package server

import (
	"database/sql"
	"time"

	"github.com/ekefan/afitlms/cloud-server/internal/repository"
	"github.com/ekefan/afitlms/cloud-server/services/attendance"
	"github.com/ekefan/afitlms/cloud-server/services/course"
	"github.com/ekefan/afitlms/cloud-server/services/enrollment"
	"github.com/ekefan/afitlms/cloud-server/services/user"
	"github.com/ekefan/afitlms/cloud-server/services/user/lecturer"
	"github.com/ekefan/afitlms/cloud-server/services/user/student"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	router            *gin.Engine
	userService       *user.UserService
	courseService     *course.CourseService
	attendanceService *attendance.AttendanceService
	enrollmentService *enrollment.EnrollmentService
}

func NewServer(dbConn *sql.DB) *Server {
	courseService := course.NewCourseService(repository.NewCourseStore(dbConn))
	studentService := student.NewStudentService(courseService, repository.NewStudentStore(dbConn))
	lecturerService := lecturer.NewLecturerService(courseService, repository.NewLecturerStore(dbConn))
	userService := user.NewUserService(repository.NewUserStore(dbConn), repository.NewStudentStore(dbConn),
		studentService, lecturerService,
	)
	enrollmentService := enrollment.NewEnrollmentService("http://172.25.176.1:8000", userService)
	attendanceService := attendance.NewAttendanceService(courseService, repository.NewAttendanceStore(dbConn))

	server := &Server{
		router:            gin.Default(),
		userService:       userService,
		courseService:     courseService,
		attendanceService: attendanceService,
		enrollmentService: enrollmentService,
	}
	server.handleCors()
	server.registerUserRoutes()
	server.registerCourseRoutes()
	server.registerAttendanceRoutes()
	server.registerEnrollmentRoutes()

	return server
}

func (s *Server) StartServer(addr ...string) {
	port := "8080"
	if len(addr) > 0 && addr[0] != "" {
		port = addr[0]
	}
	s.router.Run(":" + port)
}

// TODO: handle authentications and authorization
// TODO: handle validation of user_id or access_id for student/lecturer/user/course_codes

// TODO: handle the right origins
func (s *Server) handleCors() {
	s.router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
}
