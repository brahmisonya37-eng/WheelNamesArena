import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, Disc, Plus, Trash2 } from "lucide-react";
import { cx } from "../ui";
import type { LibraryWheel } from "../../lib/wheelLibrary";
import { WHEEL_THEME_DEFS } from "../../lib/wheelSettings";
import type { WheelThemeName } from "../../lib/wheelSettings";

interface WheelSwitcherProps {
  library: LibraryWheel[];
  activeId: string | null;
  activeTitle: string;
  onSwitch: (id: string) => void;
  onNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function themeDot(w: LibraryWheel | null): string {
  const theme = (w?.settings?.theme ?? "default") as WheelThemeName;
  return WHEEL_THEME_DEFS[theme]?.palette[0] ?? "#6d4aff";
}

/**
 * Multi-wheel switcher: shows the active wheel and lets the user add more
 * wheels, switch between them, duplicate or delete them. Each wheel keeps
 * its own entries, images and full customization.
 */
export function WheelSwitcher({ library, activeId, activeTitle, onSwitch, onNew, onDuplicate, onDelete }: WheelSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setConfirmId(null);
  }, [open]);

  const activeWheel = library.find((w) => w.id === activeId) ?? null;

  return (
    <div ref={rootRef} className="relative z-30 mx-auto mb-5 flex w-full max-w-xl items-center justify-center gap-2">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch wheel"
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-left shadow-soft transition hover:border-brand-300 sm:flex-none sm:px-5"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: themeDot(activeWheel) }} aria-hidden>
          <Disc className="h-4 w-4 text-white" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-ink-950">{activeTitle || activeWheel?.title || "My Wheel"}</span>
          <span className="block text-[11px] font-semibold text-ink-400">
            {library.length > 0 ? `${library.length} wheel${library.length === 1 ? "" : "s"} saved` : "Wheel library"}
          </span>
        </span>
        <ChevronDown className={cx("h-4 w-4 shrink-0 text-ink-400 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {/* New wheel */}
      <button
        type="button"
        onClick={onNew}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink-950 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-ink-800"
      >
        <Plus className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">New wheel</span>
        <span className="sm:hidden">New</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label="Your wheels"
          className="absolute top-full right-0 left-0 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-ink-100 bg-white p-2 shadow-lift"
        >
          {library.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-ink-400">
              No saved wheels yet — press <strong>New wheel</strong> to create your first one, or keep building this one and it will be saved here.
            </p>
          )}
          {library.map((w) => {
            const isActive = w.id === activeId;
            return (
              <div
                key={w.id}
                role="option"
                aria-selected={isActive}
                className={cx(
                  "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition",
                  isActive ? "bg-brand-50" : "hover:bg-ink-50",
                )}
              >
                <button type="button" onClick={() => { onSwitch(w.id); setOpen(false); }} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: themeDot(w) }} aria-hidden>
                    <Disc className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx("block truncate text-sm font-bold", isActive ? "text-brand-600" : "text-ink-900")}>{w.title}</span>
                    <span className="block text-[11px] font-semibold text-ink-400">
                      {w.items.filter((i) => i.text.trim()).length} entries
                    </span>
                  </span>
                  {isActive && <Check className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />}
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(w.id)}
                  aria-label={`Duplicate ${w.title}`}
                  title="Duplicate"
                  className="rounded-lg p-1.5 text-ink-300 transition hover:bg-white hover:text-ink-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {confirmId === w.id ? (
                  <button
                    type="button"
                    onClick={() => { onDelete(w.id); setConfirmId(null); setOpen(false); }}
                    aria-label={`Confirm deleting ${w.title}`}
                    className="rounded-lg bg-coral-500 px-2 py-1.5 text-[11px] font-bold text-white"
                  >
                    Sure?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(w.id)}
                    aria-label={`Delete ${w.title}`}
                    title="Delete"
                    className="rounded-lg p-1.5 text-ink-300 transition hover:bg-white hover:text-coral-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
