export default function DashboardUsersPage() {
    const cards = [
        { title: 'Enroll New User', href: '/dashboard/users/enrollments/' },
        { title: 'Students', href: '/dashboard/users/students' },
        { title: 'Lecturers', href: '/dashboard/users/lecturers' },
        { title: 'Course Admins', href: '/dashboard/users/course-admins' },
        { title: 'QA Admins', href: '/dashboard/users/qa-admins' },
    ];

    return (
        <div className="p-6 space-y-6 ">
            <h1 className="text-2xl font-semibold mb-4">Manage All Users</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {cards.map(({ title, href }) => (
                    <a
                        key={title}
                        href={href}
                        className="
              rounded-md border-2 p-3 text-sm font-medium h-28
              flex items-center justify-center
              cursor-pointer
              transition
              hover:bg-sky-100 hover:border-blue-500 hover:text-blue-600
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
                    >
                        {title}
                    </a>
                ))}
            </div>
        </div>
    );
}
