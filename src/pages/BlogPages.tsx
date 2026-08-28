import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, ChevronRight, Clock, Search } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Faq } from "../components/Faq";
import { ToolCard } from "../components/ToolCard";
import { Btn, cx } from "../components/ui";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  SITE_ORIGIN,
  blogUrl,
  getCategory,
  getBlogPost,
  postsByCategory,
  relatedArticles,
  searchBlogPosts,
} from "../lib/blog";
import type { BlogCategoryId, BlogPost } from "../lib/blog";
import { getTool } from "../lib/tools";
import { usePageMeta } from "../lib/usePageMeta";

const CATEGORY_COLORS: Record<BlogCategoryId, string> = {
  teachers: "#2dd4a7",
  giveaways: "#ff6b5e",
  games: "#ffb020",
  streamers: "#6d4aff",
  decisions: "#38bdf8",
};

function CategoryBadge({ id }: { id: BlogCategoryId }) {
  const cat = getCategory(id);
  const color = CATEGORY_COLORS[id];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: `${color}1c`, color }}>
      {cat?.label}
    </span>
  );
}

/* -------------------------------- Blog index ------------------------------- */

export function BlogIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BlogCategoryId | "all">("all");

  usePageMeta({
    title: "Blog — Guides & Ideas for Random Tools | WheelNamesArena",
    description:
      "Practical guides on wheel spinners, random pickers, classroom randomizers, giveaway wheels, team generators and decision tools. Free articles from WheelNamesArena.",
    canonical: `${SITE_ORIGIN}/blog`,
    ogType: "website",
  });

  const results = useMemo(() => {
    const searched = searchBlogPosts(query);
    return category === "all" ? searched : searched.filter((p) => p.category === category);
  }, [query, category]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-brand-600">
          <BookOpen className="h-3.5 w-3.5" aria-hidden /> The WheelNamesArena Blog
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">Guides & ideas for random tools</h1>
        <p className="mt-3 text-lg text-ink-500">
          Practical, no-fluff articles on wheels, pickers, classroom games, giveaways and everyday decisions.
        </p>
      </header>

      {/* Search + filters */}
      <div className="mx-auto mt-8 max-w-3xl">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles — try “giveaway”, “classroom”, “wheel”…"
            aria-label="Search blog articles"
            className="w-full rounded-full border border-ink-200 bg-white py-3.5 pr-5 pl-12 text-base shadow-soft outline-none focus:border-brand-300 focus:shadow-glow"
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setCategory("all")}
            aria-pressed={category === "all"}
            className={cx(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              category === "all" ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
            )}
          >
            All
          </button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={cx(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                category === c.id ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <p className="mt-16 text-center text-ink-400">No articles match “{query}”. Try a different keyword.</p>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.map((post, i) => (
            <Reveal key={post.slug} delay={Math.min(i * 0.04, 0.2)}>
              <Link
                to={`/blog/${post.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
              >
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge id={post.category} />
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-ink-400">
                    <Clock className="h-3 w-3" aria-hidden /> {post.readTime}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-lg leading-snug font-bold text-balance group-hover:text-brand-600">{post.h1}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500">{post.metaDescription}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-500">
                  Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {/* Category blurbs */}
      <section className="mt-16">
        <h2 className="text-center font-display text-2xl font-bold">Browse by topic</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategory(c.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-2xl border border-ink-100 bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200"
            >
              <span className="font-display text-sm font-bold" style={{ color: CATEGORY_COLORS[c.id] }}>
                {c.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">{c.blurb}</span>
              <span className="mt-2 block text-[11px] font-semibold text-ink-400">{postsByCategory(c.id).length} articles</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------- Article page ------------------------------ */

function CtaBlock({ post }: { post: BlogPost }) {
  const tools = post.relatedTools.map((s) => getTool(s)).filter((t) => t !== undefined);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-ink-950 p-7 text-white sm:p-9">
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <h2 className="font-display text-2xl font-bold text-balance">Try it free on WheelNamesArena</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
        No sign-up, no paywalls — just open a tool and go. Everything runs in your browser.
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <Btn to="/wheel-spinner" variant="white" size="md">
          Spin a Wheel <ArrowRight className="h-4 w-4" aria-hidden />
        </Btn>
        {tools.slice(0, 2).map((t) => (
          <Btn key={t.slug} to={`/${t.slug}`} size="md" className="border border-white/30 bg-white/10 text-white shadow-none hover:bg-white/20">
            {t.name}
          </Btn>
        ))}
      </div>
    </div>
  );
}

export function BlogArticlePage() {
  const { slug = "" } = useParams();
  const post = getBlogPost(slug);

  const jsonLd = useMemo(() => {
    if (!post) return undefined;
    const cat = getCategory(post.category);
    return [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.h1,
        description: post.metaDescription,
        dateModified: post.updated,
        author: { "@type": "Organization", name: "WheelNamesArena", url: SITE_ORIGIN },
        publisher: { "@type": "Organization", name: "WheelNamesArena", url: SITE_ORIGIN },
        mainEntityOfPage: { "@type": "WebPage", "@id": blogUrl(post.slug) },
        articleSection: cat?.label,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
          { "@type": "ListItem", position: 3, name: post.h1, item: blogUrl(post.slug) },
        ],
      },
      ...(post.faq && post.faq.length > 0
        ? [
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: post.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ];
  }, [post]);

  usePageMeta({
    title: post ? post.title : "Article | WheelNamesArena",
    description: post?.metaDescription ?? "",
    canonical: post ? blogUrl(post.slug) : undefined,
    ogType: "article",
    jsonLd,
  });

  if (!post) return <Navigate to="/blog" replace />;

  const cat = getCategory(post.category);
  const related = relatedArticles(post, 3);
  const tools = post.relatedTools.map((s) => getTool(s)).filter((t) => t !== undefined);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-ink-400">
          <li>
            <Link to="/" className="transition hover:text-brand-600">Home</Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li>
            <Link to="/blog" className="transition hover:text-brand-600">Blog</Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li aria-current="page" className="text-ink-700">{post.h1}</li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* Article body */}
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge id={post.category} />
              <span className="flex items-center gap-1 text-xs font-semibold text-ink-400">
                <Clock className="h-3.5 w-3.5" aria-hidden /> {post.readTime}
              </span>
              <span className="text-xs font-semibold text-ink-400">
                Updated {new Date(post.updated).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight font-bold text-balance sm:text-4xl">{post.h1}</h1>
          </header>

          <div className="mt-6 space-y-4">
            {post.intro.map((p, i) => (
              <p key={i} className="text-lg leading-relaxed text-ink-600">{p}</p>
            ))}
          </div>

          <div className="mt-8 space-y-10">
            {post.sections.map((section, i) => (
              <section key={i}>
                <h2 className="font-display text-2xl font-bold text-ink-950">{section.h2}</h2>
                {section.paragraphs && (
                  <div className="mt-3 space-y-3">
                    {section.paragraphs.map((p, j) => (
                      <p key={j} className="leading-relaxed text-ink-600">{p}</p>
                    ))}
                  </div>
                )}
                {section.list && (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((li, j) => (
                      <li key={j} className="flex gap-3 leading-relaxed text-ink-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                        {li}
                      </li>
                    ))}
                  </ul>
                )}
                {section.sub && (
                  <div className="mt-4 space-y-5">
                    {section.sub.map((sub, j) => (
                      <div key={j}>
                        <h3 className="font-display text-lg font-bold text-ink-900">{sub.h3}</h3>
                        {sub.paragraphs && (
                          <div className="mt-2 space-y-2">
                            {sub.paragraphs.map((p, k) => (
                              <p key={k} className="leading-relaxed text-ink-600">{p}</p>
                            ))}
                          </div>
                        )}
                        {sub.list && (
                          <ul className="mt-2 space-y-2">
                            {sub.list.map((li, k) => (
                              <li key={k} className="flex gap-3 leading-relaxed text-ink-600">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                                {li}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Natural CTA */}
          <div className="mt-10">
            <CtaBlock post={post} />
          </div>

          {/* FAQ */}
          {post.faq && post.faq.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 font-display text-2xl font-bold">Frequently asked questions</h2>
              <Faq items={post.faq} />
            </section>
          )}

          {/* Related articles */}
          {related.length > 0 && (
            <section className="mt-12 border-t border-ink-100 pt-8">
              <h2 className="mb-4 font-display text-2xl font-bold">Related articles</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200"
                  >
                    <CategoryBadge id={r.category} />
                    <h3 className="mt-2.5 flex-1 font-display text-sm leading-snug font-bold group-hover:text-brand-600">{r.h1}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-500">
                      Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="min-w-0">
          <div className="sticky top-24 space-y-6">
            {tools.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-lg font-bold">Tools mentioned in this article</h2>
                <div className="grid gap-3">
                  {tools.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
              <h2 className="font-display text-lg font-bold">{cat?.label} articles</h2>
              <p className="mt-1 text-sm text-ink-500">{cat?.blurb}</p>
              <Link to="/blog" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-500 hover:underline">
                Browse all articles <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
