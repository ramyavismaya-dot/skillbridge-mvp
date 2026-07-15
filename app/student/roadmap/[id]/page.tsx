import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudent } from "@/lib/db";
import { topFits } from "@/lib/riasec";
import { buildRoadmap } from "@/lib/courses";

export default function RoadmapPage({ params }: { params: { id: string } }) {
  const student = getStudent(params.id);
  if (!student) return notFound();

  const fits = topFits(student.riasec, student.skills, student.cognitive, 1);
  const topRole = fits[0];
  const roadmap = topRole ? buildRoadmap(topRole.gapSkills) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Your Training Roadmap</h1>
        <p className="text-gray-500 text-sm">
          Toward: <span className="font-medium text-gray-800">{topRole?.role.title}</span> ({Math.round((topRole?.score ?? 0) * 100)}% current match)
        </p>
      </div>

      {roadmap.length === 0 ? (
        <div className="card">
          <p className="text-gray-700">
            You already meet or exceed the required skill levels for your top-fit role. You&apos;re
            ready to be matched to relevant employers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {roadmap.map((item) => (
            <div key={item.skill} className="card space-y-2">
              <div className="flex justify-between items-baseline">
                <h2 className="font-semibold text-navy">{item.skillLabel}</h2>
                <span className="text-xs text-gray-500">gap: {item.gap} level{item.gap > 1 ? "s" : ""}</span>
              </div>
              <ul className="space-y-1">
                {item.courses.map((c) => (
                  <li key={c.title} className="text-sm text-gray-700 flex justify-between border-b last:border-0 py-1">
                    <span>{c.title} <span className="text-gray-400">· {c.provider}</span></span>
                    <span className="text-gray-500">{c.hours}h</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-gray-50">
        <p className="text-sm text-gray-600">
          In the full product, completing these courses would trigger a re-assessment, updating
          your verified profile and unlocking visibility to employers hiring for {topRole?.role.title}.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href={`/student/report/${student.id}`} className="btn-secondary">Back to report</Link>
        <Link href="/employer" className="btn-primary">See employer view</Link>
      </div>
    </div>
  );
}
