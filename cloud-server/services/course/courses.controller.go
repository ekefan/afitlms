package course

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (csvc *CourseService) CreateCourses(ctx *gin.Context) {
	var req Course

	if err := ctx.ShouldBindJSON(&req); err != nil {
		slog.Error("invalid request")
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid course details",
			"error":   err.Error(),
		})
		return
	}

	newCourse, err := csvc.createCourses(ctx, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to create a new course",
			"error":   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, newCourse)
}

func (csvc *CourseService) GetCourse(ctx *gin.Context) {
	courseCode := ctx.Param("course_code")
	if courseCode == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid query param",
			"error":   "no query with key: 'course_code' found",
		})
		return
	}

	course, err := csvc.getCourse(ctx, courseCode)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to create a new course",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, course)
}

func (csvc *CourseService) GetCoursesFiltered(ctx *gin.Context) {

	var filter FilterCourseData
	department, dok := ctx.GetQuery("department")
	level, lok := ctx.GetQuery("level")
	faculty, fok := ctx.GetQuery("faculty")

	if fok {
		filter.Faculty.String = faculty
		filter.Faculty.Valid = true
	} else {
		filter.Faculty.Valid = false
	}

	if dok {
		filter.Department.String = department
		filter.Department.Valid = true
	} else {
		filter.Faculty.Valid = false
	}

	if lok {
		filter.Level.String = level
		filter.Level.Valid = true
	} else {
		filter.Faculty.Valid = false
	}
	courses, err := csvc.getCoursesFiltered(ctx, filter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to create a new course",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, courses)

}

func (csvc *CourseService) DeleteCourse(ctx *gin.Context) {
	courseCode := ctx.Param("course_code")
	if courseCode == " " {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid query param",
			"error":   "no query with key: 'course_code' found",
		})
		return
	}
	err := csvc.deleteCourse(ctx, courseCode)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to delete the course",
			"error":   err.Error(),
		})
		return
	}
	ctx.Status(http.StatusAccepted)
}

func (csvc *CourseService) UpdateCourseNumberOfLecterPerSemester(ctx *gin.Context) {
	num_of_courses_per_semester, ok := ctx.GetQuery("num_of_courses_per_semester")
	course_code, courseCodeExists := ctx.GetQuery("course_code")
	if !ok || !courseCodeExists {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid query param",
			"error":   "no query with key: 'num_of_courses_per_semester' or 'course_code' found",
		})
		return
	}
	err := csvc.updateCourseNumberOfLecterPerSemester(ctx, course_code, num_of_courses_per_semester)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "failed to update the course to set num_of courses_per_semester",
			"error":   err.Error(),
		})
		return
	}
	ctx.Status(http.StatusAccepted)
}
