import { Link } from "react-router-dom";
import type { ToolMeta } from "../lib/tools";
import { IconChip } from "./ui";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  return (
    <Link
      to={`/${tool.slug}`}
      className="group flex items-start gap-4 rounded-3xl border border-ink-100 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
    >
      <IconChip icon={tool.icon} accent={tool.accent} />
      <span className="min-w-0">
        <span className="block font-display text-[15px] font-bold text-ink-950 group-hover:text-brand-600">{tool.name}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-500">{tool.tagline}</span>
      </span>
    </Link>
  );
}
