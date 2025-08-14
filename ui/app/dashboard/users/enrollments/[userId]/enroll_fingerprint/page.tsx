'use client';

import { API_BASE_URL } from "@/lib/constants";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EnrollFingerPrintsPage() {
    const [isClient, setIsClient] = useState(false);
    const [isEnrolledText, setIsEnrolledText] = useState("Click to enroll user...");
    const [hasEnrolled, setHasEnrolled] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const fullname = searchParams.get('fullname');
    const schId = searchParams.get('schId');
    const rolesParam = searchParams.get('roles');
    const email = searchParams.get('email');
    const roles = decodeURIComponent(rolesParam || '')
        .split(',')
        .map(role => role.trim().toLowerCase())
        .filter(role => role !== '');

    const enrollUser = async () => {
        if (hasEnrolled) return;
        setIsEnrolledText(`User is being enrolled with fingerprint. Please place your finger on the sensor...`);

        try {
            await new Promise(resolve => setTimeout(resolve, 10000));
            const response = await fetch(`${API_BASE_URL}/enrollments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: fullname,
                    email: email,
                    sch_id: schId,
                    roles: roles
                }),
            });
            if (!response.ok) {
                console.log(response)
                throw new Error(`Error enrolling user: ${response.statusText}`);
            }
            const data = await response.json();
            console.log("Enrollment response:", data);
            setHasEnrolled(true);
            setIsEnrolledText(`User has been successfully enrolled.`);



            localStorage.setItem('enrolledData', JSON.stringify({ "userID": schId, "isEnrolled": true }));

        } catch (error) {
            setIsEnrolledText("Enrollment failed. Please try again.");
            console.error("Enrollment error:", error);
        }
    };

    useEffect(() => {
        setIsClient(true);
        const edJson = localStorage.getItem('enrolledData')
        if (edJson) {
            const enrolledData = JSON.parse(edJson)
            if (schId == enrolledData.userID && enrolledData.isEnrolled) setHasEnrolled(true)
        }

        if (roles.length === 0) {
            setIsEnrolledText("No roles assigned. Please assign roles before enrolling.");
            return;
        }
    }, [schId, router]);

    if (!isClient) return null;

    return (
        <div className="">
            <h1 className="text-lg font-semibold mb-4">2. Register Card To Complete Enrollment</h1>

            <div className="mb-4">
                <p><strong>Name:</strong> {fullname}</p>
                <p><strong>School ID:</strong> {schId}</p>
            </div>

            {!hasEnrolled && (<button
                onClick={() => {
                    enrollUser()
                }
                }
                disabled={hasEnrolled}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Register Card
            </button>)}

            <p className="mb-4">{isEnrolledText}</p>

            {isEnrolledText === "User has been successfully enrolled." && (
                <div className="flex space-x-4 mt-6">
                    <button
                        onClick={() => router.push('/dashboard/users/enrollments/')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Create New User
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
}


// TODO: not saving user roles 