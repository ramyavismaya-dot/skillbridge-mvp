// Behavioral/cognitive assessment engine: trial generation, scoring, and
// response-validity checks for the Go/No-Go and Stroop-style games.
//
// See ASSESSMENT_REDESIGN_SPEC.md for the full design rationale. Short version:
// self-rated sliders are easy to inflate; reaction time and accuracy under time
// pressure are not something a student can consciously fake in a favorable
// direction. The scoring constants below (250ms/600ms floor-ceiling, 300ms
// interference ceiling) are illustrative reference ranges, not derived from
// this product's own user data yet — treat all cognitive scores as directional,
// not certified, until a real pilot cohort's data replaces them (Phase 2/3 of
// the spec).

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Game 1: Go/No-Go (sustained attention, impulse control, processing speed)
// ---------------------------------------------------------------------------

export type GoNoGoStimulus = "go" | "nogo";

export interface GoNoGoTrial {
  type: GoNoGoStimulus;
  responded: boolean;
  rt: number | null; // ms via performance.now(), null if no response
  isiMs: number; // inter-stimulus interval before this trial (informational)
}

/** 80% go / 20% no-go, shuffled. */
export function generateGoNoGoTrials(count = 40): GoNoGoStimulus[] {
  const nGo = Math.round(count * 0.8);
  const nNoGo = count - nGo;
  const seq: GoNoGoStimulus[] = [...Array(nGo).fill("go"), ...Array(nNoGo).fill("nogo")];
  return shuffle(seq);
}

export interface GoNoGoResult {
  meanGoRT: number;
  rtVariability: number; // SD of correct Go RTs
  commissionErrorRate: number; // clicked on a No-Go trial (impulsivity)
  omissionErrorRate: number; // missed a Go trial (inattention/fatigue)
  trialsCompleted: number;
}

export function scoreGoNoGo(trials: GoNoGoTrial[]): GoNoGoResult {
  const goTrials = trials.filter((t) => t.type === "go");
  const noGoTrials = trials.filter((t) => t.type === "nogo");
  const correctGoRTs = goTrials.filter((t) => t.responded && t.rt != null).map((t) => t.rt as number);

  const meanGoRT = correctGoRTs.length ? correctGoRTs.reduce((a, b) => a + b, 0) / correctGoRTs.length : 0;
  const variance = correctGoRTs.length
    ? correctGoRTs.reduce((acc, rt) => acc + (rt - meanGoRT) ** 2, 0) / correctGoRTs.length
    : 0;

  const commissionErrors = noGoTrials.filter((t) => t.responded).length;
  const omissionErrors = goTrials.filter((t) => !t.responded).length;

  return {
    meanGoRT,
    rtVariability: Math.sqrt(variance),
    commissionErrorRate: noGoTrials.length ? commissionErrors / noGoTrials.length : 0,
    omissionErrorRate: goTrials.length ? omissionErrors / goTrials.length : 0,
    trialsCompleted: trials.length,
  };
}

// ---------------------------------------------------------------------------
// Game 2: Stroop-style focus task (cognitive control under interference)
// ---------------------------------------------------------------------------

export const STROOP_COLORS = ["red", "blue", "green", "yellow"] as const;
export type StroopColor = (typeof STROOP_COLORS)[number];

export const STROOP_COLOR_HEX: Record<StroopColor, string> = {
  red: "#DC2626",
  blue: "#2563EB",
  green: "#16A34A",
  yellow: "#CA8A04",
};

export const STROOP_COLOR_LABELS: Record<StroopColor, string> = {
  red: "RED",
  blue: "BLUE",
  green: "GREEN",
  yellow: "YELLOW",
};

export interface StroopStimulus {
  word: StroopColor;
  fontColor: StroopColor;
  congruent: boolean;
}

/** ~50/50 congruent/incongruent, shuffled. */
export function generateStroopTrials(count = 20): StroopStimulus[] {
  const half = Math.round(count / 2);
  const stimuli: StroopStimulus[] = [];

  for (let i = 0; i < half; i++) {
    const word = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    stimuli.push({ word, fontColor: word, congruent: true });
  }
  for (let i = 0; i < count - half; i++) {
    const word = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    let fontColor = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    while (fontColor === word) {
      fontColor = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    }
    stimuli.push({ word, fontColor, congruent: false });
  }

  return shuffle(stimuli);
}

export interface StroopTrial extends StroopStimulus {
  response: StroopColor | null;
  rt: number | null;
  correct: boolean;
}

export interface StroopResult {
  accuracyOverall: number;
  accuracyIncongruent: number;
  accuracyCongruent: number;
  interferenceEffect: number; // ms, incongruent RT - congruent RT
  trialsCompleted: number;
}

export function scoreStroop(trials: StroopTrial[]): StroopResult {
  const congruent = trials.filter((t) => t.congruent);
  const incongruent = trials.filter((t) => !t.congruent);

  const acc = (arr: StroopTrial[]) => (arr.length ? arr.filter((t) => t.correct).length / arr.length : 0);
  const meanRT = (arr: StroopTrial[]) => {
    const rts = arr.filter((t) => t.correct && t.rt != null).map((t) => t.rt as number);
    return rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
  };

  const congruentRT = meanRT(congruent);
  const incongruentRT = meanRT(incongruent);

  return {
    accuracyOverall: acc(trials),
    accuracyIncongruent: acc(incongruent),
    accuracyCongruent: acc(congruent),
    interferenceEffect: congruentRT && incongruentRT ? incongruentRT - congruentRT : 0,
    trialsCompleted: trials.length,
  };
}

// ---------------------------------------------------------------------------
// Cognitive profile — normalized 0..1, derived from the two games above
// ---------------------------------------------------------------------------

export interface CognitiveScores {
  processingSpeed: number;
  sustainedAttention: number;
  impulseControl: number;
  cognitiveControl: number;
}

export function computeCognitiveProfile(goNoGo: GoNoGoResult, stroop: StroopResult): CognitiveScores {
  const processingSpeed = goNoGo.meanGoRT ? clamp01(1 - (goNoGo.meanGoRT - 250) / (600 - 250)) : 0.5;
  const sustainedAttention = clamp01(1 - goNoGo.omissionErrorRate);
  const impulseControl = clamp01(1 - goNoGo.commissionErrorRate);
  const cognitiveControl = stroop.interferenceEffect ? clamp01(1 - stroop.interferenceEffect / 300) : 0.5;

  return { processingSpeed, sustainedAttention, impulseControl, cognitiveControl };
}

// ---------------------------------------------------------------------------
// Response validity — the anti-faking layer
// ---------------------------------------------------------------------------

export type ResponseValidity = "High" | "Medium" | "Low";

export interface ValidityInput {
  attentionChecksPassed: number;
  attentionChecksTotal: number;
  riasecAnswerVariance: number;
  medianRiasecResponseMs: number | null;
  goNoGo: GoNoGoResult;
  stroop: StroopResult;
}

export function computeResponseValidity(input: ValidityInput): { validity: ResponseValidity; flags: string[] } {
  const flags: string[] = [];
  let severe = false;

  if (input.attentionChecksTotal > 0 && input.attentionChecksPassed < input.attentionChecksTotal) {
    flags.push("Failed an embedded attention-check item");
    severe = true;
  }
  if (input.riasecAnswerVariance < 0.15) {
    flags.push("Very low variance across interest answers (possible straight-lining)");
  }
  if (input.medianRiasecResponseMs != null && input.medianRiasecResponseMs < 600) {
    flags.push("Median response time on interest questions was under 600ms");
  }
  if (input.goNoGo.omissionErrorRate > 0.3) {
    flags.push("High miss rate on the attention game (over 30% of Go trials)");
  }
  const stroopChanceAccuracy = 0.25; // 4-choice task
  if (input.stroop.accuracyOverall <= stroopChanceAccuracy + 0.1) {
    flags.push("Focus game accuracy near chance level — likely low effort, not low ability");
    severe = true;
  }

  let validity: ResponseValidity = "High";
  if (severe || flags.length >= 2) validity = "Low";
  else if (flags.length === 1) validity = "Medium";

  return { validity, flags };
}
