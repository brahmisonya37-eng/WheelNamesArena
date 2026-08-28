import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ToolCard } from "../components/ToolCard";
import { Reveal } from "../components/Reveal";
import { CATEGORY_LABELS, fuzzyScore, TOOLS } from "../lib/tools";
import type { ToolCategory, ToolMeta } from "../lib/tools";
import { usePageMeta } from "../lib/usePageMeta";

const CATEGORY_ORDER: ToolCategory[] = ["wheel", "pickers", "generators", "classroom", "giveaway", "fun"];

export default function ToolsIndex() {
  const [query, setQuery] = useState("");

  usePageMeta({
    title: "All Random Tools — Free Online | WheelNamesArena",
    description: "Browse every free random tool on WheelNamesArena: wheel spinner, name pickers, number generators, team makers, giveaway draws and more.",
  });

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return TOOLS;
    return TOOLS.map((t) => ({
      t,
      score: Math.max(fuzzyScore(q, t.name) + 20, fuzzyScore(q, t.keywords.join(" ")), fuzzyScore(q, t.tagline) - 10),
    }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.t);
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<ToolCategory, ToolMeta[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const t of filtered) map.get(t.category)?.push(t);
    return map;
  }, [filtered]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Random Tools</h1>
        <p className="mt-3 text-lg text-ink-500">Fifteen free tools for every kind of decision. Search by what you need — “wheel”, “student”, “giveaway”, “team”…</p>

        <div className="relative mx-auto mt-7 max-w-xl">
          <Search className="absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools by intent…"
            aria-label="Search tools"
            className="w-full rounded-full border border-ink-200 bg-white py-4 pr-5 pl-13 text-base shadow-soft outline-none focus:border-brand-300 focus:shadow-glow"
          />
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-ink-400">No tools match “{query}”. Try “wheel”, “number” or “team”.</p>
      ) : (
        <div className="mt-12 space-y-12">
          {CATEGORY_ORDER.map((cat) => {
            const tools = grouped.get(cat) ?? [];
            if (tools.length === 0) return null;
            return (
              <section key={cat} aria-label={CATEGORY_LABELS[cat]}>
                <h2 className="mb-4 text-xs font-bold tracking-[0.18em] text-ink-400 uppercase">{CATEGORY_LABELS[cat]}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((t, i) => (
                    <Reveal key={t.slug} delay={Math.min(i * 0.05, 0.2)}>
                      <ToolCard tool={t} />
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
