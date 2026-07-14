import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudent } from "@/lib/db";
import { RIASEC_CODES, RIASEC_LABELS, topFits } from "@/lib/riasec";

export default function ReportPage({ params }: { params: { id: string } }) {
    const student = getStudent(params.id);
    if (!student) return notFound();

  const fits = topFits(student.riasec, student.skills, 5);

  return (
        <div className="max-w-2xl mx-auto space-y-8">
              <div>
                      <h1 className="text-2xl font-bold text-navy">Your AI Skills &amp; Career Report</h1>h1>
                      <p className="text-gray-500 text-sm">Generated for {student.name} · {new Date(student.createdAt).toLocaleString()}</p>p>
              </div>div>
        
              <div className="card bg-teal/5 border-teal">
                      <p className="text-gray-800">{student.narrative}</p>p>
              </div>div>
        
              <div className="card space-y-3">
                      <h2 className="font-semibold text-navy">Interest profile (RIASEC)</h2>h2>
                {RIASEC_CODES.map((code) => (
                    <div key={code} className="space-y-1">
                                <div className="flex justify-between text-sm text-gray-700">
                                              <span>{RIASEC_LABELS[code]}</span>span>
                                              <span>{Math.round(student.riasec[code] * 100)}%</span>span>
                                </div>div>
                                <div className="bar-track">
                                              <div className="bar-fill" style={{ width: `${Math.round(student.riasec[code] * 100)}%` }} />
                                </div>div>
                    </div>div>
                  ))}
              </div>div>
        
              <div className="card space-y-4">
                      <h2 className="font-semibold text-navy">Top career fits</h2>h2>
                {fits.map((f, i) => (
                    <div key={f.role.id} className="border-b last:border-0 pb-3 last:pb-0">
                                <div className="flex justify-between items-baseline">
                                              <p className="font-medium text-gray-900">{i + 1}. {f.role.title}</p>p>
                                              <p className="text-teal font-semibold text-sm">{Math.round(f.score * 100)}% match</p>p>
                                </div>div>
                                <p className="text-sm text-gray-500">{f.role.blurb}</p>p>
                      {f.gapSkills.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                                    Skill gaps: {f.gapSkills.map((g) => g.skill).join(", ")}
                                    </p>p>
                                )}
                    </div>div>
                  ))}
              </div>div>
        
              <div className="flex gap-3">
                      <Link href={`/student/roadmap/${student.id}`} className="btn-primary">View my training roadmap</Link>Link>
                      <Link href="/university" className="btn-secondary">See university view</Link>Link>
              </div>div>
        </div>div>
      );
}
</div>
