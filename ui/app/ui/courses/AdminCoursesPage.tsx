import Link from 'next/link'; // Import the Link component

export default function AdminCoursesPage({ userId, role }: {
    userId: string | null;
    role: string | null;
}) {
    return (
        <div className="p-6"> {/* Add some padding for better spacing */}
            <h1 className="text-3xl font-bold mb-6">
                Welcome, QA Admin!
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Eligibility Tile */}
                <Link href="/dashboard/courses/eligibilities/" passHref>
                    <div className="block p-6 border-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                        <h2 className="text-xl font-semibold mb-2">
                            Manage Course Eligibility
                        </h2>
                        <p className="text-gray-600">
                            Set up and review eligibility criteria for courses and students.
                        </p>
                    </div>
                </Link>

                {/* Availability Tile */}
                <Link href="/dashboard/courses/availability/" passHref>
                    <div className="block p-6 border-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                        <h2 className="text-xl font-semibold mb-2">
                            Manage Course Availability
                        </h2>
                        <p className="text-gray-600">
                            Set up and availability criteria for course lecturers.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}