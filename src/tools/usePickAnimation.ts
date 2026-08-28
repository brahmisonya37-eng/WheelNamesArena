import { useCallback, useEffect, useRef, useState } from "react";
import { pick } from "../lib/random";
import { usePrefersReducedMotion } from "../lib/hooks";
import { playCelebration, playTick, unlockAudio } from "../lib/sound";
import { stepDelays, stepsForDuration } from "../lib/timing";

export type PickPhase = "idle" | "rolling" | "done";

/**
 * Slot-machine style reveal: cycles random entries with a decelerating
 * rhythm, then settles on a uniformly random winner.
 * `run(entries, durationMs)` lets each tool follow the user's spin-time setting.
 */
export function usePickAnimation(opts?: { sound?: boolean; onSettle?: (winner: string) => void }) {
  const [display, setDisplay] = useState<string | null>(null);
  const [phase, setPhase] = useState<PickPhase>("idle");
  const timer = useRef(0);
  const reduced = usePrefersReducedMotion();
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const run = useCallback(
    (entries: string[], durationMs = 2400) => {
      if (entries.length === 0) return;
      window.clearTimeout(timer.current);
      if (entries.length === 1) {
        setDisplay(entries[0]);
        setPhase("done");
        optsRef.current?.onSettle?.(entries[0]);
        return;
      }
      if (optsRef.current?.sound) unlockAudio();
      setPhase("rolling");
      const total = reduced ? 5 : stepsForDuration(durationMs);
      const delays = reduced
        ? Array.from({ length: total }, () => 60)
        : stepDelays(total, durationMs);
      let step = 0;
      const tick = () => {
        setDisplay(pick(entries));
        if (optsRef.current?.sound && step % 2 === 0) playTick();
        step++;
        if (step < total) {
          timer.current = window.setTimeout(tick, delays[step] ?? 80);
        } else {
          const winner = pick(entries);
          setDisplay(winner);
          setPhase("done");
          if (optsRef.current?.sound) playCelebration();
          optsRef.current?.onSettle?.(winner);
        }
      };
      tick();
    },
    [reduced],
  );

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setPhase("idle");
    setDisplay(null);
  }, []);

  return { display, phase, run, reset };
}
