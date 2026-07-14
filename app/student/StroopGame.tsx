"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  generateStroopTrials,
  STROOP_COLORS,
  STROOP_COLOR_HEX,
  STROOP_COLOR_LABELS,
  type StroopColor,
  type StroopStimulus,
  type StroopTrial,
} from "@/lib/games";

const PRACTICE_COUNT = 4;
const MAIN_COUNT = 20;
const DEADLINE_MS = 2000;

type Phase = "intro" | "practice" | "main" | "done";

export default function StroopGame({ onComplete }: { onComplete: (trials: StroopTrial[]) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState<StroopStimulus | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: PRACTICE_COUNT });

  const phaseRef = useRef<Phase>("intro");
  const sequenceRef = useRef<StroopStimulus[]>([]);
  const indexRef = useRef(0);
  const respondedRef = useRef(false);
  const onsetRef = useRef(0);
  const scoredResultsRef = useRef<StroopTrial[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const recordResponse = useCallback((stim: StroopStimulus, response: StroopColor | null) => {
    const rt = response ? performance.now() - onsetRef.current : null;
    const correct = response === stim.fontColor;
    if (phaseRef.current === "main") {
      scoredResultsRef.current.push({ ...stim, response, rt, correct });
    }
    setCurrent(null);
    indexRef.current += 1;
    setProgress({ done: indexRef.current, total: sequenceRef.current.length });
    const t = setTimeout(() => runNextTrial(), 350);
    timers.current.push(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runNextTrial = useCallback(() => {
    const seq = sequenceRef.current;
    const idx = indexRef.current;

    if (idx >= seq.length) {
      const finishedPractice = phaseRef.current === "practice";
      setCurrent(null);
      const t = setTimeout(() => {
        if (finishedPractice) {
          beginMain();
        } else {
          phaseRef.current = "done";
          setPhase("done");
          onComplete(scoredResultsRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, 600);
      timers.current.push(t);
      return;
    }

    const stim = seq[idx];
    respondedRef.current = false;
    setCurrent(stim);
    onsetRef.current = performance.now();

    const t = setTimeout(() => {
      if (!respondedRef.current) recordResponse(stim, null);
    }, DEADLINE_MS);
    timers.current.push(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordResponse]);

  const handleAnswer = useCallback(
    (color: StroopColor) => {
      if (!current || respondedRef.current) return;
      respondedRef.current = true;
      recordResponse(current, color);
    },
    [current, recordResponse]
  );

  const beginPractice = () => {
    clearTimers();
    sequenceRef.current = generateStroopTrials(PRACTICE_COUNT);
    indexRef.current = 0;
    scoredResultsRef.current = [];
    phaseRef.current = "practice";
    setPhase("practice");
    setProgress({ done: 0, total: PRACTICE_COUNT });
    const t = setTimeout(() => runNextTrial(), 800);
    timers.current.push(t);
  };

  const beginMain = () => {
    clearTimers();
    sequenceRef.current = generateStroopTrials(MAIN_COUNT);
    indexRef.current = 0;
    scoredResultsRef.current = [];
    phaseRef.current = "main";
    setPhase("main");
    setProgress({ done: 0, total: MAIN_COUNT });
    const t = setTimeout(() => runNextTrial(), 800);
    timers.current.push(t);
  };

  if (phase === "intro") {
    return (
      <div className="card space-y-4">
        <h2 className="font-semibold text-navy">Game 2: Focus Check</h2>
        <p className="text-sm text-gray-700">
          A color word will appear. Click the button matching the <strong>font color</strong> of the word —
          ignore what the word says. E.g. if the word &quot;RED&quot; is shown in blue text, click Blue.
        </p>
        <p className="text-xs text-gray-500">
          Short practice round first, then the real one. Takes about 2 minutes.
        </p>
        <button className="btn-primary" onClick={beginPractice}>Start practice round</button>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {phase === "practice" ? "Practice round (not scored)" : phase === "main" ? "Scored round" : "Done"}
        </span>
        <span>{progress.done}/{progress.total}</span>
      </div>

      <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
        {current ? (
          <span className="text-4xl font-bold" style={{ color: STROOP_COLOR_HEX[current.fontColor] }}>
            {STROOP_COLOR_LABELS[current.word]}
          </span>
        ) : phase === "done" ? (
          <span className="text-teal font-medium">Nice work — moving on...</span>
        ) : (
          <span className="text-gray-300 text-sm">+</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {STROOP_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => handleAnswer(c)}
            disabled={phase === "done" || !current}
            className="rounded-md py-3 text-white font-medium text-sm disabled:opacity-40"
            style={{ backgroundColor: STROOP_COLOR_HEX[c] }}
          >
            {STROOP_COLOR_LABELS[c]}
          </button>
        ))}
      </div>
    </div>
  );
}
