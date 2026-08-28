import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../lib/hooks";
import { segmentAtRotation } from "../../lib/wheelSettings";

/** Equal-division winner detection (kept for compatibility & tests). */
export function winnerIndexAt(rotation: number, count: number): number {
  if (count <= 0) return -1;
  const bounds = Array.from({ length: count }, (_, i) => ((i + 1) * 360) / count);
  return segmentAtRotation(bounds, rotation);
}

export interface SpinHandle {
  rotation: number;
  spinning: boolean;
  /**
   * Spin and land on a uniformly random angle. `bounds` are cumulative
   * segment end angles (weighted-aware); winner = segment under the pointer.
   */
  spin: (bounds: number[], onDone: (index: number) => void, durationMs?: number) => void;
}

/**
 * Wheel spin physics: rAF-driven rotation with a long ease-out tail.
 * onTick fires whenever the pointer crosses into a new segment.
 */
export function useWheelSpin(onTick?: () => void): SpinHandle {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const rotationRef = useRef(0);
  const spinningRef = useRef(false);
  const rafRef = useRef(0);
  const tickRef = useRef(onTick);
  tickRef.current = onTick;
  const reduced = usePrefersReducedMotion();

  const spin = useCallback(
    (bounds: number[], onDone: (index: number) => void, durationMs?: number) => {
      if (bounds.length < 2 || spinningRef.current) return;
      spinningRef.current = true;
      setSpinning(true);

      const from = rotationRef.current;
      const seconds = Math.max(0.5, (durationMs ?? 6000) / 1000);
      const turns = reduced ? 1 : Math.max(3, Math.min(60, Math.round(seconds * 1.6)));
      const target = from + turns * 360 + Math.random() * 360;
      const duration = reduced ? 700 : durationMs ?? 6000;
      const start = performance.now();
      let lastIdx = segmentAtRotation(bounds, from);

      const ease = (t: number) => 1 - Math.pow(1 - t, 5);

      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const r = from + (target - from) * ease(t);
        rotationRef.current = r;
        setRotation(r);
        const idx = segmentAtRotation(bounds, r);
        if (idx !== lastIdx) {
          lastIdx = idx;
          tickRef.current?.();
        }
        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          spinningRef.current = false;
          setSpinning(false);
          // Normalize rotation to [0, 360) so long sessions never accumulate
          // huge degree values (same rendered angle — no visual jump).
          const norm = ((target % 360) + 360) % 360;
          rotationRef.current = norm;
          setRotation(norm);
          onDone(segmentAtRotation(bounds, norm));
        }
      };
      rafRef.current = requestAnimationFrame(frame);
    },
    [reduced],
  );

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { rotation, spinning, spin };
}
