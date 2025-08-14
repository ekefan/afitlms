'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/constants"

export default function DropCourseDialog({
    courseCode,
    userId,
    role,
    onCourseDropped,
}: {
    courseCode: string | null;
    userId: string | null;
    role: string | null;
    onCourseDropped?: () => void;
}) {
    const [dropCourseText, setDropCourseText] = useState("Drop Course");
    const [alertDialogDescriptionText, setAlertDialogDescriptionText] = useState('This will unregister you from this course. You can re-register if eligible.');
    const [confirmDropText, setConfirmDropText] = useState("Confirm Drop");
    const [loading, setLoading] = useState(false);

    if (!role) return;
    useEffect(() => {
        if (role == 'lecturer') {
            setDropCourseText('Unassign');
            setAlertDialogDescriptionText('This will remove you as the active lecturer from this course. You can set as active lecturer if no other lecturer assign')
            setConfirmDropText('Confirm')
        }
    }, [])
    const handleDropCourse = async () => {
        try {
            setLoading(true)

            const studentURL = `${API_BASE_URL}/users/students/${userId}/course_registrations/${courseCode}`
            const lecturerURL = `${API_BASE_URL}/users/lecturers/${userId}/course_assignments/${courseCode}`
            let serverUrl: string | null = null;

            if (!role) return;
            if (role.toLowerCase() === 'student') serverUrl = studentURL
            else if (role?.toLowerCase() === 'lecturer') {
                serverUrl = lecturerURL
            }
            if (!serverUrl) return;

            const res = await fetch(serverUrl, {
                method: "DELETE", // or "POST" depending on your backend
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            })
            if (!res.ok) throw new Error("Failed to drop course")

            if (onCourseDropped) {
                onCourseDropped();
            }
        } catch (err) {
            console.error(err)
            alert("Failed to drop course. Try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <div className="grow w-1/6 border-l-2 p-3 font-semibold items-center justify-center flex cursor-pointer hover:bg-red-200 hover:rounded-r-lg">
                    {dropCourseText}
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {alertDialogDescriptionText}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDropCourse} disabled={loading}>
                        {loading ? "Dropping..." : confirmDropText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
