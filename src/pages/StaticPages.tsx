import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import { Btn, Card } from "../components/ui";
import { usePageMeta } from "../lib/usePageMeta";

function ProsePage({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-3 text-lg text-ink-500">{sub}</p>}
      </header>
      <div className="space-y-6 leading-relaxed text-ink-600 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink-950 [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------- About ---------------------------------- */

export function AboutPage() {
  usePageMeta({
    title: "About WheelNamesArena — Free Random Tools for Every Decision",
    description: "WheelNamesArena is a free platform for random decision-making: wheel spinning, random pickers, team generators and classroom tools. No accounts, no paywalls.",
  });
  return (
    <ProsePage title="About WheelNamesArena" sub="Free random tools for every decision.">
      <p>
        WheelNamesArena exists for one simple reason: decisions are everywhere, and some of them are better left to chance. What to eat, who goes first, which team you're on, who wins the giveaway — randomness settles these fairly, quickly, and with a lot more fun than arguing.
      </p>
      <p>
        We built the platform we wanted to use: a wheel spinner that feels great to spin, pickers that reveal winners with a bit of theater, team generators that are genuinely balanced, and giveaway tools that viewers can trust. Everything runs in your browser, saves locally, and works beautifully on phones.
      </p>
      <h2>Our promises</h2>
      <ul>
        <li><strong>Free forever.</strong> No subscriptions, no paywalls, no premium tiers hiding basic features.</li>
        <li><strong>No accounts.</strong> Nothing requires registration. Open a tool and use it.</li>
        <li><strong>Private by design.</strong> Your lists live in your browser's local storage. We don't collect or store your entries.</li>
        <li><strong>Fast and accessible.</strong> Lightweight pages, keyboard support, and reduced-motion friendly animations.</li>
      </ul>
      <h2>Who it's for</h2>
      <p>
        Teachers running fair classrooms. Streamers making giveaways people trust. Students settling debates. Businesses picking raffle winners. Anyone who's ever said “okay, let's just flip a coin.”
      </p>
      <p>
        Have an idea for a tool we should build? <Link to="/contact" className="font-semibold text-brand-500 underline-offset-4 hover:underline">Tell us</Link> — we read everything.
      </p>
    </ProsePage>
  );
}

/* ---------------------------------- Privacy --------------------------------- */

export function PrivacyPage() {
  usePageMeta({
    title: "Privacy Policy | WheelNamesArena",
    description: "WheelNamesArena privacy policy: your entries are stored locally in your browser, we collect minimal data, and we never sell personal information.",
  });
  return (
    <ProsePage title="Privacy Policy" sub="Last updated: February 2025">
      <p>The short version: WheelNamesArena is built to know as little about you as possible. Your wheels, lists and settings are stored in your browser's local storage on your device — they are not uploaded to our servers.</p>
      <h2>Data you create</h2>
      <p>Entries you add to wheels, rosters, giveaway lists and saved wheels are stored locally in your browser (localStorage). They never leave your device except when you deliberately share a wheel link — the link itself contains the encoded entries, so only send links to people you want to see them.</p>
      <h2>Data we collect</h2>
      <ul>
        <li>We do not require accounts and do not collect names, emails or profiles.</li>
        <li>We may collect anonymous, aggregated usage statistics (such as page views) to understand which tools are useful.</li>
        <li>If you contact us, we keep your message and contact details solely to reply.</li>
      </ul>
      <h2>Cookies & storage</h2>
      <p>We use browser localStorage for your preferences and lists. We do not use tracking cookies or sell data to advertisers. If we ever show ads, they will be non-intrusive and will not track you across the web.</p>
      <h2>Your control</h2>
      <p>You can clear everything WheelNamesArena stores at any time by clearing your browser's site data for this website. Tools also include their own clear/reset buttons.</p>
      <h2>Questions?</h2>
      <p>
        Contact us via the <Link to="/contact" className="font-semibold text-brand-500 underline-offset-4 hover:underline">contact page</Link>.
      </p>
    </ProsePage>
  );
}

/* ----------------------------------- Terms ---------------------------------- */

export function TermsPage() {
  usePageMeta({
    title: "Terms of Use | WheelNamesArena",
    description: "Terms of use for WheelNamesArena — free random tools provided as-is, for lawful use, without warranty of specific outcomes.",
  });
  return (
    <ProsePage title="Terms of Use" sub="Last updated: February 2025">
      <p>By using WheelNamesArena you agree to these terms. They're short because the service is simple.</p>
      <h2>The service</h2>
      <p>WheelNamesArena provides free, browser-based random decision tools. The service is provided “as is” without warranties of any kind. Random outcomes are generated by standard browser random number facilities and are suitable for games, classrooms and casual giveaways.</p>
      <h2>Fair use</h2>
      <ul>
        <li>Use the tools lawfully. Don't use them for gambling where prohibited, or to run contests that require regulated drawing mechanisms.</li>
        <li>Don't attempt to disrupt, overload or reverse-engineer the service.</li>
        <li>You are responsible for the content of lists you create and share.</li>
      </ul>
      <h2>No accounts, no payments</h2>
      <p>The service is free. We do not currently offer paid features, and nothing in these terms creates a paid relationship.</p>
      <h2>Liability</h2>
      <p>To the maximum extent permitted by law, WheelNamesArena is not liable for outcomes of decisions made with the tools, lost data in your browser, or anything else arising from use of the service.</p>
      <h2>Changes</h2>
      <p>We may update these terms as the service evolves. Material changes will be reflected by the “last updated” date above.</p>
    </ProsePage>
  );
}

/* ---------------------------------- Contact --------------------------------- */

export function ContactPage() {
  usePageMeta({
    title: "Contact | WheelNamesArena",
    description: "Get in touch with the WheelNamesArena team — feedback, tool ideas, bug reports and partnership questions.",
  });
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight">Contact</h1>
        <p className="mt-3 text-lg text-ink-500">Tool ideas, bug reports, feedback — we read everything.</p>
      </header>

      {sent ? (
        <Card className="p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-mint-500" aria-hidden />
          <h2 className="mt-4 font-display text-2xl font-bold">Message received!</h2>
          <p className="mt-2 text-ink-500">Thanks for writing in. We typically reply within a couple of days.</p>
          <Btn className="mt-6" variant="outline" onClick={() => setSent(false)}>Send another</Btn>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-500 uppercase">Name</span>
                <input required name="name" autoComplete="name" className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-300" placeholder="Your name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-500 uppercase">Email</span>
                <input required type="email" name="email" autoComplete="email" className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-300" placeholder="you@example.com" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-500 uppercase">Message</span>
              <textarea required name="message" rows={6} className="w-full resize-y rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-300" placeholder="What's on your mind?" />
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <Btn size="lg" type="submit">Send message</Btn>
              <p className="flex items-center gap-1.5 text-sm text-ink-400">
                <Mail className="h-4 w-4" aria-hidden /> or write to hello@wheelnamesarena.tools
              </p>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

/* ---------------------------------- Not found -------------------------------- */

export function NotFoundPage() {
  usePageMeta({
    title: "Page not found | WheelNamesArena",
    description: "This page spun off the wheel. Head back to WheelNamesArena's free random tools.",
  });
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-display text-8xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">This page spun off the wheel</h1>
      <p className="mt-3 text-ink-500">Whatever you were looking for, chance says you should try one of these instead:</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Btn to="/">Go home</Btn>
        <Btn to="/wheel-spinner" variant="outline">Spin a wheel</Btn>
        <Btn to="/tools" variant="outline">Browse tools</Btn>
      </div>
    </div>
  );
}
