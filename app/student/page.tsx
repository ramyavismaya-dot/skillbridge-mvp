"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RIASEC_QUESTIONS,
  ATTENTION_CHECK_QUESTIONS,
  SKILLS,
  SKILL_LABELS,
  type SkillScores,
} from "@/lib/riasec";
import type { GoNoGoTrial, StroopTrial } from "@/lib/games";
import { submitAssessment } from "@/app/actions";
import GoNoGoGame from "./GoNoGoGame";
import StroopGame from "./StroopGame";

const LIKERT = [
  { v: 1, label: "Strongly disagree" },
  { v: 2, label: "Disagree" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Agree" },
  { v: 5, label: "Strongly agree" },
];

const SKILL_LEVELS = [
  { v: 0, label: "No experience" },
  { v: 1, label: "Beginner" },
  { v: 2, label: "Basic" },
  { v: 3, label: "Intermediate" },
  { v: 4, label: "Advanced" },
  { v: 5, label: "Expert" },
];

type Step = "intro" | "interests" | "gonogo" | "stroop" | "skills" | "submitting";

interface MixedQuestion {
  id: string;
  text: string;
  isAttentionCheck: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StudentAssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [riasecAnswers, setRiasecAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(RIASEC_QUESTIONS.map((q) => [q.id, 3]))
  );
  const [attentionAnswers, setAttentionAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(ATTENTION_CHECK_QUESTIONS.map((q) => [q.id, 3]))
  );
  const [skills, setSkills] = useState<SkillScores>(
    () => Object.fromEntries(SKILLS.map((s) => [s, 0])) as SkillScores
  );
  const [error, setError] = useState<string | null>(null);

  const responseTimesRef = useRef<number[]>([]);
  const lastAnswerTimeRef = useRef<number>(0);
  const goNoGoTrialsRef = useRef<GoNoGoTrial[]>([]);
  const stroopTrialsRef = useRef<StroopTrial[]>([]);

  const mixedQuestions = useMemo<MixedQuestion[]>(() => {
    const riasecQs: MixedQuestion[] = RIASEC_QUESTIONS.map((q) => ({
      id: q.id,
      text: q.text,
      isAttentionCheck: false,
    }));
    const attnQs: MixedQuestion[] = ATTENTION_CHECK_QUESTIONS.map((q) => ({
      id: q.id,
      text: q.text,
      isAttentionCheck: true,
    }));
    const combined = shuffle(riasecQs);
    const pos1 = 4 + Math.floor(Math.random() * 3);
    const pos2 = 8 + Math.floor(Math.random() * 3);
    combined.splice(pos1, 0, attnQs[0]);
    combined.splice(Math.min(pos2 + 1, combined.length), 0, attnQs[1]);
    return combined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerChange = (id: string, value: number, isAttentionCheck: boolean) => {
    const now = performance.now();
    if (!isAttentionCheck) {
      if (lastAnswerTimeRef.current) {
        responseTimesRef.current.push(now - lastAnswerTimeRef.current);
      }
      lastAnswerTimeRef.current = now;
      setRiasecAnswers((prev) => ({ ...prev, [id]: value }));
    } else {
      setAttentionAnswers((prev) => ({ ...prev, [id]: value }));
    }
  };

  const startInterests = () => {
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setError(null);
    lastAnswerTimeRef.current = performance.now();
    setStep("interests");
  };

  const handleSubmit = async () => {
    setStep("submitting");
    try {
      const { studentId } = await submitAssessment({
        name,
        email,
        riasecAnswers,
        attentionCheckAnswers: attentionAnswers,
        riasecResponseTimesMs: responseTimesRef.current,
        skills,
        goNoGoTrials: goNoGoTrialsRef.current,
        stroopTrials: stroopTrialsRef.current,
      });
      router.push(`/student/report/${studentId}`);
    } catch {
      setError("Something went wrong submitting your assessment. Please try again.");
      setStep("skills");
    }
  };

  if (step === "intro") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Skills &amp; Interest Assessment</h1>
          <p className="text-gray-600 mt-1 text-sm">
            About 8-9 minutes. This includes interest questions plus two short reaction/focus games —
            the games measure things self-ratings can&apos;t (attention, impulse control, focus under
            pressure), so your report rests on more than just what you say about yourself.
          </p>
        </div>
        <div className="card space-y-4">
          <h2 className="font-semibold text-navy">About you</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2"
                placeholder="Jordan Lee"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-1 w-full border rounded-md px-3 py-2"
                placeholder="you@university.edu"
              />
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full text-center" onClick={startInterests}>
            Start assessment
          </button>
        </div>
      </div>
    );
  }

  if (step === "interests") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card space-y-5">
          <div>
            <h2 className="font-semibold text-navy">Interests</h2>
            <p className="text-xs text-gray-500 mt-1">
              Answer honestly — there are no right answers. A couple of items ask you to confirm
              you&apos;re reading carefully.
            </p>
          </div>
          {mixedQuestions.map((q, i) => (
            <div
              key={q.id}
              className={`space-y-1 ${q.isAttentionCheck ? "bg-amber-50 border border-amber-200 rounded-md p-3" : ""}`}
            >
              <p className="text-sm text-gray-800">{i + 1}. {q.text}</p>
              <select
                defaultValue={3}
                onChange={(e) => handleAnswerChange(q.id, Number(e.target.value), q.isAttentionCheck)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {LIKERT.map((l) => (
                  <option key={l.v} value={l.v}>{l.label}</option>
                ))}
              </select>
            </div>
          ))}
          <button className="btn-primary w-full text-center" onClick={() => setStep("gonogo")}>
            Continue to Game 1
          </button>
        </div>
      </div>
    );
  }

  if (step === "gonogo") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <GoNoGoGame
          onComplete={(trials) => {
            goNoGoTrialsRef.current = trials;
            setStep("stroop");
          }}
        />
      </div>
    );
  }

  if (step === "stroop") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <StroopGame
          onComplete={(trials) => {
            stroopTrialsRef.current = trials;
            setStep("skills");
          }}
        />
      </div>
    );
  }

  if (step === "skills") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card space-y-5">
          <div>
            <h2 className="font-semibold text-navy">Current skill level (self-reported)</h2>
            <p className="text-xs text-gray-500 mt-1">
              Last step. These are self-rated — shown next to your game-based cognitive scores in the
              report, not instead of them.
            </p>
          </div>
          {SKILLS.map((s) => (
            <div key={s} className="space-y-1">
              <p className="text-sm text-gray-800">{SKILL_LABELS[s]}</p>
              <select
                defaultValue={0}
                onChange={(e) => setSkills((prev) => ({ ...prev, [s]: Number(e.target.value) }))}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {SKILL_LEVELS.map((l) => (
                  <option key={l.v} value={l.v}>{l.label}</option>
                ))}
              </select>
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full text-center" onClick={handleSubmit}>
            Get My AI Career Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center py-16">
      <p className="text-gray-600">Scoring your assessment...</p>
    </div>
  );
}
import { submitAssessment } from "@/app/actions";
import { RIASEC_QUESTIONS, SKILLS, SKILL_LABELS } from "@/lib/riasec";

const LIKERT = [
  { v: 1, label: "Strongly disagree" },
  { v: 2, label: "Disagree" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Agree" },
  { v: 5, label: "Strongly agree" },
];

const SKILL_LEVELS = [
  { v: 0, label: "No experience" },
  { v: 1, label: "Beginner" },
  { v: 2, label: "Basic" },
  { v: 3, label: "Intermediate" },
  { v: 4, label: "Advanced" },
  { v: 5, label: "Expert" },
];

export default function StudentAssessmentPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Skills &amp; Interest Assessment</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Answer honestly — there are no right answers. Takes about 3 minutes. You&apos;ll get an
          AI-generated career report immediately after.
        </p>
      </div>

      <form action={submitAssessment} className="space-y-8">
        <div className="card space-y-4">
          <h2 className="font-semibold text-navy">About you</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Name
              <input name="name" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Jordan Lee" />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Email
              <input name="email" type="email" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="you@university.edu" />
            </label>
          </div>
        </div>

        <div className="card space-y-5">
          <h2 className="font-semibold text-navy">Interests</h2>
          {RIASEC_QUESTIONS.map((q, i) => (
            <div key={q.id} className="space-y-1">
              <p className="text-sm text-gray-800">{i + 1}. {q.text}</p>
              <select name={q.id} defaultValue={3} className="w-full border rounded-md px-3 py-2 text-sm">
                {LIKERT.map((l) => (
                  <option key={l.v} value={l.v}>{l.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="card space-y-5">
          <h2 className="font-semibold text-navy">Current skill level</h2>
          {SKILLS.map((s) => (
            <div key={s} className="space-y-1">
              <p className="text-sm text-gray-800">{SKILL_LABELS[s]}</p>
              <select name={s} defaultValue={2} className="w-full border rounded-md px-3 py-2 text-sm">
                {SKILL_LEVELS.map((l) => (
                  <option key={l.v} value={l.v}>{l.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button type="submit" className="btn-primary w-full text-center">
          Get My AI Career Report
        </button>
      </form>
    </div>
  );
}
