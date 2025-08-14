import CreateUser from "@/app/ui/dashboard/enrollment";

export default function EnrollUsersPage() {
    return (
        <div>
            <h1 className="text-lg font-semibold mb-4">
                1. Create User
            </h1>

            <div className="p-8 rounded-lg w-full max-w-6xl border-2">
                <CreateUser />
            </div>
        </div>

    );
}