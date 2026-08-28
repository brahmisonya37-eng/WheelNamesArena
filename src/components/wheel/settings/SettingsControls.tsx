import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import { Toggle, cx } from "../../ui";

/* ------------------------------- Setting rows ------------------------------ */

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        {hint && <p className="mt-0.5 text-xs leading-snug text-ink-400">{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function SliderRow({
  label,
  valueLabel,
  min,
  max,
  step = 1,
  value,
  onChange,
  children,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  children?: ReactNode;
}) {
  return (
    <div className="py-2.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600" aria-live="polite">
          {valueLabel}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={valueLabel}
        className="w-full cursor-pointer accent-brand-500"
      />
      {children && <div className="mt-2.5">{children}</div>}
    </div>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="flex rounded-full border border-ink-200 bg-ink-50 p-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cx(
            "flex-1 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition",
            value === o.value ? "bg-white text-ink-950 shadow-soft" : "text-ink-500 hover:text-ink-950",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  onReset,
  resetLabel = "Auto",
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  onReset?: () => void;
  resetLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <p className="text-sm font-semibold text-ink-900">{label}</p>
      <div className="flex items-center gap-2">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-[11px] font-bold text-ink-500 transition hover:border-ink-300 hover:text-ink-950"
          >
            <RotateCcw className="h-3 w-3" aria-hidden /> {resetLabel}
          </button>
        )}
        <span className="relative inline-flex h-9 w-12 items-center justify-center overflow-hidden rounded-xl border border-ink-200 shadow-sm">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} color`}
            className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 p-0"
          />
        </span>
      </div>
    </div>
  );
}

export function SettingsSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      {title && <h3 className="mb-1.5 text-xs font-bold tracking-[0.14em] text-ink-400 uppercase">{title}</h3>}
      <div className="divide-y divide-ink-100/70">{children}</div>
    </section>
  );
}

/* -------------------------------- Image field ------------------------------ */

const CHECKER: CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, #e9e7f0 25%, transparent 25%, transparent 75%, #e9e7f0 75%), linear-gradient(45deg, #e9e7f0 25%, #ffffff 25%, #ffffff 75%, #e9e7f0 75%)",
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 6px 6px",
};

export function ImageField({
  label,
  hint,
  value,
  onUpload,
  onRemove,
  round = false,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  round?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3.5 py-3">
      <span
        className={cx("flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-ink-200 shadow-sm", round ? "rounded-full" : "rounded-xl")}
        style={CHECKER}
        aria-hidden
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-5 w-5 text-ink-300" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        {hint && <p className="mt-0.5 text-xs leading-snug text-ink-400">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
        >
          {value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="rounded-full border border-ink-200 bg-white p-2 text-ink-400 transition hover:border-coral-500 hover:text-coral-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
