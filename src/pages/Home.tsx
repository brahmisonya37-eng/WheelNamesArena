import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  EyeOff,
  Gift,
  GraduationCap,
  MonitorPlay,
  PartyPopper,
  Share2,
  Smartphone,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { HeroWheel } from "../components/HeroWheel";
import { Reveal } from "../components/Reveal";
import { ToolCard } from "../components/ToolCard";
import { Btn, SectionHeading } from "../components/ui";
import { TOOLS } from "../lib/tools";
import { GUIDES } from "../lib/guides";
import { usePageMeta } from "../lib/usePageMeta";

const TRUST_POINTS = [
  { icon: CheckCircle2, label: "Free" },
  { icon: Zap, label: "No Sign Up" },
  { icon: Sparkles, label: "Instant" },
  { icon: Smartphone, label: "Mobile Friendly" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Add your entries", text: "Type, paste or import any list — names, choices, prizes, questions. One per line." },
  { step: "02", title: "Spin or pick", text: "Spin the wheel, draw a name, roll the dice. Every result is a fair, random pick." },
  { step: "03", title: "Celebrate & share", text: "Confetti, sounds and a winner card. Share the wheel by link — no account needed." },
];

export default function Home() {
  usePageMeta({
    title: "WheelNamesArena — Free Random Tools for Every Decision",
    description:
      "Spin wheels, pick names, create teams, run giveaways, and decide instantly — free and fast. No sign-up, no paywalls. Random tools for classrooms, streams and everyday decisions.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "WheelNamesArena",
      description: "Free random tools for every decision: wheel spinner, random pickers, team generators and giveaway tools.",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "{search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
  });

  return (
    <>
      {/* ================================ HERO ================================ */}
      <section className="relative overflow-hidden">
        {/* ambient gradients */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-brand-200/40 blur-3xl" />
          <div className="absolute top-20 -right-40 h-[420px] w-[420px] rounded-full bg-sun-100 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-mint-100/70 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pt-20 lg:pb-24">
          <div>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-brand-600 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Make Random Decisions More Fun
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-5 font-display text-[2.5rem] leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
            >
              Spin<span className="text-brand-500">.</span> Pick<span className="text-coral-500">.</span> Decide<span className="text-mint-500">.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }} className="mt-5 max-w-lg text-lg leading-relaxed text-ink-500">
              Free random tools for classrooms, giveaways, games, and decisions. Spin your way to an answer — no sign-up, just spin.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.24 }} className="mt-8 flex flex-wrap gap-3">
              <Btn to="/wheel-spinner" size="lg">
                Spin a Wheel <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </Btn>
              <Btn to="/tools" size="lg" variant="outline">
                Explore Tools
              </Btn>
            </motion.div>

            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5">
              {TRUST_POINTS.map((t) => (
                <li key={t.label} className="flex items-center gap-1.5 text-sm font-semibold text-ink-600">
                  <t.icon className="h-4 w-4 text-mint-500" aria-hidden /> {t.label}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="animate-float-slow">
            <HeroWheel />
          </motion.div>
        </div>
      </section>

      {/* ============================== STATS STRIP ============================== */}
      <section className="border-y border-ink-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { big: "15", small: "free random tools" },
            { big: "∞", small: "spins, picks & rolls" },
            { big: "0", small: "sign-ups required" },
            { big: "100%", small: "private & in-browser" },
          ].map((s) => (
            <div key={s.small}>
              <p className="font-display text-3xl font-bold text-brand-500">{s.big}</p>
              <p className="mt-1 text-sm font-semibold text-ink-500">{s.small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =============================== TOOLS GRID ============================== */}
      <section id="tools" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            center
            eyebrow="The toolbox"
            title="Every random tool you'll ever need"
            sub="Wheels, pickers, generators and games — each one free, fast and ready to use. Search by intent or browse below."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.slug} delay={Math.min(i * 0.04, 0.3)}>
              <ToolCard tool={tool} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================= */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading center eyebrow="How it works" title="Pick faster in three steps" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-ink-100 bg-paper p-7 shadow-soft">
                  <p className="font-display text-4xl font-bold text-brand-200">{s.step}</p>
                  <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-500">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================ TEACHERS =============================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <img src="/images/teachers.jpg" alt="Students raising their hands in a bright classroom" loading="lazy" className="aspect-[4/3] w-full rounded-[32px] object-cover shadow-lift" />
              <div className="absolute -right-3 -bottom-4 rounded-2xl bg-white px-4 py-3 shadow-lift sm:-right-6">
                <p className="flex items-center gap-2 text-sm font-bold text-ink-950">
                  <GraduationCap className="h-4 w-4 text-brand-500" aria-hidden /> Fair calling, every lesson
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <SectionHeading
              eyebrow="For teachers"
              title="Random tools for teachers"
              sub="Keep every student engaged with fair, fun randomizers. Set up once, use all year — everything saves in your browser."
            />
            <ul className="mt-6 space-y-3">
              {[
                { icon: GraduationCap, text: "Student picker with set-aside mode, so everyone gets a turn" },
                { icon: Users, text: "Balanced classroom teams and random groups in one click" },
                { icon: Sparkles, text: "Random questions and letter prompts for instant warm-ups" },
                { icon: PartyPopper, text: "Wheel of names that students love to watch spin" },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                    <f.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="leading-relaxed text-ink-600">{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn to="/for-teachers" variant="dark">
                Teacher hub <ArrowRight className="h-4 w-4" aria-hidden />
              </Btn>
              <Btn to="/random-student-picker" variant="outline">Try the student picker</Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================ STREAMERS =============================== */}
      <section className="bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="lg:order-2">
              <div className="relative">
                <img src="/images/streamers.jpg" alt="Streamer at a gaming setup with colorful lighting" loading="lazy" className="aspect-[4/3] w-full rounded-[32px] object-cover shadow-lift" />
                <div className="absolute -bottom-4 -left-3 rounded-2xl bg-white px-4 py-3 shadow-lift sm:-left-6">
                  <p className="flex items-center gap-2 text-sm font-bold text-ink-950">
                    <MonitorPlay className="h-4 w-4 text-coral-500" aria-hidden /> OBS-ready full-screen mode
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12} className="lg:order-1">
              <SectionHeading
                dark
                eyebrow="For streamers"
                title="Tools for streamers"
                sub="Make your stream interactive with a wheel that looks great on camera and a giveaway mode your chat will trust."
              />
              <ul className="mt-6 space-y-3">
                {[
                  { icon: MonitorPlay, text: "Full-screen wheel with hide-controls mode — perfect for OBS browser sources" },
                  { icon: Gift, text: "Giveaway mode: dedupe participants, multi-round draws, live reveals" },
                  { icon: Trophy, text: "Big winner displays with confetti and sound stingers" },
                  { icon: EyeOff, text: "Custom color themes to match your stream's look" },
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-coral-400">
                      <f.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="leading-relaxed text-ink-300">{f.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Btn to="/for-streamers" variant="coral">
                  Streamer hub <ArrowRight className="h-4 w-4" aria-hidden />
                </Btn>
                <Btn to="/giveaway-picker" variant="white">Run a giveaway</Btn>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================================ GIVEAWAY =============================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <img src="/images/giveaway.jpg" alt="Crowd celebrating under colorful confetti" loading="lazy" className="aspect-[4/3] w-full rounded-[32px] object-cover shadow-lift" />
          </Reveal>
          <Reveal delay={0.12}>
            <SectionHeading
              eyebrow="Giveaway mode"
              title="Run giveaways people trust"
              sub="Paste your participant list, remove duplicates, and reveal winners one by one — live, transparent, and verifiable."
            />
            <ul className="mt-6 space-y-3 text-ink-600">
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" aria-hidden /> Automatic duplicate removal for clean pools</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" aria-hidden /> Multiple rounds — previous winners leave the pool</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" aria-hidden /> Winner history you can copy and publish</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" aria-hidden /> Share results or the wheel itself by link</li>
            </ul>
            <div className="mt-8">
              <Btn to="/giveaway-picker" size="lg" variant="coral">
                <Gift className="h-5 w-5" aria-hidden /> Open the giveaway picker
              </Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================= GUIDES ================================ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Random tools guide" title="Ideas, routines & how-tos" sub="Practical articles for teachers, streamers and anyone who leaves it to chance." />
              <Btn to="/guides" variant="outline">
                All guides <ArrowRight className="h-4 w-4" aria-hidden />
              </Btn>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {GUIDES.slice(0, 3).map((g, i) => (
              <Reveal key={g.slug} delay={i * 0.08}>
                <Link to={`/guides/${g.slug}`} className="group flex h-full flex-col rounded-3xl border border-ink-100 bg-paper p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
                  <p className="text-xs font-bold tracking-wide text-brand-500 uppercase">{g.category} · {g.readTime}</p>
                  <h3 className="mt-2.5 font-display text-lg leading-snug font-bold text-balance group-hover:text-brand-600">{g.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500">{g.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-500">
                    Read guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================ CTA BAND =============================== */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-brand-500 via-brand-600 to-ink-950 px-6 py-16 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-coral-500/30 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-balance sm:text-5xl">Make random decisions more fun</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">Spin wheels, pick names, create teams, run giveaways, and decide instantly — free and fast.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Btn to="/wheel-spinner" size="lg" variant="white">
                  Create a Wheel <ArrowRight className="h-4.5 w-4.5" aria-hidden />
                </Btn>
                <Btn to="/tools" size="lg" className="border border-white/30 bg-white/10 text-white shadow-none hover:bg-white/20">
                  Explore Tools
                </Btn>
              </div>
              <p className="mt-6 text-sm font-semibold text-white/60">No sign-up. No paywalls. Just spin.</p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
