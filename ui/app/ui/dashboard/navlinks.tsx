'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Define allowed user roles
type UserRole = 'qa_admin' | 'student' | 'lecturer';
const baseLinks = [{ name: 'Home', href: '/dashboard' }];

const roleBasedLinks: Record<UserRole, { name: string; href: string }[]> = {
    qa_admin: [
        { name: 'Courses', href: '/dashboard/courses' },
        { name: 'User Management', href: '/dashboard/users' },

    ],
    student: [
        { name: 'Courses', href: '/dashboard/courses' },
        { name: 'Profile', href: '/dashboard/profile' },
    ],
    lecturer: [
        { name: 'Courses', href: '/dashboard/courses' },
        { name: 'Profile', href: '/dashboard/profile' },
    ],

};

export default function NavLinks() {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true)
        try {
            const user = localStorage.getItem('user');
            const roles: string[] = user ? JSON.parse(user).roles ?? [] : []

            const validRoles = roles.filter((r): r is UserRole =>
                ['qa_admin', 'student', 'lecturer', 'course_admin'].includes(r.toLowerCase())
            );

            if (validRoles.length > 0) {
                setUserRole(validRoles[0]);
            }
        } catch (e) {
            console.error("failed to parse user from localstorage: ", e);
        }
    }, []);

    if (!isClient) return

    const linksToShow = userRole && roleBasedLinks[userRole]
        ? [...baseLinks, ...roleBasedLinks[userRole]]
        : baseLinks;

    return (
        <>
            {linksToShow.map((link) => (
                <Link
                    key={link.name}
                    href={link.href}
                    className={clsx(
                        'flex h-[48px] grow items-center justify-center gap-2 rounded-md border-2 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                        {
                            'bg-blue-300 dark:bg-slate-700': pathname === link.href,
                        }
                    )}
                >
                    {link.name}
                </Link>
            ))}
        </>
    );
}
