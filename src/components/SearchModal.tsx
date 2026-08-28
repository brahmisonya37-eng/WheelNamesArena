import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { searchAll } from "../lib/tools";
import type { SearchItem } from "../lib/tools";
import { GUIDES } from "../lib/guides";
import { cx } from "./ui";

const KIND_LABEL: Record<SearchItem["kind"], string> = { tool: "Tool", page: "Page", guide: "Guide" };

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(
    () => searchAll(query, GUIDES.map((g) => ({ title: g.title, slug: g.slug, description: g.description }))),
    [query],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const go = (item: SearchItem) => {
    onClose();
    navigate(item.path);
  };

  const suggestions: SearchItem[] = useMemo(
    () => [
      { title: "Wheel Spinner", path: "/wheel-spinner", kind: "tool", description: "Spin a custom wheel", keywords: [] },
      { title: "Random Student Picker", path: "/random-student-picker", kind: "tool", description: "Call on students fairly", keywords: [] },
      { title: "Giveaway Picker", path: "/giveaway-picker", kind: "tool", description: "Draw winners live", keywords: [] },
      { title: "Random Team Generator", path: "/random-team-generator", kind: "tool", description: "Balanced random teams", keywords: [] },
    ],
    [],
  );

  const shown = query.trim() ? results : suggestions;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Search tools">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ scale: 0.96, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-ink-100 px-5">
              <Search className="h-5 w-5 shrink-0 text-ink-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (shown.length > 0) setActive((a) => Math.min(a + 1, shown.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter" && shown[active]) {
                    go(shown[active]);
                  } else if (e.key === "Escape") {
                    onClose();
                  }
                }}
                placeholder="Search by intent — try “wheel”, “student”, “giveaway”…"
                aria-label="Search tools"
                className="w-full bg-transparent py-4 text-[15px] text-ink-950 outline-none placeholder:text-ink-400"
              />
              <button type="button" onClick={onClose} aria-label="Close search" className="rounded-full p-1.5 text-ink-400 transition hover:bg-ink-50 hover:text-ink-950">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <ul className="thin-scroll max-h-[46vh] overflow-y-auto p-2" role="listbox" aria-label="Search results">
              {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink-400">No matches for “{query}”. Try “wheel”, “team” or “number”.</li>}
              {shown.map((item, i) => (
                <li key={item.path} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item)}
                    className={cx("flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition", i === active ? "bg-brand-50" : "hover:bg-ink-50")}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-950">{item.title}</span>
                      <span className="block truncate text-xs text-ink-400">{item.description}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink-500 uppercase">{KIND_LABEL[item.kind]}</span>
                    <ArrowRight className={cx("h-4 w-4 shrink-0", i === active ? "text-brand-500" : "text-ink-200")} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 border-t border-ink-100 bg-ink-50/60 px-5 py-2.5 text-[11px] text-ink-400">
              <span><kbd className="rounded bg-white px-1.5 py-0.5 font-sans font-semibold shadow-sm">↑↓</kbd> navigate</span>
              <span><kbd className="rounded bg-white px-1.5 py-0.5 font-sans font-semibold shadow-sm">↵</kbd> open</span>
              <span><kbd className="rounded bg-white px-1.5 py-0.5 font-sans font-semibold shadow-sm">esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
