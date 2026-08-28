import { useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Lightbulb } from "lucide-react";
import type { ToolMeta } from "../lib/tools";
import { TOOLS } from "../lib/tools";
import { TOOL_PAGES } from "../lib/toolPages";
import { usePageMeta } from "../lib/usePageMeta";
import { Faq } from "./Faq";
import { IconChip } from "./ui";
import { ToolCard } from "./ToolCard";

export function ToolPage({ meta, children }: { meta: ToolMeta; children: ReactNode }) {
  const content = TOOL_PAGES[meta.slug] ?? { intro: meta.tagline, howTo: [], faq: [] };

  // Memoized so the JSON-LD <script> isn't rewritten on every keystroke
  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: meta.name,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        description: content.intro,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
    [meta.name, content],
  );

  usePageMeta({
    title: `${meta.name} — Free Online Tool | WheelNamesArena`,
    description: content.intro.slice(0, 158),
    jsonLd,
  });

  const related = [
    ...TOOLS.filter((t) => t.slug !== meta.slug && t.category === meta.category),
    ...TOOLS.filter((t) => t.slug !== meta.slug && t.category !== meta.category),
  ].slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
          <li><Link to="/" className="transition hover:text-brand-600">Home</Link></li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li><Link to="/tools" className="transition hover:text-brand-600">Random Tools</Link></li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li aria-current="page" className="text-ink-700">{meta.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <IconChip icon={meta.icon} accent={meta.accent} size={56} />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{meta.name}</h1>
          <p className="mt-1.5 max-w-2xl text-base text-ink-500">{meta.tagline} Free, instant, no sign-up.</p>
        </div>
      </header>

      {/* The tool itself */}
      <section aria-label={`${meta.name} tool`}>{children}</section>

      {/* SEO content */}
      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="font-display text-2xl font-bold">What is the {meta.name.toLowerCase()}?</h2>
            <p className="mt-3 leading-relaxed text-ink-500">{content.intro}</p>
          </section>

          {content.howTo.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold">How to use it</h2>
              <ol className="mt-4 space-y-3">
                {content.howTo.map((step, i) => (
                  <li key={i} className="flex gap-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 font-display text-sm font-bold text-white" aria-hidden>
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed text-ink-600">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {content.tips && content.tips.length > 0 && (
            <section className="rounded-3xl bg-sun-100/60 p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <Lightbulb className="h-5 w-5 text-sun-500" aria-hidden /> Pro tips
              </h2>
              <ul className="mt-3 space-y-2">
                {content.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-700">
                    <span className="text-sun-500" aria-hidden>★</span> {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.faq.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">FAQ</h2>
              <Faq items={content.faq} />
            </section>
          )}
        </div>

        {/* Related */}
        <aside className="min-w-0">
          <h2 className="mb-4 font-display text-lg font-bold">You might also like</h2>
          <div className="grid gap-3">
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
          <div className="mt-6 rounded-3xl bg-ink-950 p-6 text-white">
            <p className="font-display text-lg font-bold">Need a wheel instead?</p>
            <p className="mt-1.5 text-sm text-ink-300">Turn any list into a spinning wheel with sound, confetti and full-screen mode.</p>
            <Link to="/wheel-spinner" className="mt-4 inline-flex rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400">
              Open the wheel spinner
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
