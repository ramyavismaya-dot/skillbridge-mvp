import Anthropic from "@anthropic-ai/sdk";
import type { RiasecScores, SkillScores, RoleFit } from "./riasec";
import { RIASEC_LABELS, topRiasecCodes } from "./riasec";

// AI narrative layer with a safe fallback.
//
// If ANTHROPIC_API_KEY is set, this calls Claude to write a short, natural
// -language summary. If it isn't set (the app's default, out-of-the-box
// state), it falls back to a deterministic, rule-based sentence built from
// the same data -- so the app is fully functional with zero configuration,
// and gets noticeably better the moment you add a key.

function client(): Anthropic | null {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    return new Anthropic({ apiKey: key });
}

async function callClaude(prompt: string, fallback: string): Promise<string> {
    const c = client();
    if (!c) return fallback;
    try {
          const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";
          const res = await c.messages.create({
                  model,
                  max_tokens: 220,
                  messages: [{ role: "user", content: prompt }],
          });
          const block = res.content.find((b) => b.type === "text");
          const text = block && "text" in block ? block.text.trim() : "";
          return text || fallback;
    } catch (err) {
          console.error("Claude call failed, using fallback narrative:", err);
          return fallback;
    }
}

export async function generateReportNarrative(
    name: string,
    riasec: RiasecScores,
    fits: RoleFit[]
  ): Promise<string> {
    const top = topRiasecCodes(riasec, 2).map((c) => RIASEC_LABELS[c]);
    const topRole = fits[0]?.role.title ?? "several roles";
    const fallback = `${name}, your strongest interest areas are ${top.join(" and ")}. Based on your assessment, your top career fit right now is ${topRole} (${Math.round(
          (fits[0]?.score ?? 0) * 100
        )}% match). Closing a few skill gaps below will strengthen that match further.`;

  const prompt = `You are a career advisor writing a short, encouraging, specific 3-sentence summary for a student named ${name}.
  Their top interest areas (Holland/RIASEC) are: ${top.join(", ")}.
  Their top 3 career fits are: ${fits
                                     .slice(0, 3)
                                     .map((f) => `${f.role.title} (${Math.round(f.score * 100)}% match)`)
                                     .join(", ")}.
                                     Write directly to the student in second person, plain language, no headers, no bullet points, max 70 words.`;

  return callClaude(prompt, fallback);
}

export async function generateMatchNarrative(
    studentName: string,
    jobTitle: string,
    score: number,
    matchedSkills: string[],
    gapSkills: string[]
  ): Promise<string> {
    const fallback = `${studentName} is a ${Math.round(score * 100)}% fit for ${jobTitle}, strong on ${
          matchedSkills.join(", ") || "core interest alignment"
    }${gapSkills.length ? `, with room to grow in ${gapSkills.join(", ")}` : ""}.`;

  const prompt = `Write one short sentence (max 30 words) for a recruiter explaining why candidate ${studentName} is a ${Math.round(
        score * 100
      )}% match for the role "${jobTitle}". They are strong on: ${matchedSkills.join(", ") || "interest fit"}. They have gaps in: ${
        gapSkills.join(", ") || "none notable"
  }. Plain language, no preamble.`;

  return callClaude(prompt, fallback);
}

export function aiEnabled(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
}
