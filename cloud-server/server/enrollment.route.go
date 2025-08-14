package server

func (s *Server) registerEnrollmentRoutes() {
	er := s.router.Group("/enrollments")
	er.POST("", s.enrollmentService.Enroll)
}
