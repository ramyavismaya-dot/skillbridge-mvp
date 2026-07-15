import Link from "next/link";
import { getStudents } from "@/lib/db";
import { RIASEC_CODES, RIASEC_LABELS, SKILLS, SKILL_LABELS, topRiasecCodes, topFits } from "@/lib/riasec";

// Force dynamic rendering: this dashboard reads live data from db.json on
// every request. Without this, Next.js would statically pre-render it once
// at build time and never show new students.
export const dynamic = "force-dynamic";

export default function UniversityDashboard() {
  const students = getStudents();

  const codeCounts: Record<string, number> = Object.fromEntries(RIASEC_CODES.map((c) => [c, 0]));
  const skillTotals: Record<string, number> = Object.fromEntries(SKILLS.map((s) => [s, 0]));

  for (const s of students) {
    const top = topRiasecCodes(s.riasec, 1)[0];
    codeCounts[top] += 1;
    for (const sk of SKILLS) skillTotals[sk] += s.skills[sk] ?? 0;
  }

  const avgSkill = (sk: string) => (students.length ? skillTotals[sk] / students.length : 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Career Services Dashboard</h1>
        <p className="text-gray-500 text-sm">{students.length} student{students.length === 1 ? "" : "s"} assessed</p>
      </div>

      {students.length === 0 ? (
        <div className="card">
          <p className="text-gray-600">No students yet. <Link href="/student" className="text-teal underline">Take the assessment</Link> to populate this dashboard.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card space-y-3">
              <h2 className="font-semibold text-navy">Cohort interest clusters</h2>
              {RIASEC_CODES.map((code) => (
                <div key={code} className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>{RIASEC_LABELS[code]}</span>
                    <span>{codeCounts[code]}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${students.length ? (codeCounts[code] / students.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="card space-y-3">
              <h2 className="font-semibold text-navy">Average skill levels (0-5)</h2>
              {SKILLS.map((sk) => (
                <div key={sk} className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>{SKILL_LABELS[sk]}</span>
                    <span>{avgSkill(sk).toFixed(1)}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(avgSkill(sk) / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card overflow-x-auto">
            <h2 className="font-semibold text-navy mb-3">Students</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Top interest</th>
                  <th className="py-2 pr-4">Top career fit</th>
                  <th className="py-2 pr-4">Validity</th>
                  <th className="py-2 pr-4">Assessed</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const fit = topFits(s.riasec, s.skills, 1)[0];
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <Link href={`/student/report/${s.id}`} className="text-teal hover:underline">{s.name}</Link>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{s.email}</td>
                      <td className="py-2 pr-4">{RIASEC_LABELS[topRiasecCodes(s.riasec, 1)[0]]}</td>
                      <td className="py-2 pr-4">{fit?.role.title} ({Math.round((fit?.score ?? 0) * 100)}%)</td>
                      <td className="py-2 pr-4">
                        {s.responseValidity && (
                          <span
                            className={
                              "text-xs font-medium px-1.5 py-0.5 rounded-full border " +
                              (s.responseValidity === "High"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : s.responseValidity === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200")
                            }
                          >
                            {s.responseValidity}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
