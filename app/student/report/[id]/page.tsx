import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudent } from "@/lib/db";
import { RIASEC_CODES, RIASEC_LABELS, SKILL_LABELS, topFits } from "@/lib/riasec";
import type { ResponseValidity } from "@/lib/games";

const COGNITIVE_LABELS: Record<string, { label: string; blurb: (pct: number) => string }> = {
  processingSpeed: {
    label: "Processing speed",
    blurb: (pct) => (pct >= 70
      ? "Responded quickly and consistently on the attention game."
      : pct >= 40
      ? "Responded at a typical pace on the attention game."
      : "Took longer than typical to respond on the attention game."),
  },
  sustainedAttention: {
    label: "Sustained attention",
    blurb: (pct) => (pct >= 70
      ? "Maintained consistent attention with minimal missed responses."
      : pct >= 40
      ? "Some attention lapses during the longer task."
      : "Noticeable attention lapses — missed a meaningful share of responses."),
  },
  impulseControl: {
    label: "Impulse control",
    blurb: (pct) => (pct >= 70
      ? "Reliably held back from responding on \"stop\" trials."
      : pct >= 40
      ? "Occasionally responded when it should have held back."
      : "Frequently responded on trials that called for holding back."),
  },
  cognitiveControl: {
    label: "Cognitive control (focus under interference)",
    blurb: (pct) => (pct >= 70
      ? "Stayed accurate and fast even when the task tried to mislead."
      : pct >= 40
      ? "Some slowdown when the task tried to mislead — typical range."
      : "Notable slowdown when the task's word and color conflicted."),
  },
};

const VALIDITY_STYLES: Record<ResponseValidity, string> = {
  High: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-red-50 text-red-700 border-red-200",
};

export default function ReportPage({ params }: { params: { id: string } }) {
  const student = getStudent(params.id);
  if (!student) return notFound();

  const fits = topFits(student.riasec, student.skills, student.cognitive, 5);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Your AI Skills &amp; Career Report</h1>
          <p className="text-gray-500 text-sm">Generated for {student.name} · {new Date(student.createdAt).toLocaleString()}</p>
        </div>
        {student.responseValidity && (
          <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full border ${VALIDITY_STYLES[student.responseValidity]}`}>
            Response validity: {student.responseValidity}
          </span>
        )}
      </div>

      {student.responseValidity === "Low" && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-700">
            This assessment was flagged as low-validity: {student.validityFlags.join("; ")}. Consider
            asking this student to retake it before relying on the scores below.
          </p>
        </div>
      )}

      <div className="card bg-teal/5 border-teal">
        <p className="text-gray-800">{student.narrative}</p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-navy">Interest profile (RIASEC)</h2>
        <p className="text-xs text-gray-500">Self-reported.</p>
        {RIASEC_CODES.map((code) => (
          <div key={code} className="space-y-1">
            <div className="flex justify-between text-sm text-gray-700">
              <span>{RIASEC_LABELS[code]}</span>
              <span>{Math.round(student.riasec[code] * 100)}%</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.round(student.riasec[code] * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {student.cognitive && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-navy">Cognitive profile</h2>
          <p className="text-xs text-gray-500">
            Behavioral — measured from the two games, not self-rated. Provisional scoring; see the
            README for what this does and doesn&apos;t validate yet.
          </p>
          {Object.entries(COGNITIVE_LABELS).map(([key, meta]) => {
            const value = (student.cognitive as unknown as Record<string, number>)[key] ?? 0;
            const pct = Math.round(value * 100);
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>{meta.label}</span>
                  <span>{pct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500">{meta.blurb(pct)}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="card space-y-3">
        <h2 className="font-semibold text-navy">Skill self-rating</h2>
        <p className="text-xs text-gray-500">Self-reported — shown alongside the behavioral cognitive scores above, not instead of them.</p>
        {Object.entries(student.skills).map(([skill, level]) => (
          <div key={skill} className="space-y-1">
            <div className="flex justify-between text-sm text-gray-700">
              <span>{SKILL_LABELS[skill as keyof typeof SKILL_LABELS] ?? skill}</span>
              <span>{level}/5</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(Number(level) / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-navy">Top career fits</h2>
        {fits.map((f, i) => (
          <div key={f.role.id} className="border-b last:border-0 pb-3 last:pb-0">
            <div className="flex justify-between items-baseline">
              <p className="font-medium text-gray-900">{i + 1}. {f.role.title}</p>
              <p className="text-teal font-semibold text-sm">{Math.round(f.score * 100)}% match</p>
            </div>
            <p className="text-sm text-gray-500">{f.role.blurb}</p>
            {f.gapSkills.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Skill gaps: {f.gapSkills.map((g) => g.skill).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href={`/student/roadmap/${student.id}`} className="btn-primary">View my training roadmap</Link>
        <Link href="/university" className="btn-secondary">See university view</Link>
      </div>
    </div>
  );
}
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
        <h1 className="text-2xl font-bold text-navy">Your AI Skills &amp; Career Report</h1>
        <p className="text-gray-500 text-sm">Generated for {student.name} · {new Date(student.createdAt).toLocaleString()}</p>
      </div>

      <div className="card bg-teal/5 border-teal">
        <p className="text-gray-800">{student.narrative}</p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-navy">Interest profile (RIASEC)</h2>
        {RIASEC_CODES.map((code) => (
          <div key={code} className="space-y-1">
            <div className="flex justify-between text-sm text-gray-700">
              <span>{RIASEC_LABELS[code]}</span>
              <span>{Math.round(student.riasec[code] * 100)}%</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.round(student.riasec[code] * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-navy">Top career fits</h2>
        {fits.map((f, i) => (
          <div key={f.role.id} className="border-b last:border-0 pb-3 last:pb-0">
            <div className="flex justify-between items-baseline">
              <p className="font-medium text-gray-900">{i + 1}. {f.role.title}</p>
              <p className="text-teal font-semibold text-sm">{Math.round(f.score * 100)}% match</p>
            </div>
            <p className="text-sm text-gray-500">{f.role.blurb}</p>
            {f.gapSkills.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Skill gaps: {f.gapSkills.map((g) => g.skill).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href={`/student/roadmap/${student.id}`} className="btn-primary">View my training roadmap</Link>
        <Link href="/university" className="btn-secondary">See university view</Link>
      </div>
    </div>
  );
}
