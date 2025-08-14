'use client';

import { API_BASE_URL } from '@/lib/constants';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DeleteCourseDialog from './DeleteCourseDialog';
import { FiltersDropdowns } from './RegisterCoursesFilter';



type CourseEligibility = {
    course_id: string;
    course_code: string;
    course_name: string;
    eligibility: number;
};

type Course = {
    name: string;
    faculty: string;
    level: string;
    department: string;
    course_code: string;
}

type filters = {
    department: string | null;
    level: string | null;
    faculty: string | null;
};
export default function StudentCourses({ userId, role }: {
    userId: string | null;
    role: string | null;
}) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filters, setFilters] = useState<filters>({
        department: null,
        level: null,
        faculty: null,
    });
    const [isClient, setIsClient] = useState(false)
    const router = useRouter();
    let department: string | null = null;
    let level: string | null = null;
    let faculty: string | null = null;

    const handleFilterChangeAndFetch = useCallback(
        (
            selectedFaculty: string | null,
            selectedLevel: string | null,
            selectedDepartment: string | null
        ) => {
            // Update the filter state
            setFilters({
                faculty: selectedFaculty,
                level: selectedLevel,
                department: selectedDepartment,
            });
            // Immediately trigger fetchCourses with the new filter values
            // We pass the new values directly to fetchCourses to ensure it uses the latest state
            // since state updates are asynchronous.
            fetchCourses(selectedFaculty, selectedLevel, selectedDepartment);
        },
        [] // userId is a dependency if fetchCourses depends on it and needs to be memoized with it
    );

    const fetchCourses = useCallback(async (
        currentFaculty: string | null = filters.faculty,
        currentLevel: string | null = filters.level,
        currentDepartment: string | null = filters.department
    ) => {
        if (!userId) return; // Ensure userId is available


        try {
            const queryParams = new URLSearchParams();

            if (currentDepartment) {
                queryParams.append('department', currentDepartment);
            }
            if (currentLevel !== null) {
                queryParams.append('level', currentLevel.toString());
            }
            if (currentFaculty) {
                queryParams.append('faculty', currentFaculty);
            }

            const url = `${API_BASE_URL}/courses/?${queryParams.toString()}`;
            console.log('Fetching from URL:', url);

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.error || errorData.message || 'Unknown error';
                console.error('API Error:', errorMessage, errorData);
                throw new Error(errorMessage);
            }

            const data = await res.json();
            console.log('Fetched raw data:', data);
            setCourses(data);
        } catch (err: any) {
            console.error('Error fetching courses:', err);

        }
    }, []);

    useEffect(() => {
        setIsClient(true)
        fetchCourses();
        console.log(courses)

    }, [])
    if (!isClient) return null
    return (
        <div className="">
            <div className="mb-6">
                <h1 className="text-xl font-semibold">AFIT Courses</h1>
                <div className="justify-end flex">
                    <button
                        className="border-2 flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-green-300"
                        onClick={() => router.push('/dashboard/courses/create')}
                    >
                        <h1>Add Course To System</h1>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </button>

                </div>
            </div>
            <div>
                <FiltersDropdowns onFilterCourses={handleFilterChangeAndFetch} />
            </div>
            {courses.length === 0 ? (
                <p>No courses found.</p>
            ) : (
                <div className="space-y-4">
                    {courses.map(course => (
                        <div
                            key={crypto.randomUUID()}
                            className="flex justify-between border rounded-lg shadow-sm"
                        >
                            <div className="grow w-full p-3">
                                <h2 className="text-lg font-semibold">
                                    {course.course_code} - {course.name}
                                </h2>
                                <div className="flex gap-4">
                                    <p className="text-sm text-gray-500">
                                        Faculty:{" "}
                                        <span
                                            className="text-green-600"
                                        >
                                            {`${course.faculty}`}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Department:{" "}
                                        <span
                                            className="text-green-600"
                                        >
                                            {`${course.department}`}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Level:{" "}
                                        <span
                                            className="text-green-600"
                                        >
                                            {`${course.level}`}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <DeleteCourseDialog courseCode={course.course_code} userId={userId} onCourseDropped={fetchCourses} role={role} />

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
