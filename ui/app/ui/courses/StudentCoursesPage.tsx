'use client';

import { API_BASE_URL } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DropCourseDialog from "./DropCourseDialog";

type CourseEligibility = {
    course_id: string;
    course_code: string;
    course_name: string;
    eligibility: number;
};

export default function StudentCourses({ userId, role }: {
    userId: string | null;
    role: string | null;
}) {
    const [courses, setCourses] = useState<CourseEligibility[]>([]);
    const [isClient, setIsClient] = useState(false)
    const router = useRouter();
    const fetchCourses = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/students/${userId}/eligibility`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await res.json();
            console.log(data);
            setCourses(data.courses);
        } catch (err: any) {
            console.log(err)
        }
    };

    useEffect(() => {
        setIsClient(true)
        fetchCourses();
        console.log(courses)
    }, [userId]);

    if (!isClient) return null
    return (
        <div className="">
            <div className="mb-6">
                <h1 className="text-xl font-semibold">Registered Courses</h1>
                <div className="justify-end flex">
                    <button
                        className="border-2 flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-green-300"
                        onClick={() => router.push('/dashboard/courses/register')}
                    >
                        <h1>Register More Courses</h1>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </button>

                </div>
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
                                    {course.course_code} - {course.course_name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Eligibility:{" "}
                                    <span
                                        className={course.eligibility > 0.75 ? "text-green-600" : "text-red-600"}
                                    >
                                        {course.eligibility > 0.75 ? `${course.eligibility * 100}% Eligible` : `${course.eligibility * 100}% Not Eligible`}
                                    </span>
                                </p>
                            </div>
                            <DropCourseDialog courseCode={course.course_code} userId={userId} onCourseDropped={fetchCourses} role={role} />

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
