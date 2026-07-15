// Response-validity ("anti-faking") checks for the self-report assessment.
//
// This assessment is self-report only. To make it harder to game and easier
// to trust, we don't rely purely on the raw answers: we embed attention-check
// items (must answer a specific value to "pass"), and look at answer variance
// and response timing for signs of low-effort or careless responding
// (straight-lining, rushing through). None of this changes the RIASEC scores
// themselves — it only flags results that should be treated with caution.

export type ResponseValidity = "High" | "Medium" | "Low";

export interface ValidityInput {
  attentionChecksPassed: number;
  attentionChecksTotal: number;
  riasecAnswerVariance: number;
  medianRiasecResponseMs: number | null;
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

  let validity: ResponseValidity = "High";
  if (severe || flags.length >= 2) validity = "Low";
  else if (flags.length === 1) validity = "Medium";

  return { validity, flags };
}
