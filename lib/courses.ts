import { SKILL_LABELS, type SkillId } from "./riasec";

// Mock training catalog. In production, replace with a real content
// partner's API (Coursera for Business, Udemy Business, an in-house LMS)
// so "enroll" actually enrolls the student somewhere.
export interface Course {
    title: string;
    provider: string;
    hours: number;
}

export const COURSE_CATALOG: Record<SkillId, Course[]> = {
    communication: [
      { title: "Effective Business Communication", provider: "Partner Content Library", hours: 6 },
      { title: "Public Speaking Fundamentals", provider: "Partner Content Library", hours: 4 },
        ],
    analytical: [
      { title: "Data Analysis with Spreadsheets & Python", provider: "Partner Content Library", hours: 10 },
      { title: "Statistics for Decision Making", provider: "Partner Content Library", hours: 8 },
        ],
    coding: [
      { title: "Intro to Programming with Python", provider: "Partner Content Library", hours: 12 },
      { title: "Web Development Foundations", provider: "Partner Content Library", hours: 14 },
        ],
    design: [
      { title: "UI/UX Design Fundamentals", provider: "Partner Content Library", hours: 8 },
      { title: "Graphic Design Principles", provider: "Partner Content Library", hours: 6 },
        ],
    leadership: [
      { title: "Leadership Essentials", provider: "Partner Content Library", hours: 6 },
      { title: "Project Management Basics", provider: "Partner Content Library", hours: 8 },
        ],
    writing: [
      { title: "Business Writing Skills", provider: "Partner Content Library", hours: 5 },
      { title: "Content Writing Masterclass", provider: "Partner Content Library", hours: 7 },
        ],
};

export interface RoadmapItem {
    skill: SkillId;
    skillLabel: string;
    gap: number;
    courses: Course[];
}

export function buildRoadmap(gapSkills: { skill: SkillId; gap: number }[]): RoadmapItem[] {
    return gapSkills
      .slice()
      .sort((a, b) => b.gap - a.gap)
      .map(({ skill, gap }) => ({
              skill,
              skillLabel: SKILL_LABELS[skill],
              gap,
              courses: COURSE_CATALOG[skill],
      }));
}
