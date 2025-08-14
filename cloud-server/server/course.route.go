package server

func (s *Server) registerCourseRoutes() {
	cs := s.router.Group("/courses")

	cs.POST("", s.courseService.CreateCourses)
	cs.PUT("", s.courseService.UpdateCourseNumberOfLecterPerSemester)
	cs.GET("/:course_code", s.courseService.GetCourse)
	cs.GET("/", s.courseService.GetCoursesFiltered)
	cs.DELETE("/:course_code", s.courseService.DeleteCourse)
}
