import { uid } from "./random";

export interface EntryItem {
  text: string;
  weight: number;
  /** Optional participant photo (compressed data URL). */
  photo?: string | null;
  /** Optional emoji icon (used when no photo is set). */
  icon?: string | null;
  /** Optional segment color override. */
  color?: string | null;
}

export interface SavedWheel {
  id: string;
  name: string;
  entries: string[];
  /** Full entries (weights + photos) for wheels saved after the upgrade. */
  items?: EntryItem[];
  updatedAt: number;
}

export interface HistoryEntry {
  name: string;
  at: number;
}

export interface Settings {
  sound: boolean;
  confetti: boolean;
  theme: string;
}

export const DEFAULT_SETTINGS: Settings = { sound: true, confetti: true, theme: "classic" };

export const DEFAULT_ENTRIES = [
  "Pizza night",
  "Sushi",
  "Tacos",
  "Burgers",
  "Ramen",
  "Pasta",
  "Salad bar",
  "Breakfast for dinner",
];

const KEYS = {
  current: "da.current",
  wheels: "da.wheels",
  history: "da.history",
  settings: "da.settings",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export const loadCurrentEntries = () => read<string[] | null>(KEYS.current, null);
export const saveCurrentEntries = (entries: string[]) => write(KEYS.current, entries);

/** Load entries + title, migrating the legacy string[] format. */
export function loadCurrentWheel(): { items: EntryItem[]; title: string } | null {
  const raw = read<unknown>(KEYS.current, null);
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    return {
      items: raw
        .filter((x): x is string => typeof x === "string")
        .map((t) => ({ text: t, weight: 1, photo: null, icon: null, color: null })),
      title: "My Wheel",
    };
  }
  if (typeof raw === "object") {
    const obj = raw as { items?: unknown; title?: unknown };
    if (Array.isArray(obj.items)) {
      const items: EntryItem[] = obj.items
        .map((x): EntryItem | null => {
          if (typeof x === "string") return { text: x, weight: 1, photo: null, icon: null, color: null };
          if (x && typeof x === "object" && typeof (x as EntryItem).text === "string") {
            const src = x as EntryItem;
            const w = Number(src.weight);
            return {
              text: src.text,
              weight: Number.isFinite(w) && w > 0 ? w : 1,
              photo: typeof src.photo === "string" && src.photo.length > 0 ? src.photo : null,
              icon: typeof src.icon === "string" && src.icon.length > 0 ? src.icon : null,
              color: typeof src.color === "string" && /^#[0-9a-fA-F]{6}$/.test(src.color) ? src.color : null,
            };
          }
          return null;
        })
        .filter((x): x is EntryItem => x !== null);
      return { items, title: typeof obj.title === "string" && obj.title.trim() ? obj.title : "My Wheel" };
    }
  }
  return null;
}

export function saveCurrentWheel(items: EntryItem[], title: string) {
  write(KEYS.current, { v: 2, title, items });
}

export const loadWheels = () => read<SavedWheel[]>(KEYS.wheels, []);
export const saveWheels = (wheels: SavedWheel[]) => write(KEYS.wheels, wheels);

export const loadHistory = () => read<HistoryEntry[]>(KEYS.history, []);
export const saveHistory = (h: HistoryEntry[]) => write(KEYS.history, h.slice(0, 40));

export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) });
export const saveSettings = (s: Settings) => write(KEYS.settings, s);

export function makeSavedWheel(name: string, items: EntryItem[]): SavedWheel {
  return {
    id: uid(),
    name: name.trim() || "Untitled wheel",
    entries: items.map((i) => i.text),
    items: items.map((i) => ({ text: i.text, weight: i.weight, photo: i.photo ?? null, icon: i.icon ?? null, color: i.color ?? null })),
    updatedAt: Date.now(),
  };
}
