import { Link } from "react-router-dom";
import { ArrowRight, Dices, GraduationCap, LayoutGrid, ListChecks, MessageCircleQuestion, Users } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Faq } from "../components/Faq";
import { Btn, SectionHeading } from "../components/ui";
import { ToolCard } from "../components/ToolCard";
import { getTool } from "../lib/tools";
import { usePageMeta } from "../lib/usePageMeta";

const TEACHER_TOOLS = ["random-student-picker", "random-team-generator", "random-group-generator", "wheel-spinner", "random-question-generator", "dice-roller"];

const FAQ = [
  { q: "Is WheelNamesArena free for teachers?", a: "Completely. Every tool is free forever, with no accounts, subscriptions or paywalls. No school budget required." },
  { q: "Do my students need accounts?", a: "No. Nothing on WheelNamesArena requires an account — for you or your students. Open a tool and it works." },
  { q: "Where is my class roster stored?", a: "Only in your browser's local storage on your device. It is never uploaded to a server, which makes it privacy-friendly for classroom use." },
  { q: "Can I project the tools on a whiteboard?", a: "Yes — the wheel and pickers have full-screen mode and large, readable type designed to be visible from the back of the room." },
  { q: "Does it work on tablets and Chromebooks?", a: "Yes. WheelNamesArena is mobile-first and touch-optimized, so it runs smoothly on any modern browser." },
];

export default function TeachersPage() {
  usePageMeta({
    title: "Random Tools for Teachers — Student Pickers, Teams & More | WheelNamesArena",
    description: "Free classroom randomizers: random student picker, team generator, question prompts and a wheel of names. Fair, fast and fun — no sign-up required.",
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-mint-100/50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-mint-600 shadow-sm">
              <GraduationCap className="h-4 w-4" aria-hidden /> Teacher hub
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
              Random tools for teachers
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-500">
              Fair calling, instant groups, zero prep. WheelNamesArena's classroom randomizers keep every student engaged — and make randomness feel like a game, not a lottery.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Btn to="/random-student-picker" size="lg">
                Open the student picker <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </Btn>
              <Btn to="/random-team-generator" size="lg" variant="outline">Make teams</Btn>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <img src="/images/teachers.jpg" alt="Students raising their hands in a classroom" className="aspect-[4/3] w-full rounded-[32px] object-cover shadow-lift" />
          </Reveal>
        </div>
      </section>

      {/* Tool grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Classroom favorites" title="Everything a random classroom needs" sub="Six tools that cover calling, grouping, questioning and celebrating." />
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEACHER_TOOLS.map((slug, i) => {
            const t = getTool(slug);
            if (!t) return null;
            return (
              <Reveal key={slug} delay={i * 0.05}>
                <ToolCard tool={t} />
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Routines */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading center eyebrow="Routines that work" title="Four ways to use randomness tomorrow" />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: GraduationCap, title: "Fair calling", text: "Pick students at random with set-aside mode so every voice is heard once per round." },
              { icon: Users, title: "Instant groups", text: "Split the class into balanced teams or pairs in one click — no negotiations." },
              { icon: MessageCircleQuestion, title: "Bell-ringer questions", text: "Draw a random discussion question to start the lesson with energy." },
              { icon: Dices, title: "Let dice decide", text: "Roll for question numbers, revision minutes, or which team answers first." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <div className="h-full rounded-3xl border border-ink-100 bg-paper p-6 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 text-mint-600">
                    <f.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3.5 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading center eyebrow="Teacher FAQ" title="Questions teachers ask" />
        </Reveal>
        <div className="mt-8">
          <Faq items={FAQ} />
        </div>
        <div className="mt-10 text-center">
          <Btn to="/guides/classroom-randomizer-ideas" variant="outline">
            <ListChecks className="h-4 w-4" aria-hidden /> 21 classroom randomizer ideas
          </Btn>
        </div>
      </section>
    </div>
  );
}
