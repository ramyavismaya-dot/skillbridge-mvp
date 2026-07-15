"use server";

import { redirect } from "next/navigation";
import { addStudent, addJob, getStudents } from "@/lib/db";
import {
  ATTENTION_CHECK_QUESTIONS,
  ROLES,
  computeRiasec,
  topFits,
  type SkillScores,
} from "@/lib/riasec";
import {
  scoreGoNoGo,
  scoreStroop,
  computeCognitiveProfile,
  computeResponseValidity,
  type GoNoGoTrial,
  type StroopTrial,
} from "@/lib/games";
import { generateReportNarrative } from "@/lib/ai";

export interface AssessmentSubmission {
  name: string;
  email: string;
  riasecAnswers: Record<string, number>;
  attentionCheckAnswers: Record<string, number>;
  riasecResponseTimesMs: number[];
  skills: SkillScores;
  goNoGoTrials: GoNoGoTrial[];
  stroopTrials: StroopTrial[];
}

// Called directly from the client-side assessment wizard (not bound to a
// <form action>), since the games require real-time client interactivity.
// Next.js server actions can be imported and awaited directly like this.
export async function submitAssessment(data: AssessmentSubmission): Promise<{ studentId: string }> {
  const name = data.name.trim() || "Student";
  const email = data.email.trim();

  const riasec = computeRiasec(data.riasecAnswers);

  const goNoGoResult = scoreGoNoGo(data.goNoGoTrials);
  const stroopResult = scoreStroop(data.stroopTrials);
  const cognitive = computeCognitiveProfile(goNoGoResult, stroopResult);

  const attentionChecksTotal = ATTENTION_CHECK_QUESTIONS.length;
  const attentionChecksPassed = ATTENTION_CHECK_QUESTIONS.filter(
    (q) => Number(data.attentionCheckAnswers[q.id]) === q.correctValue
  ).length;

  const riasecValues = Object.values(data.riasecAnswers).map(Number);
  const mean = riasecValues.length ? riasecValues.reduce((a, b) => a + b, 0) / riasecValues.length : 0;
  const variance = riasecValues.length
    ? riasecValues.reduce((acc, v) => acc + (v - mean) ** 2, 0) / riasecValues.length
    : 0;

  const sortedTimes = [...data.riasecResponseTimesMs].filter((t) => Number.isFinite(t)).sort((a, b) => a - b);
  const medianRiasecResponseMs = sortedTimes.length ? sortedTimes[Math.floor(sortedTimes.length / 2)] : null;

  const { validity, flags } = computeResponseValidity({
    attentionChecksPassed,
    attentionChecksTotal,
    riasecAnswerVariance: variance,
    medianRiasecResponseMs,
    goNoGo: goNoGoResult,
    stroop: stroopResult,
  });

  const fits = topFits(riasec, data.skills, cognitive, 5);
  const narrative = await generateReportNarrative(name, riasec, fits);

  const student = addStudent({
    name,
    email,
    riasec,
    skills: data.skills,
    cognitive,
    responseValidity: validity,
    validityFlags: flags,
    narrative,
  });

  return { studentId: student.id };
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
