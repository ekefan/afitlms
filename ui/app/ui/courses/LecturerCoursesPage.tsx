'use client';
import { API_BASE_URL } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DropCourseDialog from "./DropCourseDialog";
import ActiveLecturerDialog from './ActiveLecturerDialog';

type CourseAvailability = {
    course_id: string;
    course_code: string;
    course_name: string;
    active_lecturer_id: number;
    availability: number;
}
export default function LecturerCourses({ userId, role }: {
    userId: string | null;
    role: string | null;
}) {
    const [courses, setCourses] = useState<CourseAvailability[]>([]);
    const [isClient, setIsClient] = useState(false)
    const [activeLecturerStatus, setActiveLecturerStatus] = useState(0);
    const router = useRouter();
    const fetchLectuerCourses = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/lecturers/${userId}/availability`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await res.json();

            const courses = data ? data.course_availability : [];
            setCourses(courses);

        } catch (err: any) {
            console.log(err)
        }
    };

    useEffect(() => {
        setIsClient(true)
        fetchLectuerCourses();
    }, []);

    if (!isClient) return null
    console.log(courses)
    return (
        <div className="">
            <div className="mb-6">
                <h1 className="text-xl font-semibold">My Courses</h1>
                <div className="justify-end flex">
                    <div className="flex gap-3">

                        <button
                            className="border-2 flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-green-300"
                            onClick={() => router.push('/dashboard/courses/eligibilities')}>
                            <h1>Check Students Eligibility</h1>
                        </button>
                        <button
                            className="border-2 flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-green-300"
                            onClick={() => router.push('/dashboard/courses/assign_courses')}
                        >
                            <h1>Assign more courses</h1>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </button>
                    </div>

                </div>
            </div>
            {courses.length === 0 ? (
                <p>You've not assigned yourself to any course</p>
            ) : (
                <div className="space-y-4">
                    {courses.map(course => (
                        <div
                            key={crypto.randomUUID()}
                            className="flex justify-between border rounded-lg shadow-sm"
                        >
                            <div className="grow w-full p-3">
                                <h2 className="text-lg font-semibold">
                                    {course.course_code} - {course.course_name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Availability:{" "}
                                    <span
                                        className={course.availability > 0.75 ? "text-green-600" : "text-red-600"}
                                    >
                                        {course.availability > 0.75 ? `${course.availability * 100}% Above Limit` : `${course.availability * 100}% Below Limit`}
                                    </span>
                                </p>
                            </div>
                            <ActiveLecturerDialog userId={userId} activeLecturerId={course.active_lecturer_id} onSetActiveLecturer={fetchLectuerCourses} courseCode={course.course_code} />
                            <DropCourseDialog courseCode={course.course_code} userId={userId} onCourseDropped={fetchLectuerCourses} role={role} />

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}