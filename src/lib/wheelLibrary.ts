import { uid } from "./random";
import type { EntryItem } from "./storage";
import { DEFAULT_ENTRIES } from "./storage";
import type { WheelSettings } from "./wheelSettings";
import { DEFAULT_WHEEL_SETTINGS } from "./wheelSettings";

/**
 * A complete, self-contained wheel: entries (with images/colors/weights),
 * the display title, and the full settings (theme, colors, images, spin,
 * sound, results, randomization). The multi-wheel library stores these so
 * users can keep several fully-customized wheels and switch between them.
 */
export interface LibraryWheel {
  id: string;
  title: string;
  items: EntryItem[];
  settings: WheelSettings;
  updatedAt: number;
}

const LIB_KEY = "da.library.v1";
const ACTIVE_KEY = "da.library.active";

export function loadLibrary(): LibraryWheel[] {
  try {
    const raw = window.localStorage.getItem(LIB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (w): w is LibraryWheel =>
        w && typeof w === "object" && typeof w.id === "string" && Array.isArray(w.items) && typeof w.settings === "object",
    );
  } catch {
    return [];
  }
}

export function saveLibrary(lib: LibraryWheel[]) {
  try {
    window.localStorage.setItem(LIB_KEY, JSON.stringify(lib));
  } catch {
    /* quota / privacy mode */
  }
}

export function loadActiveId(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function saveActiveId(id: string | null) {
  try {
    if (id === null) window.localStorage.removeItem(ACTIVE_KEY);
    else window.localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function makeLibraryWheel(title: string, items: EntryItem[], settings: WheelSettings): LibraryWheel {
  return { id: uid(), title: title.trim() || "My Wheel", items, settings, updatedAt: Date.now() };
}

/** A fresh wheel with starter entries and default settings. */
export function blankWheel(index: number): LibraryWheel {
  return makeLibraryWheel(
    `My Wheel ${index}`,
    DEFAULT_ENTRIES.map((t) => ({ text: t, weight: 1, photo: null, icon: null, color: null })),
    { ...DEFAULT_WHEEL_SETTINGS, images: { ...DEFAULT_WHEEL_SETTINGS.images } },
  );
}
