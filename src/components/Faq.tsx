import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "./ui";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-ink-100 rounded-3xl border border-ink-100 bg-white shadow-soft">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          >
            <span className="font-display text-[15px] font-bold text-ink-950">{item.q}</span>
            <ChevronDown className={cx("h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200", open === i && "rotate-180 text-brand-500")} aria-hidden />
          </button>
          <div className={cx("grid transition-all duration-200", open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-sm leading-relaxed text-ink-500">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
