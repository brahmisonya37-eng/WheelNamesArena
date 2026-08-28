import { ArrowRight, EyeOff, Gift, MonitorPlay, PartyPopper, Share2, Trophy } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Faq } from "../components/Faq";
import { Btn, SectionHeading } from "../components/ui";
import { ToolCard } from "../components/ToolCard";
import { getTool } from "../lib/tools";
import { usePageMeta } from "../lib/usePageMeta";

const STREAMER_TOOLS = ["wheel-spinner", "giveaway-picker", "random-number-generator", "coin-flip", "yes-no-picker", "random-choice-picker"];

const FAQ = [
  { q: "How do I show the wheel in OBS?", a: "Open the wheel, press the full-screen button, then capture the browser window in OBS (Window Capture). For a cleaner look, enable Hide controls before you go live." },
  { q: "Can chat see the wheel entries before the spin?", a: "Yes — everything is visible on screen: entries, the spin, and the winner. That transparency is what makes draws feel fair to viewers." },
  { q: "Is the giveaway draw really random?", a: "Yes. Winners are drawn with a uniform random sample from your cleaned participant pool, and previous winners are excluded between rounds when multi-round mode is on." },
  { q: "Do I need an account or software?", a: "No account, no downloads. Everything runs in your browser and saves locally." },
  { q: "Can I match the wheel to my stream branding?", a: "Yes — switch between five color themes (classic, neon, pastel, sunset and mono) right from the wheel controls." },
];

export default function StreamersPage() {
  usePageMeta({
    title: "Tools for Streamers — Wheels, Giveaways & OBS Mode | WheelNamesArena",
    description: "Free streamer tools: full-screen spinning wheel with hide-controls mode, live giveaway draws with duplicate removal, and interactive pickers for chat.",
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="absolute bottom-0 -left-24 h-72 w-72 rounded-full bg-coral-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-coral-400">
              <MonitorPlay className="h-4 w-4" aria-hidden /> Streamer hub
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
              Tools for streamers
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-300">
              Interactive segments your chat will actually remember: a camera-ready wheel, transparent giveaway draws, and quick pickers for dares, games and decisions.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Btn to="/wheel-spinner" size="lg" variant="coral">
                Open full-screen wheel <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </Btn>
              <Btn to="/giveaway-picker" size="lg" className="border border-white/25 bg-white/10 text-white shadow-none hover:bg-white/20">
                Giveaway mode
              </Btn>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <img src="/images/streamers.jpg" alt="Streamer at a gaming setup with RGB lighting" className="aspect-[4/3] w-full rounded-[32px] object-cover shadow-lift" />
          </Reveal>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Built for live" title="Everything you need for an interactive segment" />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MonitorPlay, title: "Full-screen wheel", text: "A big, bold wheel that fills the frame and looks great in any scene." },
            { icon: EyeOff, title: "Hide controls", text: "One tap removes every button and panel — just the wheel and the spin." },
            { icon: Gift, title: "Giveaway mode", text: "Dedupe participants, draw multiple rounds, reveal winners with confetti." },
            { icon: Trophy, title: "Winner display", text: "A dramatic winner card with sound stingers your chat can react to." },
            { icon: PartyPopper, title: "Confetti + sounds", text: "Celebration effects with toggles, so you control the vibe." },
            { icon: Share2, title: "Share wheels", text: "Send a wheel link to mods or collaborators — entries travel with it." },
            { icon: EyeOff, title: "Custom themes", text: "Classic, neon, pastel, sunset or mono — match your overlay." },
            { icon: MonitorPlay, title: "OBS friendly", text: "Capture the browser window directly. No plugins, no accounts." },
          ].map((f, i) => (
            <Reveal key={f.title + i} delay={Math.min(i * 0.05, 0.25)}>
              <div className="h-full rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3.5 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Streamer toolbox" title="Six tools that make great segments" />
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STREAMER_TOOLS.map((slug, i) => {
              const t = getTool(slug);
              if (!t) return null;
              return (
                <Reveal key={slug} delay={i * 0.05}>
                  <ToolCard tool={t} />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading center eyebrow="Streamer FAQ" title="Before you go live" />
        </Reveal>
        <div className="mt-8">
          <Faq items={FAQ} />
        </div>
        <div className="mt-10 text-center">
          <Btn to="/guides/how-to-run-a-giveaway" variant="outline">
            Read: how to run a giveaway draw
          </Btn>
        </div>
      </section>
    </div>
  );
}
