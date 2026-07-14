"use server";

import { redirect } from "next/navigation";
import { addStudent, addJob, getStudents } from "@/lib/db";
import {
    RIASEC_QUESTIONS,
    SKILLS,
    computeRiasec,
    topFits,
    ROLES,
    type SkillScores,
} from "@/lib/riasec";
import { generateReportNarrative } from "@/lib/ai";

export async function submitAssessment(formData: FormData): Promise<void> {
    const name = String(formData.get("name") || "").trim() || "Student";
    const email = String(formData.get("email") || "").trim();

  const answers: Record<string, number> = {};
    for (const q of RIASEC_QUESTIONS) {
          answers[q.id] = Number(formData.get(q.id) || 3);
    }

  const skills = {} as SkillScores;
    for (const s of SKILLS) {
          skills[s] = Number(formData.get(s) || 0);
    }

  const riasec = computeRiasec(answers);
    const fits = topFits(riasec, skills, 5);
    const narrative = await generateReportNarrative(name, riasec, fits);

  const student = addStudent({ name, email, riasec, skills, narrative });

  redirect(`/student/report/${student.id}`);
}

export async function createJob(formData: FormData): Promise<void> {
    const title = String(formData.get("title") || "").trim();
    const company = String(formData.get("company") || "").trim() || "Founding Employer Partner";
    const roleId = String(formData.get("roleId") || "");
    const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0];

  const job = addJob({
        title: title || role.title,
        company,
        roleId: role.id,
        riasec: role.riasec,
        skills: role.skills as SkillScores,
  });

  redirect(`/employer/${job.id}`);
}

export async function studentCount(): Promise<number> {
    return getStudents().length;
}
