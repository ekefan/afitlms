export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <><div className="p-6 space-y-6">User Mangement</div>
            {children}
        </>
    );
}
