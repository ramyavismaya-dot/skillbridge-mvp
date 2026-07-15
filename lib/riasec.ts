// Core assessment + matching engine for the MVP.
//
// Model: a simplified Holland Code / RIASEC interest inventory (6 categories,
// 2 questions each, 1-5 Likert) combined with a 6-dimension self-rated skill
// profile. Self-report only — made harder to game via embedded attention
// checks and response-validity signals (see lib/games.ts). This is a
// reasonable, widely-used, non-proprietary starting point for a real
// product — but it is NOT a validated psychometric instrument. Before this
// output is used to influence real hiring or advising decisions, have an
// I/O psychologist review/replace the item bank (see business plan,
// Section 12: Key Risks & Mitigations).

export const RIASEC_CODES = ["R", "I", "A", "S", "E", "C"] as const;
export type RiasecCode = (typeof RIASEC_CODES)[number];
export type RiasecScores = Record<RiasecCode, number>; // 0..1, normalized

export const RIASEC_LABELS: Record<RiasecCode, string> = {
  R: "Realistic (hands-on / practical)",
  I: "Investigative (analytical / research)",
  A: "Artistic (creative / original)",
  S: "Social (helping / teaching)",
  E: "Enterprising (leading / persuading)",
  C: "Conventional (organizing / precise)",
};

export interface Question {
  id: string;
  code: RiasecCode;
  text: string;
}

// 2 questions per category (12 total). Kept intentionally short — combined
// with the attention-check items below, this is meant to take a few minutes
// while still being harder to answer carelessly than a long questionnaire.
export const RIASEC_QUESTIONS: Question[] = [
  { id: "r1", code: "R", text: "I enjoy working with tools, machines, or building/fixing things with my hands." },
  { id: "r2", code: "R", text: "I prefer active, hands-on tasks over sitting at a desk all day." },
  { id: "i1", code: "I", text: "I enjoy analyzing data, solving puzzles, or researching how things work." },
  { id: "i2", code: "I", text: "I like asking 'why' and digging into root causes before acting." },
  { id: "a1", code: "A", text: "I enjoy creative work such as writing, design, music, or art." },
  { id: "a2", code: "A", text: "I like coming up with original ideas more than following a fixed process." },
  { id: "s1", code: "S", text: "I enjoy helping, teaching, or advising other people." },
  { id: "s2", code: "S", text: "I am energized by working closely with a team." },
  { id: "e1", code: "E", text: "I enjoy persuading, leading, or motivating others." },
  { id: "e2", code: "E", text: "I like taking initiative and pursuing ambitious goals." },
  { id: "c1", code: "C", text: "I enjoy organizing information, data, or processes accurately." },
  { id: "c2", code: "C", text: "I like following clear procedures and structured plans." },
];

// Embedded attention-check items, mixed into the interest section at random
// positions on the client. Not part of RIASEC scoring — used only for the
// response-validity layer (see lib/games.ts computeResponseValidity).
export interface AttentionCheckQuestion {
  id: string;
  text: string;
  correctValue: number;
}

export const ATTENTION_CHECK_QUESTIONS: AttentionCheckQuestion[] = [
  { id: "ac1", text: "To confirm you're reading each item, select \"Disagree\" for this question.", correctValue: 2 },
  { id: "ac2", text: "This is an attention check — please select \"Disagree\" here to continue.", correctValue: 2 },
];

export const SKILLS = ["communication", "analytical", "coding", "design", "leadership", "writing"] as const;
export type SkillId = (typeof SKILLS)[number];
export type SkillScores = Record<SkillId, number>; // 0..5 self-rated

export const SKILL_LABELS: Record<SkillId, string> = {
  communication: "Communication",
  analytical: "Analytical / Quantitative",
  coding: "Coding / Technical",
  design: "Design / Creative",
  leadership: "Leadership / Management",
  writing: "Writing",
};

export interface Role {
  id: string;
  title: string;
  riasec: [RiasecCode, RiasecCode]; // primary, secondary
  skills: Partial<SkillScores>; // required level 0..5 per skill
  blurb: string;
}

export const ROLES: Role[] = [
  { id: "data-analyst", title: "Data Analyst", riasec: ["I", "C"], skills: { analytical: 5, coding: 3, communication: 3 }, blurb: "Turns raw data into decisions." },
  { id: "software-engineer", title: "Software Engineer", riasec: ["I", "R"], skills: { coding: 5, analytical: 4, communication: 2 }, blurb: "Builds and ships software systems." },
  { id: "ux-designer", title: "UX / Product Designer", riasec: ["A", "I"], skills: { design: 5, communication: 4, analytical: 2 }, blurb: "Designs usable, user-centered products." },
  { id: "growth-marketing", title: "Growth / Marketing", riasec: ["E", "A"], skills: { communication: 4, writing: 4, analytical: 3 }, blurb: "Drives audience growth and demand." },
  { id: "people-ops", title: "HR / People Operations", riasec: ["S", "E"], skills: { communication: 5, leadership: 3, writing: 3 }, blurb: "Builds and supports great teams." },
  { id: "program-manager", title: "Project / Program Manager", riasec: ["E", "C"], skills: { leadership: 4, communication: 4, analytical: 3 }, blurb: "Coordinates people and plans to hit goals." },
  { id: "financial-analyst", title: "Financial Analyst", riasec: ["C", "I"], skills: { analytical: 5, coding: 2, communication: 3 }, blurb: "Models numbers to guide business decisions." },
  { id: "content-writer", title: "Content Writer / Journalist", riasec: ["A", "S"], skills: { writing: 5, communication: 4, design: 2 }, blurb: "Tells stories that inform and persuade." },
  { id: "sales-bd", title: "Sales / Business Development", riasec: ["E", "S"], skills: { communication: 5, leadership: 3, writing: 2 }, blurb: "Builds relationships that grow revenue." },
  { id: "operations", title: "Operations / Supply Chain", riasec: ["C", "R"], skills: { analytical: 4, leadership: 2, communication: 3 }, blurb: "Keeps complex processes running smoothly." },
  { id: "teacher-trainer", title: "Teacher / Corporate Trainer", riasec: ["S", "A"], skills: { communication: 5, writing: 3, leadership: 3 }, blurb: "Helps others learn and grow." },
  { id: "research-scientist", title: "Research Scientist", riasec: ["I", "A"], skills: { analytical: 5, writing: 3, coding: 3 }, blurb: "Investigates open questions rigorously." },
  { id: "visual-designer", title: "Graphic / Visual Designer", riasec: ["A", "R"], skills: { design: 5, communication: 2, coding: 1 }, blurb: "Crafts visual identity and communication." },
  { id: "strategy-consultant", title: "Strategy Consultant", riasec: ["E", "I"], skills: { analytical: 4, communication: 4, leadership: 3 }, blurb: "Solves ambiguous business problems." },
];

export function emptyRiasecAnswers(): Record<string, number> {
  return Object.fromEntries(RIASEC_QUESTIONS.map((q) => [q.id, 3]));
}

export function computeRiasec(answers: Record<string, number>): RiasecScores {
  const sums: Record<RiasecCode, number[]> = { R: [], I: [], A: [], S: [], E: [], C: [] };
  for (const q of RIASEC_QUESTIONS) {
    const v = Number(answers[q.id] ?? 3);
    sums[q.code].push(Math.min(5, Math.max(1, v)));
  }
  const out = {} as RiasecScores;
  for (const code of RIASEC_CODES) {
    const arr = sums[code];
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length; // 1..5
    out[code] = (avg - 1) / 4; // normalize to 0..1
  }
  return out;
}

export function topRiasecCodes(scores: RiasecScores, n = 2): RiasecCode[] {
  return RIASEC_CODES.slice()
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, n);
}

/**
 * 0..1 fit score between a student's profile and a role.
 * Blends interest fit and self-rated skill fit, 50% / 50%.
 */
export function computeFit(riasec: RiasecScores, skills: SkillScores, role: Role): number {
  const [primary, secondary] = role.riasec;
  const riasecScore = 0.65 * riasec[primary] + 0.35 * riasec[secondary];

  const req = Object.entries(role.skills) as [SkillId, number][];
  const skillScore =
    req.reduce((acc, [skill, level]) => {
      const gap = Math.max(0, level - (skills[skill] ?? 0));
      return acc + (1 - gap / 5);
    }, 0) / req.length;

  return 0.5 * riasecScore + 0.5 * skillScore;
}

export interface RoleFit {
  role: Role;
  score: number; // 0..1
  matchedSkills: SkillId[];
  gapSkills: { skill: SkillId; gap: number }[];
}

export function topFits(riasec: RiasecScores, skills: SkillScores, n = 5): RoleFit[] {
  return ROLES.map((role) => {
    const score = computeFit(riasec, skills, role);
    const matchedSkills: SkillId[] = [];
    const gapSkills: { skill: SkillId; gap: number }[] = [];
    for (const [skill, level] of Object.entries(role.skills) as [SkillId, number][]) {
      const have = skills[skill] ?? 0;
      if (have >= level) matchedSkills.push(skill);
      else gapSkills.push({ skill, gap: level - have });
    }
    return { role, score, matchedSkills, gapSkills };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
