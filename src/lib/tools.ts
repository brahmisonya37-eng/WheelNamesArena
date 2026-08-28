import {
  Disc,
  Shuffle,
  ListChecks,
  Hash,
  Users,
  LayoutGrid,
  GraduationCap,
  Gift,
  Scale,
  CircleSlash,
  Coins,
  Dices,
  Type,
  Palette,
  MessageCircleQuestion,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ToolCategory = "wheel" | "pickers" | "generators" | "classroom" | "giveaway" | "fun";

export interface ToolMeta {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  keywords: string[];
  category: ToolCategory;
  accent: string;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  wheel: "Wheel",
  pickers: "Pickers",
  generators: "Generators",
  classroom: "Classroom",
  giveaway: "Giveaway",
  fun: "Just for fun",
};

export const TOOLS: ToolMeta[] = [
  {
    slug: "wheel-spinner",
    name: "Wheel Spinner",
    tagline: "Spin a custom wheel to pick anything at random.",
    icon: Disc,
    keywords: ["wheel", "spinner", "roulette", "spin", "raffle", "fortune", "prize", "decision wheel", "name wheel"],
    category: "wheel",
    accent: "#6d4aff",
  },
  {
    slug: "random-name-picker",
    name: "Random Name Picker",
    tagline: "Draw a random name from any list, instantly.",
    icon: Shuffle,
    keywords: ["name", "picker", "draw names", "random person", "who goes first", "pick someone"],
    category: "pickers",
    accent: "#ff6b5e",
  },
  {
    slug: "random-choice-picker",
    name: "Random Choice Picker",
    tagline: "Can't decide? Let chance pick between your options.",
    icon: ListChecks,
    keywords: ["choice", "picker", "decide", "options", "either or", "chooser", "random selector"],
    category: "pickers",
    accent: "#38bdf8",
  },
  {
    slug: "random-number-generator",
    name: "Random Number Generator",
    tagline: "Generate random numbers between any range.",
    icon: Hash,
    keywords: ["number", "generator", "rng", "lottery", "raffle number", "1 to 100", "dice alternative"],
    category: "generators",
    accent: "#ffb020",
  },
  {
    slug: "random-team-generator",
    name: "Random Team Generator",
    tagline: "Split players into balanced random teams.",
    icon: Users,
    keywords: ["team", "generator", "teams", "sports", "balanced", "split into teams", "house teams"],
    category: "classroom",
    accent: "#2dd4a7",
  },
  {
    slug: "random-group-generator",
    name: "Random Group Generator",
    tagline: "Shuffle a list into random groups of any size.",
    icon: LayoutGrid,
    keywords: ["group", "generator", "groups", "pair up", "grouping", "random groups", "classroom groups"],
    category: "classroom",
    accent: "#f472b6",
  },
  {
    slug: "random-student-picker",
    name: "Random Student Picker",
    tagline: "Call on students fairly, one name at a time.",
    icon: GraduationCap,
    keywords: ["student", "picker", "teacher", "classroom", "call on students", "participation", "fair", "roster"],
    category: "classroom",
    accent: "#6d4aff",
  },
  {
    slug: "giveaway-picker",
    name: "Giveaway Picker",
    tagline: "Draw giveaway winners live, one round at a time.",
    icon: Gift,
    keywords: ["giveaway", "winner", "draw", "raffle", "contest", "prize", "stream giveaway", "instagram", "twitch"],
    category: "giveaway",
    accent: "#ff6b5e",
  },
  {
    slug: "decision-maker",
    name: "Decision Maker",
    tagline: "Weigh your options and let randomness decide.",
    icon: Scale,
    keywords: ["decision", "maker", "decide", "what should i", "dinner", "movie", "choice", "decider"],
    category: "pickers",
    accent: "#ffb020",
  },
  {
    slug: "yes-no-picker",
    name: "Yes / No Picker",
    tagline: "Ask a question. Get a random yes or no.",
    icon: CircleSlash,
    keywords: ["yes", "no", "maybe", "yes or no", "question", "answer", "decide yes no"],
    category: "pickers",
    accent: "#2dd4a7",
  },
  {
    slug: "coin-flip",
    name: "Coin Flip",
    tagline: "Heads or tails — the classic 50/50 decider.",
    icon: Coins,
    keywords: ["coin", "flip", "heads", "tails", "toss", "50 50", "coin toss"],
    category: "fun",
    accent: "#ffb020",
  },
  {
    slug: "dice-roller",
    name: "Dice Roller",
    tagline: "Roll up to eight dice with real pips.",
    icon: Dices,
    keywords: ["dice", "roll", "die", "d6", "board game", "craps", "random dice"],
    category: "fun",
    accent: "#ff6b5e",
  },
  {
    slug: "random-letter-generator",
    name: "Random Letter Generator",
    tagline: "Pull random letters for games and wordplay.",
    icon: Type,
    keywords: ["letter", "alphabet", "random letter", "word game", "scrabble", "charades"],
    category: "generators",
    accent: "#38bdf8",
  },
  {
    slug: "random-color-generator",
    name: "Random Color Generator",
    tagline: "Generate pleasing random colors with hex codes.",
    icon: Palette,
    keywords: ["color", "colour", "hex", "palette", "design", "random color", "rgb"],
    category: "generators",
    accent: "#f472b6",
  },
  {
    slug: "random-question-generator",
    name: "Random Question Generator",
    tagline: "Spark discussion with random questions.",
    icon: MessageCircleQuestion,
    keywords: ["question", "icebreaker", "discussion", "would you rather", "trivia", "conversation starter"],
    category: "generators",
    accent: "#2dd4a7",
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export interface SearchItem {
  title: string;
  path: string;
  kind: "tool" | "page" | "guide";
  description: string;
  keywords: string[];
}

export const EXTRA_PAGES: SearchItem[] = [
  { title: "Random Tools for Teachers", path: "/for-teachers", kind: "page", description: "Student pickers, classroom teams and participation tools.", keywords: ["teacher", "classroom", "school", "students", "education"] },
  { title: "Tools for Streamers", path: "/for-streamers", kind: "page", description: "Full-screen wheels, giveaway mode and OBS-friendly display.", keywords: ["streamer", "obs", "twitch", "live", "stream", "broadcast"] },
  { title: "All Random Tools", path: "/tools", kind: "page", description: "Browse every free random tool on WheelNamesArena.", keywords: ["tools", "all", "browse", "list"] },
  { title: "Random Tools Guide", path: "/guides", kind: "page", description: "Articles on wheels, giveaways, classrooms and decisions.", keywords: ["guide", "blog", "articles", "how to", "tips"] },
];

/** Simple fuzzy subsequence scorer. Returns -1 when no match. */
export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 0;
  const exact = t.indexOf(q);
  if (exact >= 0) return 200 - exact + t.length * -0.01;
  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      streak++;
      score += 2 + streak * 2;
      if (ti === 0 || t[ti - 1] === " ") score += 6;
    } else {
      streak = 0;
    }
  }
  return qi === q.length ? score : -1;
}

export function searchAll(query: string, guides: { title: string; slug: string; description: string }[]): SearchItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const items: SearchItem[] = [
    ...TOOLS.map((t) => ({ title: t.name, path: `/${t.slug}`, kind: "tool" as const, description: t.tagline, keywords: t.keywords })),
    ...EXTRA_PAGES,
    ...guides.map((g) => ({ title: g.title, path: `/guides/${g.slug}`, kind: "guide" as const, description: g.description, keywords: ["guide", "article"] })),
  ];
  const scored = items
    .map((item) => {
      const best = Math.max(
        fuzzyScore(q, item.title) + 20,
        fuzzyScore(q, item.keywords.join(" ")),
        fuzzyScore(q, item.description) - 10,
      );
      return { item, best };
    })
    .filter((s) => s.best > 0)
    .sort((a, b) => b.best - a.best);
  return scored.slice(0, 8).map((s) => s.item);
}
