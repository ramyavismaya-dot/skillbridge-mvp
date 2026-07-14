// One-off verification script (not part of the app) — exercises the same
// logic app/actions.ts and the page components use, end to end, without
// needing a browser to drive the Next.js server-action form wiring.
import { computeRiasec, topFits, ROLES, computeFit, type SkillScores, type RiasecCode } from "./lib/riasec";
import { addStudent, addJob, getStudents } from "./lib/db";
import { buildRoadmap } from "./lib/courses";
import { generateReportNarrative, generateMatchNarrative, aiEnabled } from "./lib/ai";

async function main() {
  console.log("AI enabled (ANTHROPIC_API_KEY set)?", aiEnabled());

  // 1. Simulate a student leaning Investigative + Conventional, decent analytical/coding skill
  const answers: Record<string, number> = {
    i1: 5, i2: 5, i3: 5, c1: 4, c2: 4, c3: 4,
    r1: 2, r2: 2, r3: 2, a1: 2, a2: 2, a3: 2,
    s1: 2, s2: 2, s3: 2, e1: 3, e2: 3, e3: 3,
  };
  const skills: SkillScores = { communication: 3, analytical: 4, coding: 3, design: 1, leadership: 2, writing: 2 };

  const riasec = computeRiasec(answers);
  console.log("\nRIASEC scores:", riasec);

  const fits = topFits(riasec, skills, 5);
  console.log("\nTop 5 fits:", fits.map((f) => `${f.role.title}: ${(f.score * 100).toFixed(0)}%`));

  const narrative = await generateReportNarrative("Asha Verma", riasec, fits);
  console.log("\nReport narrative:", narrative);

  const student = addStudent({ name: "Asha Verma", email: "asha@example.edu", riasec, skills, narrative });
  console.log("\nSaved student id:", student.id);

  const roadmap = buildRoadmap(fits[0].gapSkills);
  console.log("\nRoadmap for top fit (", fits[0].role.title, "):", roadmap.map((r) => `${r.skillLabel} (gap ${r.gap}) -> ${r.courses.map((c) => c.title).join(", ")}`));

  // 2. Simulate an employer posting the "Data Analyst" role template
  const role = ROLES.find((r) => r.id === "data-analyst")!;
  const job = addJob({ title: "Junior Data Analyst", company: "Acme Corp", roleId: role.id, riasec: role.riasec, skills: role.skills as SkillScores });
  console.log("\nSaved job id:", job.id, job.title, job.riasec);

  // 3. Rank all students against this job (mirrors app/employer/[id]/page.tsx)
  const roleLike = { id: job.roleId, title: job.title, riasec: job.riasec as [RiasecCode, RiasecCode], skills: job.skills, blurb: "" };
  const students = getStudents();
  const ranked = students
    .map((s) => ({ s, score: computeFit(s.riasec, s.skills, roleLike) }))
    .sort((a, b) => b.score - a.score);
  console.log("\nRanked candidates for", job.title, ":", ranked.map((r) => `${r.s.name}: ${(r.score * 100).toFixed(0)}%`));

  const matchNarrative = await generateMatchNarrative(ranked[0].s.name, job.title, ranked[0].score, ["analytical"], ["coding"]);
  console.log("\nMatch narrative for top candidate:", matchNarrative);

  console.log("\nAll checks completed without throwing.");
}

main().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
