'use client'

import CourseAdminCourses from '@/app/ui/courses/CourseAdminCoursesPage'
import LecturerCourses from '@/app/ui/courses/LecturerCoursesPage'
import StudentCourses from '@/app/ui/courses/StudentCoursesPage'
import { useRole } from '@/app/ui/courses/RoleContext'
import AdminCoursesPage from '@/app/ui/courses/AdminCoursesPage'
import { useEffect, useState } from 'react'

export default function DashboardUsersPage() {
    const { activeRole, userId } = useRole()
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    })

    if (!isClient) return;
    return (
        <div>
            {activeRole === 'lecturer' && <LecturerCourses userId={userId} role={activeRole} />}
            {activeRole === 'student' && <StudentCourses userId={userId} role={activeRole} />}
            {activeRole === 'course_admin' && <CourseAdminCourses userId={userId} role={activeRole} />}
            {activeRole === 'qa_admin' && <AdminCoursesPage userId={userId} role={activeRole} />}
        </div>
    )
}
