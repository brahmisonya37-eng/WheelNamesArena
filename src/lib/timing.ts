/** Shared timing helpers so every tool's reveal can follow the user's spin-time setting. */

export function clampNum(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Global spin-time preference (seconds) shared by all non-wheel tools. */
export const SPIN_TIME_KEY = "da.spinTime";
export const SPIN_TIME_DEFAULT = 3;
export const SPIN_TIME_MIN = 1;
export const SPIN_TIME_MAX = 10;

export function sanitizeSpinTime(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return SPIN_TIME_DEFAULT;
  return clampNum(Math.round(n * 2) / 2, SPIN_TIME_MIN, SPIN_TIME_MAX);
}

/**
 * Build per-step delays (ms) for a decelerating reveal whose total duration
 * is exactly `durationMs`. The rhythm eases out quadratically, matching the
 * classic slot-machine feel, regardless of the chosen length.
 */
export function stepDelays(totalSteps: number, durationMs: number): number[] {
  const n = Math.max(2, totalSteps);
  const raw = Array.from({ length: n }, (_, k) => 40 + Math.pow((k + 1) / n, 2) * 230);
  const sum = raw.reduce((a, b) => a + b, 0);
  const factor = Math.max(0.0001, durationMs) / sum;
  return raw.map((d) => Math.max(16, d * factor));
}

/** Pick a sensible number of reveal steps for a target duration. */
export function stepsForDuration(durationMs: number): number {
  return clampNum(Math.round(durationMs / 130), 8, 46);
}
