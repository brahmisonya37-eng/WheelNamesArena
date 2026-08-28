/** Uniform integer in [min, max] inclusive. */
export function randInt(min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/** Random element of a non-empty array. */
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Fisher–Yates shuffle; returns a new array. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sample k unique elements (without replacement). */
export function sampleUnique<T>(arr: readonly T[], k: number): T[] {
  return shuffle(arr).slice(0, Math.max(0, Math.min(k, arr.length)));
}

/** Small unique id. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

/**
 * Split pasted text into clean entries.
 * Primarily newline-delimited. Commas are treated as separators only when
 * the input is a single line (a comma-separated list), so entries like
 * "Smith, John" or "Washington, D.C." survive multi-line pastes intact.
 */
export function parseList(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 1 && lines[0].includes(",")) {
    return lines[0]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return lines;
}

/** Case-insensitive de-duplication that keeps first occurrence. */
export function dedupe(entries: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of entries) {
    const key = e.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(e);
    }
  }
  return out;
}
