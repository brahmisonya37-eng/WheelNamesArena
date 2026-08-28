import { BLOG_POSTS_1 } from "./blogContent1";
import { BLOG_POSTS_2 } from "./blogContent2";
import { BLOG_POSTS_3 } from "./blogContent3";

export type BlogCategoryId = "teachers" | "giveaways" | "games" | "streamers" | "decisions";

export interface BlogCategory {
  id: BlogCategoryId;
  label: string;
  blurb: string;
}

export interface BlogSubSection {
  h3: string;
  paragraphs?: string[];
  list?: string[];
}

export interface BlogSection {
  h2: string;
  paragraphs?: string[];
  list?: string[];
  sub?: BlogSubSection[];
}

export interface BlogPost {
  slug: string;
  /** SEO title tag (rendered in <title>). */
  title: string;
  /** On-page H1. */
  h1: string;
  metaDescription: string;
  category: BlogCategoryId;
  readTime: string;
  /** ISO date, e.g. 2025-03-04 */
  updated: string;
  intro: string[];
  sections: BlogSection[];
  faq?: { q: string; a: string }[];
  /** Tool slugs for internal linking. */
  relatedTools: string[];
  /** Blog slugs for related-articles linking. */
  relatedPosts: string[];
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: "teachers", label: "Teachers", blurb: "Classroom randomizers, fair calling, and student engagement." },
  { id: "giveaways", label: "Giveaways", blurb: "Running fair, transparent giveaways and winner draws." },
  { id: "games", label: "Games", blurb: "Party games, game-night ideas, and playful randomizers." },
  { id: "streamers", label: "Streamers", blurb: "Live wheels, viewer engagement, and on-stream draws." },
  { id: "decisions", label: "Random Decisions", blurb: "Everyday choices, decision fatigue, and letting chance help." },
];

export const BLOG_POSTS: BlogPost[] = [...BLOG_POSTS_1, ...BLOG_POSTS_2, ...BLOG_POSTS_3];

export const SITE_ORIGIN = "https://design-arena.vercel.app";

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getCategory(id: BlogCategoryId): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.id === id);
}

export function postsByCategory(id: BlogCategoryId): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.category === id);
}

export function blogUrl(slug: string): string {
  return `${SITE_ORIGIN}/blog/${slug}`;
}

export function relatedArticles(post: BlogPost, max = 3): BlogPost[] {
  const bySlug = new Set(post.relatedPosts);
  const explicit = post.relatedPosts
    .map((s) => getBlogPost(s))
    .filter((p): p is BlogPost => Boolean(p));
  const sameCategory = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category && !bySlug.has(p.slug));
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category !== post.category && !bySlug.has(p.slug));
  return [...explicit, ...sameCategory, ...others].filter((p) => p.slug !== post.slug).slice(0, max);
}

/** Lightweight substring + token search for the blog index. */
export function searchBlogPosts(query: string): BlogPost[] {
  const q = query.trim().toLowerCase();
  if (!q) return BLOG_POSTS;
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = BLOG_POSTS.map((p) => {
    const hay = `${p.title} ${p.h1} ${p.metaDescription} ${getCategory(p.category)?.label ?? ""}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (hay.includes(t)) score += t.length;
    }
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => x.p);
}

/** Approximate word count for display / verification. */
export function wordCount(post: BlogPost): number {
  const parts: string[] = [...post.intro];
  for (const s of post.sections) {
    if (s.paragraphs) parts.push(...s.paragraphs);
    if (s.list) parts.push(...s.list);
    for (const sub of s.sub ?? []) {
      if (sub.paragraphs) parts.push(...sub.paragraphs);
      if (sub.list) parts.push(...sub.list);
    }
  }
  for (const f of post.faq ?? []) parts.push(f.q, f.a);
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}
