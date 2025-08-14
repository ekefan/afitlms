import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="mb-4">
        AFIT LMS
      </div>
      <Link href="/login" className="bg-foreground text-background rounded-md border-2 p-1 ml-1">Signup</Link>
    </div>

  );
}