import { Timer } from "lucide-react";
import { cx } from "../components/ui";
import { SPIN_TIME_MAX, SPIN_TIME_MIN } from "../lib/timing";

const PRESETS = [
  { label: "Fast", value: 1 },
  { label: "Normal", value: 3 },
  { label: "Slow", value: 6 },
];

/**
 * Compact spin-time picker shared by all reveal tools.
 * Value is in seconds (1–10, half-second steps).
 */
export function SpinTimeControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl bg-ink-50/70 px-4 py-2.5">
      <span className="flex items-center gap-1.5 text-xs font-bold text-ink-500">
        <Timer className="h-3.5 w-3.5 text-brand-500" aria-hidden />
        Spin time
        <span className="rounded-full bg-white px-2 py-0.5 font-display text-[11px] text-brand-600 shadow-sm" aria-live="polite">
          {value}s
        </span>
      </span>

      <input
        type="range"
        min={SPIN_TIME_MIN}
        max={SPIN_TIME_MAX}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Spin time in seconds"
        aria-valuetext={`${value} seconds`}
        className="w-36 cursor-pointer accent-brand-500"
      />

      <div className="flex gap-1" role="group" aria-label="Spin time presets">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            aria-pressed={value === p.value}
            className={cx(
              "rounded-full border px-2.5 py-1 text-[11px] font-bold transition",
              value === p.value ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 bg-white text-ink-500 hover:border-ink-300 hover:text-ink-950",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
