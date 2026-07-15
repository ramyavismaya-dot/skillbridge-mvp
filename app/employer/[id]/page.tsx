import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, getStudents } from "@/lib/db";
import { computeFit, type Role, type RiasecCode, type SkillId } from "@/lib/riasec";
import { generateMatchNarrative, aiEnabled } from "@/lib/ai";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = getJob(params.id);
  if (!job) return notFound();

  const roleLike: Role = {
    id: job.roleId,
    title: job.title,
    riasec: job.riasec as [RiasecCode, RiasecCode],
    skills: job.skills,
    blurb: "",
  };

  const students = getStudents();
  const ranked = students
    .map((s) => {
      const score = computeFit(s.riasec, s.skills, roleLike, s.cognitive);
      const matchedSkills: SkillId[] = [];
      const gapSkills: SkillId[] = [];
      for (const [skill, level] of Object.entries(job.skills) as [SkillId, number][]) {
        if ((s.skills[skill] ?? 0) >= level) matchedSkills.push(skill);
        else gapSkills.push(skill);
      }
      return { student: s, score, matchedSkills, gapSkills };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const withNarratives = await Promise.all(
    ranked.map(async (r, i) => ({
      ...r,
      narrative:
        i < 3
          ? await generateMatchNarrative(r.student.name, job.title, r.score, r.matchedSkills, r.gapSkills)
          : null,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/employer" className="text-sm text-teal hover:underline">&larr; All roles</Link>
        <h1 className="text-2xl font-bold text-navy mt-1">{job.title}</h1>
        <p className="text-gray-500 text-sm">{job.company}</p>
        {!aiEnabled() && (
          <p className="text-xs text-amber-600 mt-1">
            Running without an ANTHROPIC_API_KEY — candidate blurbs below use rule-based text, not AI narratives.
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-navy mb-2">Ranked candidates ({withNarratives.length})</h2>
        {withNarratives.length === 0 && (
          <p className="text-gray-600 text-sm">
            No students in the database yet. <Link href="/student" className="text-teal underline">Add one via the assessment</Link>.
          </p>
        )}
        <div className="divide-y">
          {withNarratives.map((r, i) => (
            <div key={r.student.id} className="py-3 space-y-1">
              <div className="flex justify-between items-baseline">
                <Link href={`/student/report/${r.student.id}`} className="font-medium text-gray-900 hover:text-teal">
                  {i + 1}. {r.student.name}
                </Link>
                <span className="text-teal font-semibold text-sm">{Math.round(r.score * 100)}% match</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">{r.student.email}</p>
                {r.student.responseValidity && r.student.responseValidity !== "High" && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {r.student.responseValidity} validity
                  </span>
                )}
              </div>
              {r.narrative && <p className="text-sm text-gray-700">{r.narrative}</p>}
              {!r.narrative && (
                <p className="text-xs text-gray-500">
                  Matched: {r.matchedSkills.join(", ") || "interest fit"}
                  {r.gapSkills.length ? ` · Gaps: ${r.gapSkills.join(", ")}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
