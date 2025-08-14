'use client'

import { FiltersDropdowns } from "@/app/ui/courses/RegisterCoursesFilter";
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { useRole } from '@/app/ui/courses/RoleContext'
import { toast } from "sonner";
import { EligibilityModal } from "@/app/ui/courses/EligibilityModal"; // Import the new modal component

// Define the types for your data (can be in a shared types file)
type CourseData = {
    course_code: string;
    course_name: string;
    faculty: string;
    level: string; // Assuming level might come as a string from API
    department: string;
}

type StudentEligibility = {
    student_name: string;
    matric_number: string;
    eligibility: number;
}

type EligibilityList = {
    course_data: CourseData;
    student_eligibility: StudentEligibility[];
}

type Course = {
    name: string;
    faculty: string;
    level: string;
    department: string;
    course_code: string;
}

export default function DashboardPage() {
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [eligibilityList, setEligibilityList] = useState<EligibilityList | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [showEligibilityModal, setShowEligibilityModal] = useState(false);
    const { activeRole, userId } = useRole();
    const router = useRouter();


    const fetchCourses = async (filters?: { faculty?: string | null, level?: string | null, department?: string | null }) => {
        try {
            let url = `${API_BASE_URL}/courses/`;
            const queryParams = [];

            if (filters?.faculty) queryParams.push(`faculty=${filters.faculty}`);
            if (filters?.level) queryParams.push(`level=${filters.level}`);
            if (filters?.department) queryParams.push(`department=${filters.department}`);

            if (queryParams.length > 0) {
                url += `?${queryParams.join("&")}`;
            } else {
                url += `?noCourses=true`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Course[] = await response.json();
            console.log("Fetched courses:", data);
            setFilteredCourses(data);
            setSelectedCourses([]);

        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };

    const setFilterForFetchingCourses = (
        fcFaculty: string | null,
        fcLevel: string | null,
        dept: string | null
    ): void => {
        setSelectedCourses([]);

        fetchCourses({
            faculty: fcFaculty,
            level: fcLevel,
            department: dept,
        })
        console.log("filters applied:");

    }

    useEffect(() => {
        setIsClient(true);
        if (activeRole === 'course_admin' || activeRole === 'student') router.push('/dashboard/courses/');
        fetchCourses();
    }, []);


    const handleGetEligibilityList = async (courseCode: string) => {
        if (!userId) {
            toast.error("Error", {
                description: "User ID not found. Please log in.",
            });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/eligibility?course_code=${courseCode}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data: EligibilityList = await response.json();


            setEligibilityList(data);
            console.log("Eligibility List:", data);
            setShowEligibilityModal(true);

            toast.success("Success", {
                description: `Eligibility list for ${courseCode} fetched successfully.`,
            });
        } catch (error: any) {
            console.error("Failed to fetch eligibility list:", error);
            toast.error("Error", {
                description: `Failed to fetch eligibility list: ${error.message}`,
            });
            setEligibilityList(null); // Clear eligibility list on error
            setShowEligibilityModal(false); // Ensure modal is closed on error
        }
    };

    const handleCloseModal = () => {
        setShowEligibilityModal(false);
        setEligibilityList(null);
    };


    if (!isClient) return null;

    return (
        <div className="p-6">
            <FiltersDropdowns onFilterCourses={setFilterForFetchingCourses} />

            <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">All Courses</h2>
                {filteredCourses.length === 0 ? (
                    <p>No courses match the selected filters.</p>
                ) : (
                    <ul className="space-y-4">
                        {filteredCourses.map((course, index) => (
                            <li
                                key={index}
                                className="border rounded-lg shadow-sm flex justify-between"
                            >
                                <div className="grow w-full p-3">
                                    <p><strong>{course.course_code}</strong> - {course.name}</p>
                                    <p className="text-sm text-gray-600">
                                        Faculty: {course.faculty}, Dept: {course.department}, Level: {course.level}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleGetEligibilityList(course.course_code)}
                                    className="border-l hover:bg-green-200 hover:rounded-r-lg text-sm w-2/6 text-semi-bold"
                                >
                                    Get Eligibility List
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showEligibilityModal && eligibilityList && (
                <EligibilityModal
                    eligibilityList={eligibilityList}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}