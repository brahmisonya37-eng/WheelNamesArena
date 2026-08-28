export const WHEEL_THEMES: Record<string, string[]> = {
  classic: ["#6d4aff", "#ff6b5e", "#ffb020", "#2dd4a7", "#38bdf8", "#f472b6", "#a78bfa", "#34d399", "#fb923c", "#60a5fa"],
  neon: ["#ff2d78", "#00e5ff", "#b6ff2e", "#ff9f1c", "#9d4edd", "#2eff71", "#ff5c4d", "#00b4ff"],
  pastel: ["#c3b8ff", "#ffc6bf", "#ffe3a3", "#b8ecd8", "#bfe3ff", "#ffd6ec", "#e3d9ff", "#c9f2e3"],
  sunset: ["#ff5e5b", "#ff9f68", "#ffcf5c", "#d1495b", "#8c4a6b", "#6d3b8e", "#ff7b54", "#e8590c"],
  mono: ["#1c1930", "#3d3856", "#6b6584", "#8f89a8", "#4a4462", "#2a2540"],
};

export const THEME_NAMES = Object.keys(WHEEL_THEMES);

export function paletteFor(theme: string): string[] {
  return WHEEL_THEMES[theme] ?? WHEEL_THEMES.classic;
}

/** Perceived luminance → readable text color for a hex background. */
export function textColorFor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1c1930" : "#ffffff";
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
