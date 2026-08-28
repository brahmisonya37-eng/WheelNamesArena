import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { Navigate } from "react-router-dom";
import { GUIDES, getGuide } from "../lib/guides";
import { Reveal } from "../components/Reveal";
import { ToolCard } from "../components/ToolCard";
import { getTool } from "../lib/tools";
import { usePageMeta } from "../lib/usePageMeta";

/* ------------------------------- Guides index ------------------------------- */

export function GuidesIndex() {
  usePageMeta({
    title: "Random Tools Guide — Articles & Ideas | WheelNamesArena",
    description: "Practical guides on random student picking, running giveaways, classroom randomizer ideas, wheel ideas and balanced teams.",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Random Tools Guide</h1>
        <p className="mt-3 text-lg text-ink-500">How-tos, ideas and routines for getting the most out of randomness — in class, on stream, and in life.</p>
      </header>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {GUIDES.map((g, i) => (
          <Reveal key={g.slug} delay={Math.min(i * 0.06, 0.24)}>
            <Link to={`/guides/${g.slug}`} className="group flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-7 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-ink-400 uppercase">
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-600">{g.category}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden /> {g.readTime}</span>
              </div>
              <h2 className="mt-3.5 font-display text-xl leading-snug font-bold text-balance group-hover:text-brand-600">{g.title}</h2>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-500">{g.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-500">
                Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Article reader ------------------------------ */

export function GuideArticlePage() {
  const { slug = "" } = useParams();
  const guide = getGuide(slug);

  usePageMeta({
    title: guide ? `${guide.title} | WheelNamesArena Guide` : "Guide | WheelNamesArena",
    description: guide?.description ?? "",
    jsonLd: guide
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          dateModified: guide.updated,
          author: { "@type": "Organization", name: "WheelNamesArena" },
        }
      : undefined,
  });

  if (!guide) return <Navigate to="/guides" replace />;

  const relatedTools = guide.relatedTools.map((s) => getTool(s)).filter((t) => t !== undefined);
  const otherGuides = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
          <li><Link to="/" className="transition hover:text-brand-600">Home</Link></li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li><Link to="/guides" className="transition hover:text-brand-600">Guides</Link></li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li aria-current="page" className="text-ink-700">{guide.title}</li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <article className="min-w-0">
          <header>
            <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-ink-400 uppercase">
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-600">{guide.category}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden /> {guide.readTime}</span>
              <span>Updated {new Date(guide.updated).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
            </p>
            <h1 className="mt-4 font-display text-3xl leading-tight font-bold text-balance sm:text-4xl">{guide.title}</h1>
          </header>

          <div className="mt-8 space-y-8">
            {guide.sections.map((section, i) => (
              <section key={i}>
                {section.heading && <h2 className="mb-3 font-display text-2xl font-bold">{section.heading}</h2>}
                {section.paragraphs?.map((p, j) => (
                  <p key={j} className="mb-3 leading-relaxed text-ink-600">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="space-y-2.5">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex gap-3 leading-relaxed text-ink-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* More guides */}
          <div className="mt-12 border-t border-ink-100 pt-8">
            <h2 className="mb-4 font-display text-lg font-bold">Keep reading</h2>
            <div className="grid gap-3">
              {otherGuides.map((g) => (
                <Link key={g.slug} to={`/guides/${g.slug}`} className="group flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-5 py-3.5 shadow-soft transition hover:border-brand-200">
                  <span className="min-w-0 truncate text-sm font-semibold text-ink-900 group-hover:text-brand-600">{g.title}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 group-hover:text-brand-500" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </article>

        {/* Sidebar: try the tools */}
        <aside className="min-w-0">
          <div className="sticky top-24 space-y-4">
            <h2 className="font-display text-lg font-bold">Try the tools from this guide</h2>
            {relatedTools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
            <Link to="/guides" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-500 underline-offset-4 hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden /> All guides
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
