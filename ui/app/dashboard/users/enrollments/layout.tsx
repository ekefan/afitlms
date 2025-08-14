import CreateUser from "@/app/ui/dashboard/enrollment";

export default function EnrollUsersPage({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-6 space-y-6 ">
            <h1 className="text-2xl font-semibold mb-4">
                Creating a new User
            </h1>
            {children}
        </div >
    );
}