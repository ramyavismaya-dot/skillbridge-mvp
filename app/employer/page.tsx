import Link from "next/link";
import { getJobs } from "@/lib/db";

// Force dynamic rendering — see app/university/page.tsx for why.
export const dynamic = "force-dynamic";

export default function EmployerPage() {
  const jobs = getJobs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy">Employer Dashboard</h1>
          <p className="text-gray-500 text-sm">{jobs.length} open role{jobs.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/employer/new" className="btn-primary">+ Post a role</Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <p className="text-gray-600">No roles posted yet. <Link href="/employer/new" className="text-teal underline">Post your first role</Link>.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Link key={j.id} href={`/employer/${j.id}`} className="card block hover:border-teal transition">
              <div className="flex justify-between items-baseline">
                <h2 className="font-semibold text-navy">{j.title}</h2>
                <span className="text-xs text-gray-400">{new Date(j.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-500">{j.company}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
