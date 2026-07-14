"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateGoNoGoTrials, type GoNoGoTrial, type GoNoGoStimulus } from "@/lib/games";

const PRACTICE_COUNT = 6;
const MAIN_COUNT = 40;
const RESPONSE_WINDOW_MS = 900;
const ISI_MIN = 1000;
const ISI_MAX = 1500;

type Phase = "intro" | "practice" | "main" | "done";

export default function GoNoGoGame({ onComplete }: { onComplete: (trials: GoNoGoTrial[]) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stimulusType, setStimulusType] = useState<GoNoGoStimulus | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: PRACTICE_COUNT });

  const phaseRef = useRef<Phase>("intro");
  const sequenceRef = useRef<GoNoGoStimulus[]>([]);
  const indexRef = useRef(0);
  const respondedRef = useRef(false);
  const onsetRef = useRef(0);
  const scoredResultsRef = useRef<GoNoGoTrial[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const recordTrial = useCallback((type: GoNoGoStimulus, responded: boolean, rt: number | null) => {
    if (phaseRef.current === "main") {
      scoredResultsRef.current.push({ type, responded, rt, isiMs: 0 });
    }
    setStimulusType(null);
    indexRef.current += 1;
    setProgress({ done: indexRef.current, total: sequenceRef.current.length });

    const isi = ISI_MIN + Math.random() * (ISI_MAX - ISI_MIN);
    const t = setTimeout(() => runNextTrial(), isi);
    timers.current.push(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runNextTrial = useCallback(() => {
    const seq = sequenceRef.current;
    const idx = indexRef.current;

    if (idx >= seq.length) {
      const finishedPractice = phaseRef.current === "practice";
      setStimulusType(null);
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

    const type = seq[idx];
    respondedRef.current = false;
    setStimulusType(type);
    onsetRef.current = performance.now();

    const windowTimer = setTimeout(() => {
      if (!respondedRef.current) {
        recordTrial(type, false, null);
      }
    }, RESPONSE_WINDOW_MS);
    timers.current.push(windowTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordTrial]);

  const handleGoClick = useCallback(() => {
    if (phaseRef.current !== "practice" && phaseRef.current !== "main") return;
    if (respondedRef.current || stimulusType === null) return;
    respondedRef.current = true;
    const rt = performance.now() - onsetRef.current;
    recordTrial(stimulusType, true, rt);
  }, [stimulusType, recordTrial]);

  const beginPractice = () => {
    clearTimers();
    sequenceRef.current = generateGoNoGoTrials(PRACTICE_COUNT);
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
    sequenceRef.current = generateGoNoGoTrials(MAIN_COUNT);
    indexRef.current = 0;
    scoredResultsRef.current = [];
    phaseRef.current = "main";
    setPhase("main");
    setProgress({ done: 0, total: MAIN_COUNT });
    const t = setTimeout(() => runNextTrial(), 800);
    timers.current.push(t);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleGoClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleGoClick]);

  if (phase === "intro") {
    return (
      <div className="card space-y-4">
        <h2 className="font-semibold text-navy">Game 1: Attention Check</h2>
        <p className="text-sm text-gray-700">
          A shape will appear repeatedly. Click <strong>&quot;Go&quot;</strong> (or press spacebar) as fast as
          you can when you see a <span className="text-blue-600 font-medium">blue circle</span>. Do nothing
          when you see a <span className="text-red-600 font-medium">red circle</span>.
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

      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
        {stimulusType === "go" && <div className="w-20 h-20 rounded-full bg-blue-600" />}
        {stimulusType === "nogo" && <div className="w-20 h-20 rounded-full bg-red-600" />}
        {!stimulusType && phase !== "done" && <div className="text-gray-300 text-sm">+</div>}
        {phase === "done" && <div className="text-teal font-medium">Nice work — moving on...</div>}
      </div>

      <button onClick={handleGoClick} disabled={phase === "done"} className="btn-primary w-full text-center">
        Go (or press spacebar)
      </button>

      {phase === "practice" && progress.done === progress.total && (
        <p className="text-xs text-gray-400 text-center">Starting real round...</p>
      )}
    </div>
  );
}
