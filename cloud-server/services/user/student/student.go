package student

import (
	"context"
	"log/slog"

	"github.com/ekefan/afitlms/cloud-server/internal/repository"
	"github.com/ekefan/afitlms/cloud-server/services/course"
)

type StudentService struct {
	courseService *course.CourseService
	repo          repository.StudentRepository
}

func NewStudentService(courseService *course.CourseService, repo repository.StudentRepository) *StudentService {
	return &StudentService{
		courseService: courseService,
		repo:          repo,
	}

}

type RegisterCourseArg struct {
	CourseCodes []string
	StudentID   int64
	CardUid     string
	SchID       string
	FullName    string
}

func (s *StudentService) RegisterCourses(ctx context.Context, data RegisterCourseArg) error {
	for _, c := range data.CourseCodes {
		err := s.courseService.RegisterCouse(ctx, course.UserCourseData{
			CourseCode: c,
			UserID:     data.StudentID,
			CardUid:    data.CardUid,
			SchID:      data.SchID,
			FullName:   data.FullName,
		})
		if err != nil {
			slog.Error("Handle error when registering courses")
			return err
		}
	}
	return nil
}

func (s *StudentService) DropCourses(ctx context.Context, studentID int64, courseCodes []string) error {
	for _, c := range courseCodes {
		err := s.courseService.DropCourses(ctx, course.UserCourseData{
			CourseCode: c,
			UserID:     studentID,
		})
		if err != nil {
			slog.Error("Handle error when dropping courses courses", "error", err)
			return err
		}
	}
	return nil
}

type StudentEligibility struct {
	Courses   []course.Eligibility `json:"courses"`
	StudentID int64                `json:"id"`
}

func (s *StudentService) CheckEligibilityStatus(ctx context.Context, studentID int64) (StudentEligibility, error) {
	courseEligibilities, err := s.courseService.GetStudentEligibilityForAllCourses(ctx, studentID)
	if err != nil {
		slog.Error("Handle error when getting eligibility", "error", err)
		return StudentEligibility{}, err
	}
	res := StudentEligibility{
		Courses:   courseEligibilities,
		StudentID: studentID,
	}
	return res, nil
}

type EligibilityList struct {
	StudentName  string  `json:"student_name"`
	MatricNumber string  `json:"matric_number"`
	Eligibility  float64 `json:"eligibility"`
}
type CourseData struct {
	CourseCode string `json:"course_code"`
	CourseName string `json:"course_name"`
	Faculty    string `json:"faculty"`
	Level      string `json:"level"`
	Department string `json:"department"`
}
type StudentEligibilityList struct {
	CourseData      CourseData        `json:"course_data"`
	EligibilityList []EligibilityList `json:"student_eligibility"`
}

func (s *StudentService) GetStudentEligibilityList(ctx context.Context, courseCode string) (StudentEligibilityList, error) {

	courseRes, err := s.courseService.GetStudentEligibilityList(ctx, courseCode)
	if err != nil {
		slog.Error("Handle error when getting student eligibility list", "error", err)
		return StudentEligibilityList{}, err
	}
	studentIDs := []int64{}
	for _, student := range courseRes.StudentData {
		studentIDs = append(studentIDs, student.StudentID)
	}

	studentMetaData, err := s.repo.BatchGetEligibilityMetaData(ctx, studentIDs)
	if err != nil {
		slog.Error("handle error when getting student eligibility list", "error", err)
		return StudentEligibilityList{}, err
	}
	eligibilitylist := []EligibilityList{}
	for i, metaData := range studentMetaData {
		newEligibilityData := EligibilityList{
			StudentName:  metaData.FullName,
			MatricNumber: metaData.SchID,
			Eligibility:  courseRes.StudentData[i].EligibilityValue,
		}
		eligibilitylist = append(eligibilitylist, newEligibilityData)
	}
	studentEligibilityList := StudentEligibilityList{
		CourseData: CourseData{
			CourseCode: courseCode,
			Level:      courseRes.CourseData.Level,
			Faculty:    courseRes.CourseData.Faculty,
			CourseName: courseRes.CourseData.Name,
			Department: courseRes.CourseData.Department,
		},
		EligibilityList: eligibilitylist,
	}
	return studentEligibilityList, nil
}
