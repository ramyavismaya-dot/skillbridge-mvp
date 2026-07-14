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
                        <h1 className="text-2xl font-bold text-navy">Skills &amp; Interest Assessment</h1>h1>
                        <p className="text-gray-600 mt-1 text-sm">
                                  Answer honestly — there are no right answers. Takes about 3 minutes. You&apos;ll get an
                                  AI-generated career report immediately after.
                        </p>p>
                </div>div>
          
                <form action={submitAssessment} className="space-y-8">
                        <div className="card space-y-4">
                                  <h2 className="font-semibold text-navy">About you</h2>h2>
                                  <div className="grid sm:grid-cols-2 gap-4">
                                              <label className="text-sm font-medium text-gray-700">
                                                            Name
                                                            <input name="name" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Jordan Lee" />
                                              </label>label>
                                              <label className="text-sm font-medium text-gray-700">
                                                            Email
                                                            <input name="email" type="email" required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="you@university.edu" />
                                              </label>label>
                                  </div>div>
                        </div>div>
                
                        <div className="card space-y-5">
                                  <h2 className="font-semibold text-navy">Interests</h2>h2>
                          {RIASEC_QUESTIONS.map((q, i) => (
                        <div key={q.id} className="space-y-1">
                                      <p className="text-sm text-gray-800">{i + 1}. {q.text}</p>p>
                                      <select name={q.id} defaultValue={3} className="w-full border rounded-md px-3 py-2 text-sm">
                                        {LIKERT.map((l) => (
                                            <option key={l.v} value={l.v}>{l.label}</option>option>
                                          ))}
                                      </select>select>
                        </div>div>
                      ))}
                        </div>div>
                
                        <div className="card space-y-5">
                                  <h2 className="font-semibold text-navy">Current skill level</h2>h2>
                          {SKILLS.map((s) => (
                        <div key={s} className="space-y-1">
                                      <p className="text-sm text-gray-800">{SKILL_LABELS[s]}</p>p>
                                      <select name={s} defaultValue={2} className="w-full border rounded-md px-3 py-2 text-sm">
                                        {SKILL_LEVELS.map((l) => (
                                            <option key={l.v} value={l.v}>{l.label}</option>option>
                                          ))}
                                      </select>select>
                        </div>div>
                      ))}
                        </div>div>
                
                        <button type="submit" className="btn-primary w-full text-center">
                                  Get My AI Career Report
                        </button>button>
                </form>form>
          </div>div>
        );
}
</div>
