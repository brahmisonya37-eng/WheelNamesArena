import { useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { copyText } from "../lib/hooks";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------- Button --------------------------------- */

type BtnVariant = "primary" | "dark" | "outline" | "ghost" | "coral" | "white";
type BtnSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer whitespace-nowrap";

const BTN_VARIANTS: Record<BtnVariant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_8px_24px_-8px_rgb(109_74_255/0.55)] hover:shadow-[0_12px_30px_-8px_rgb(109_74_255/0.7)] hover:-translate-y-px",
  dark: "bg-ink-950 text-white hover:bg-ink-800 hover:-translate-y-px",
  outline: "border border-ink-200 bg-white text-ink-900 hover:border-ink-300 hover:bg-ink-50",
  ghost: "text-ink-700 hover:bg-ink-950/5 hover:text-ink-950",
  coral: "bg-coral-500 text-white hover:bg-coral-600 shadow-[0_8px_24px_-8px_rgb(255_107_94/0.55)] hover:-translate-y-px",
  white: "bg-white text-ink-950 hover:bg-ink-50 shadow-soft",
};

const BTN_SIZES: Record<BtnSize, string> = {
  sm: "text-[13px] px-3.5 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  to?: string;
}

export function Btn({ variant = "primary", size = "md", to, className, children, ...rest }: BtnProps) {
  const cls = cx(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], className);
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ----------------------------------- Card ---------------------------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-3xl border border-ink-100 bg-white shadow-soft", className)}>{children}</div>;
}

/* ---------------------------------- Toggle --------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
        checked ? "bg-brand-500" : "bg-ink-200",
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

/* -------------------------------- CopyButton ------------------------------- */

export function CopyButton({
  text,
  label = "Copy",
  variant = "outline",
  size = "sm",
  className,
}: {
  text: string;
  label?: string;
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Btn
      variant={variant}
      size={size}
      className={className}
      onClick={async () => {
        const ok = await copyText(text);
        if (ok) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }
      }}
    >
      {copied ? <Check className="h-4 w-4 text-mint-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      {copied ? "Copied!" : label}
    </Btn>
  );
}

/* ------------------------------ SectionHeading ----------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  sub,
  center,
  dark,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={cx("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className={cx("mb-3 text-xs font-bold tracking-[0.18em] uppercase", dark ? "text-brand-300" : "text-brand-500")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cx("font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl", dark ? "text-white" : "text-ink-950")}>
        {title}
      </h2>
      {sub && <p className={cx("mt-3 text-base leading-relaxed sm:text-lg", dark ? "text-ink-300" : "text-ink-500")}>{sub}</p>}
    </div>
  );
}

/* --------------------------------- IconChip -------------------------------- */

export function IconChip({ icon: Icon, accent, size = 44 }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; accent: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-2xl"
      style={{ width: size, height: size, background: `${accent}1c`, color: accent }}
      aria-hidden
    >
      <Icon className="h-[55%] w-[55%]" strokeWidth={2.2} />
    </span>
  );
}
