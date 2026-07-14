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
                      <h1 className="text-2xl font-bold text-navy">Career Services Dashboard</h1>h1>
                      <p className="text-gray-500 text-sm">{students.length} student{students.length === 1 ? "" : "s"} assessed</p>p>
              </div>div>
        
          {students.length === 0 ? (
                  <div className="card">
                            <p className="text-gray-600">No students yet. <Link href="/student" className="text-teal underline">Take the assessment</Link>Link> to populate this dashboard.</p>p>
                  </div>div>
                ) : (
                  <>
                            <div className="grid md:grid-cols-2 gap-6">
                                        <div className="card space-y-3">
                                                      <h2 className="font-semibold text-navy">Cohort interest clusters</h2>h2>
                                          {RIASEC_CODES.map((code) => (
                                    <div key={code} className="space-y-1">
                                                      <div className="flex justify-between text-sm text-gray-700">
                                                                          <span>{RIASEC_LABELS[code]}</span>span>
                                                                          <span>{codeCounts[code]}</span>span>
                                                      </div>div>
                                                      <div className="bar-track">
                                                                          <div
                                                                                                  className="bar-fill"
                                                                                                  style={{ width: `${students.length ? (codeCounts[code] / students.length) * 100 : 0}%` }}
                                                                                                />
                                                      </div>div>
                                    </div>div>
                                  ))}
                                        </div>div>
                            
                                        <div className="card space-y-3">
                                                      <h2 className="font-semibold text-navy">Average skill levels (0-5)</h2>h2>
                                          {SKILLS.map((sk) => (
                                    <div key={sk} className="space-y-1">
                                                      <div className="flex justify-between text-sm text-gray-700">
                                                                          <span>{SKILL_LABELS[sk]}</span>span>
                                                                          <span>{avgSkill(sk).toFixed(1)}</span>span>
                                                      </div>div>
                                                      <div className="bar-track">
                                                                          <div className="bar-fill" style={{ width: `${(avgSkill(sk) / 5) * 100}%` }} />
                                                      </div>div>
                                    </div>div>
                                  ))}
                                        </div>div>
                            </div>div>
                  
                            <div className="card overflow-x-auto">
                                        <h2 className="font-semibold text-navy mb-3">Students</h2>h2>
                                        <table className="w-full text-sm">
                                                      <thead>
                                                                      <tr className="text-left text-gray-500 border-b">
                                                                                        <th className="py-2 pr-4">Name</th>th>
                                                                                        <th className="py-2 pr-4">Email</th>th>
                                                                                        <th className="py-2 pr-4">Top interest</th>th>
                                                                                        <th className="py-2 pr-4">Top career fit</th>th>
                                                                                        <th className="py-2 pr-4">Assessed</th>th>
                                                                      </tr>tr>
                                                      </thead>thead>
                                                      <tbody>
                                                        {students.map((s) => {
                                      const fit = topFits(s.riasec, s.skills, 1)[0];
                                      return (
                                                            <tr key={s.id} className="border-b last:border-0">
                                                                                  <td className="py-2 pr-4">
                                                                                                          <Link href={`/student/report/${s.id}`} className="text-teal hover:underline">{s.name}</Link>Link>
                                                                                    </td>td>
                                                                                  <td className="py-2 pr-4 text-gray-500">{s.email}</td>td>
                                                                                  <td className="py-2 pr-4">{RIASEC_LABELS[topRiasecCodes(s.riasec, 1)[0]]}</td>td>
                                                                                  <td className="py-2 pr-4">{fit?.role.title} ({Math.round((fit?.score ?? 0) * 100)}%)</td>td>
                                                                                  <td className="py-2 pr-4 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>td>
                                                            </tr>tr>
                                                          );
                  })}
                                                      </tbody>tbody>
                                        </table>table>
                            </div>div>
                  </>>
                )}
        </div>div>
      );
}
</></div>
