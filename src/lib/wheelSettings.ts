/**
 * Wheel settings model: spin, sound, appearance, results and randomization.
 * Persisted to localStorage; independent of the site-wide settings used by
 * the smaller tools.
 */

export type SoundStyle = "classic" | "arcade" | "gameshow" | "soft" | "celebration";
export type WheelThemeName = "default" | "neon" | "dark" | "classroom" | "gaming" | "party" | "minimal" | "pastel";
export type ProbabilityMode = "equal" | "weighted";

/** Custom images (compressed data URLs) for the wheel. */
export interface WheelImages {
  center: string | null; // logo shown in the hub, behind the SPIN button (static)
  inset: string | null; // image embedded in the wheel disc — rotates with the wheel
  background: string | null; // image behind the wheel on the stage
  pointer: string | null; // image replacing the pointer flap at the entrance
}

export interface WheelSettings {
  /* Spin */
  spinDuration: number; // seconds, 1–60
  countdown: 0 | 3 | 5 | 10;
  lockWhileSpinning: boolean;
  preventDoubleSpin: boolean;

  /* Sound */
  soundOn: boolean; // master
  spinSound: boolean;
  winnerSound: boolean;
  countdownSound: boolean;
  volume: number; // 0–100
  soundStyle: SoundStyle;

  /* Appearance */
  theme: WheelThemeName;
  palette: string[] | null; // custom wheel colors override
  backgroundColor: string | null; // stage panel behind the wheel ("" = none)
  textColor: string | null; // null = auto-contrast per segment
  pointerColor: string | null;
  hubColor: string | null; // center button
  textSize: number; // percent, 60–160
  borderWidth: number; // 0–8
  segmentGap: number; // degrees, 0–5

  /* Results */
  removeWinnerAfterSpin: boolean; // false = keep winner
  showWinnerPopup: boolean;
  showHistory: boolean;
  confetti: boolean;
  autoContinue: boolean;
  excludePreviousWinners: boolean;

  /* Randomization */
  probability: ProbabilityMode;
  preventImmediateRepeat: boolean;

  /* Images */
  images: WheelImages;
}

export const DEFAULT_WHEEL_SETTINGS: WheelSettings = {
  spinDuration: 6,
  countdown: 0,
  lockWhileSpinning: true,
  preventDoubleSpin: true,

  soundOn: true,
  spinSound: true,
  winnerSound: true,
  countdownSound: true,
  volume: 80,
  soundStyle: "classic",

  theme: "default",
  palette: null,
  backgroundColor: null,
  textColor: null,
  pointerColor: null,
  hubColor: null,
  textSize: 100,
  borderWidth: 2.5,
  segmentGap: 0,

  removeWinnerAfterSpin: false,
  showWinnerPopup: true,
  showHistory: true,
  confetti: true,
  autoContinue: false,
  excludePreviousWinners: false,

  probability: "equal",
  preventImmediateRepeat: false,

  images: { center: null, inset: null, background: null, pointer: null },
};

/* --------------------------------- Themes ---------------------------------- */

export interface WheelTheme {
  label: string;
  palette: string[];
  background: string | null;
  pointer: string;
  hub: string;
}

export const WHEEL_THEME_DEFS: Record<WheelThemeName, WheelTheme> = {
  default: {
    label: "Default",
    palette: ["#6d4aff", "#ff6b5e", "#ffb020", "#2dd4a7", "#38bdf8", "#f472b6", "#a78bfa", "#34d399", "#fb923c", "#60a5fa"],
    background: null,
    pointer: "#ff6b5e",
    hub: "#14121f",
  },
  neon: {
    label: "Neon",
    palette: ["#ff2d78", "#00e5ff", "#b6ff2e", "#ff9f1c", "#9d4edd", "#2eff71", "#ff5c4d", "#00b4ff"],
    background: "#14121f",
    pointer: "#00e5ff",
    hub: "#221d3d",
  },
  dark: {
    label: "Dark",
    palette: ["#3d3856", "#6d4aff", "#8f89a8", "#ff6b5e", "#2a2544", "#ffb020", "#4a4462", "#2dd4a7"],
    background: "#1c1930",
    pointer: "#ffb020",
    hub: "#14121f",
  },
  classroom: {
    label: "Classroom",
    palette: ["#2dd4a7", "#38bdf8", "#ffb020", "#ff6b5e", "#6d4aff", "#a3e635", "#f472b6", "#fb923c"],
    background: null,
    pointer: "#2dd4a7",
    hub: "#14121f",
  },
  gaming: {
    label: "Gaming",
    palette: ["#7c3aed", "#06b6d4", "#f43f5e", "#84cc16", "#f59e0b", "#3b82f6", "#ec4899", "#10b981"],
    background: "#14121f",
    pointer: "#f43f5e",
    hub: "#221d3d",
  },
  party: {
    label: "Party",
    palette: ["#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#f87171", "#c084fc", "#fb923c", "#4ade80"],
    background: null,
    pointer: "#f472b6",
    hub: "#14121f",
  },
  minimal: {
    label: "Minimal",
    palette: ["#1c1930", "#3d3856", "#6b6584", "#8f89a8", "#4a4462", "#2a2544"],
    background: null,
    pointer: "#14121f",
    hub: "#14121f",
  },
  pastel: {
    label: "Pastel",
    palette: ["#c3b8ff", "#ffc6bf", "#ffe3a3", "#b8ecd8", "#bfe3ff", "#ffd6ec", "#e3d9ff", "#c9f2e3"],
    background: null,
    pointer: "#b3a0ff",
    hub: "#3d3856",
  },
};

export const THEME_ORDER: WheelThemeName[] = ["default", "neon", "dark", "classroom", "gaming", "party", "minimal", "pastel"];

/** Resolve effective appearance tokens from settings (theme + overrides). */
export function resolveAppearance(ws: WheelSettings) {
  const theme = WHEEL_THEME_DEFS[ws.theme] ?? WHEEL_THEME_DEFS.default;
  return {
    palette: ws.palette ?? theme.palette,
    background: ws.backgroundColor !== null ? ws.backgroundColor : theme.background,
    textColor: ws.textColor,
    pointerColor: ws.pointerColor ?? theme.pointer,
    hubColor: ws.hubColor ?? theme.hub,
    textSize: ws.textSize,
    borderWidth: ws.borderWidth,
    segmentGap: ws.segmentGap,
  };
}

/* ------------------------------- Persistence ------------------------------- */

const KEY = "da.wheelSettings.v2";

export function loadWheelSettings(): WheelSettings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_WHEEL_SETTINGS, images: { ...DEFAULT_WHEEL_SETTINGS.images } };
    const parsed = JSON.parse(raw) as Partial<WheelSettings>;
    return {
      ...DEFAULT_WHEEL_SETTINGS,
      ...parsed,
      images: { ...DEFAULT_WHEEL_SETTINGS.images, ...(parsed.images ?? {}) },
    };
  } catch {
    return { ...DEFAULT_WHEEL_SETTINGS, images: { ...DEFAULT_WHEEL_SETTINGS.images } };
  }
}

/** Returns false when persistence fails (e.g. storage quota exceeded). */
export function saveWheelSettings(ws: WheelSettings): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ws));
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------- Geometry --------------------------------- */

export interface SegmentGeometry {
  start: number;
  end: number;
}

/**
 * Compute segment angles proportional to weights, with an optional visual gap.
 * Returns segment arcs plus `bounds` — cumulative end angles used for
 * pointer/winner detection (gap belongs to the preceding segment's span).
 */
export function computeGeometry(weights: number[], gapDeg: number): { segs: SegmentGeometry[]; bounds: number[] } {
  const n = weights.length;
  if (n === 0) return { segs: [], bounds: [] };
  const safe = weights.map((w) => Math.max(0.0001, w));
  const total = safe.reduce((a, b) => a + b, 0);
  const angles = safe.map((w) => (w / total) * 360);
  const minAngle = Math.min(...angles);
  const gap = n > 1 ? Math.max(0, Math.min(gapDeg, minAngle * 0.4)) : 0;
  const segs: SegmentGeometry[] = [];
  const bounds: number[] = [];
  let cursor = 0;
  for (const a of angles) {
    segs.push({ start: cursor + gap / 2, end: cursor + a - gap / 2 });
    cursor += a;
    bounds.push(cursor);
  }
  return { segs, bounds };
}

/** Which segment is under the pointer (top) for a given clockwise rotation. */
export function segmentAtRotation(bounds: number[], rotation: number): number {
  if (bounds.length === 0) return -1;
  const norm = ((rotation % 360) + 360) % 360;
  const local = (360 - norm) % 360;
  for (let i = 0; i < bounds.length; i++) {
    if (local < bounds[i]) return i;
  }
  return bounds.length - 1;
}
