import fs from "fs";
import path from "path";
import type { RiasecScores, SkillScores } from "./riasec";
import type { ResponseValidity } from "./games";

// --- Simple JSON-file persistence -------------------------------------
// This is intentionally the simplest possible storage for an MVP demo:
// no external database, no native modules, works out of the box.
//
// IMPORTANT (read before deploying anywhere real):
// - This only works on a single long-running process with a writable
//   filesystem (e.g. `npm run start` on a VM). It will NOT work on
//   serverless/edge platforms (Vercel, etc.) where the filesystem is
//   read-only or ephemeral between invocations.
// - Before real users touch this, replace lib/db.ts with a real database
//   (Postgres via Supabase/Neon, etc.) behind the same function signatures
//   below — every page/action in this app only talks to this file.

export interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  riasec: RiasecScores;
  skills: SkillScores; // self-reported
  responseValidity: ResponseValidity;
  validityFlags: string[];
  narrative: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  roleId: string;
  riasec: [string, string];
  skills: SkillScores;
  createdAt: string;
}

interface DBShape {
  students: Student[];
  jobs: Job[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDB(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const empty: DBShape = { students: [], jobs: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2));
  }
}

function readDB(): DBShape {
  ensureDB();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw) as DBShape;
  } catch {
    return { students: [], jobs: [] };
  }
}

function writeDB(db: DBShape): void {
  ensureDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getStudents(): Student[] {
  return readDB().students.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getStudent(id: string): Student | undefined {
  return readDB().students.find((s) => s.id === id);
}

export function addStudent(data: Omit<Student, "id" | "createdAt">): Student {
  const db = readDB();
  const student: Student = { ...data, id: newId(), createdAt: new Date().toISOString() };
  db.students.push(student);
  writeDB(db);
  return student;
}

export function getJobs(): Job[] {
  return readDB().jobs.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getJob(id: string): Job | undefined {
  return readDB().jobs.find((j) => j.id === id);
}

export function addJob(data: Omit<Job, "id" | "createdAt">): Job {
  const db = readDB();
  const job: Job = { ...data, id: newId(), createdAt: new Date().toISOString() };
  db.jobs.push(job);
  writeDB(db);
  return job;
}
