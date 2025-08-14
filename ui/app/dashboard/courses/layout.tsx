'use client'

import { RoleContext } from '@/app/ui/courses/RoleContext';
import React, { useCallback, useEffect, useState } from 'react';
import { RoleSwitcherDropdown } from '@/app/ui/courses/SwitchRoles';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isClient, setIsClient] = useState(false);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [welcomeMessage, setWelcomeMessage] = useState('Manage Your Courses');
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    const switchRole = useCallback((role: string) => {

        const normalizedRole = role.toLowerCase();
        const allowedPathForRoleChange = '/dashboard/courses';

        console.log(pathname);

        if (pathname !== allowedPathForRoleChange) {
            toast('Ops Sorry You Can\' do that :)', {
                description: 'You can only change roles',
                action: {
                    label: 'On Course Page',
                    onClick: () => router.push(allowedPathForRoleChange),
                },
            });
            return;
        }

        if (userRoles.map(r => r.toLowerCase()).includes(normalizedRole)) {
            setActiveRole(normalizedRole);
        } else console.warn(`Attempted to switch to an invalid role: ${role}`)
    }, [userRoles, pathname]);

    useEffect(() => {
        setIsClient(true)
        try {
            const rawUser = localStorage.getItem('user')
            const user = rawUser ? JSON.parse(rawUser) : null

            if (!user) {
                alert("Couldn't read user from local storage")
                return
            }

            const roles: string[] = user.roles || []
            setUserRoles(roles)
            setUserId(user.id || null)
            setActiveRole(roles[0]);
        } catch (err) {
            console.error("Error parsing user roles:", err)
        }
    }, [])

    useEffect(() => {
        if (activeRole === 'admin') setWelcomeMessage('Eligibility and Availability');
    }, [activeRole]);
    if (!isClient || activeRole === null) return null;
    return (
        <RoleContext.Provider value={{ activeRole, switchRole, userId }}>
            <div className="p-6 space-y-6 xl:w-8/12">
                <div className=" space-y-6">
                    <h1 className="text-2xl font-semibold">{welcomeMessage}</h1>
                    <div className="flex justify-end">
                        {userRoles.length >= 1 && (
                            <RoleSwitcherDropdown
                                roles={userRoles}
                                activeRole={activeRole}
                                onRoleChange={switchRole}
                            />
                        )}
                    </div>
                </div>

                {children}
            </div>
        </RoleContext.Provider>
    )
}
