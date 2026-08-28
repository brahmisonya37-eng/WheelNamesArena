import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Btn, Card, cx } from "../components/ui";
import { SpinTimeControl } from "./SpinTimeControl";
import { fireConfetti } from "../lib/confetti";
import { playCelebration, playTick, unlockAudio } from "../lib/sound";
import { loadSettings } from "../lib/storage";
import { useLocalStorage, usePrefersReducedMotion } from "../lib/hooks";
import { SPIN_TIME_DEFAULT, SPIN_TIME_KEY, sanitizeSpinTime, stepDelays } from "../lib/timing";

export default function YesNoTool() {
  const [question, setQuestion] = useState("");
  const [spinTime, setSpinTime] = useLocalStorage<number>(SPIN_TIME_KEY, SPIN_TIME_DEFAULT);
  const [answer, setAnswer] = useState<"YES" | "NO" | null>(null);
  const [cycling, setCycling] = useState<"YES" | "NO" | null>(null);
  const [rolling, setRolling] = useState(false);
  const [stats, setStats] = useState({ yes: 0, no: 0 });
  const timer = useRef(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const decide = () => {
    if (rolling) return;
    const settings = loadSettings();
    if (settings.sound) unlockAudio();
    const result: "YES" | "NO" = Math.random() < 0.5 ? "YES" : "NO";
    const finish = () => {
      setCycling(null);
      setAnswer(result);
      setRolling(false);
      setStats((s) => (result === "YES" ? { ...s, yes: s.yes + 1 } : { ...s, no: s.no + 1 }));
      if (settings.sound) playCelebration();
      if (settings.confetti) fireConfetti(0.5);
    };
    if (reduced) {
      finish();
      return;
    }
    setRolling(true);
    setAnswer(null);
    let step = 0;
    const total = 12;
    const delays = stepDelays(total, sanitizeSpinTime(spinTime) * 1000);
    const tick = () => {
      setCycling(step % 2 === 0 ? "YES" : "NO");
      if (settings.sound && step % 3 === 0) playTick();
      step++;
      if (step < total) {
        timer.current = window.setTimeout(tick, delays[step] ?? 80);
      } else {
        finish();
      }
    };
    tick();
  };

  const shown = rolling ? cycling : answer;

  return (
    <Card className="p-6 sm:p-10">
      <div className="mx-auto max-w-xl text-center">
        <label htmlFor="yn-question" className="mb-2 block text-xs font-bold tracking-[0.18em] text-ink-400 uppercase">
          Your question
        </label>
        <input
          id="yn-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && decide()}
          placeholder="Should I do it?"
          className="w-full rounded-2xl border border-ink-200 bg-ink-50/40 px-5 py-3.5 text-center text-lg font-semibold outline-none focus:border-brand-300 focus:bg-white"
        />

        <div
          className="mt-8 flex min-h-[170px] items-center justify-center rounded-3xl bg-ink-50/60 p-8"
          aria-live="assertive"
        >
          {shown === null ? (
            <p className="text-sm text-ink-400">A decisive YES or NO will appear here. No maybes.</p>
          ) : (
            <motion.p
              key={shown + (rolling ? "-c" : "")}
              initial={{ scale: rolling ? 0.92 : 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className={cx(
                "font-display text-7xl font-bold tracking-tight sm:text-8xl",
                rolling ? "text-ink-300" : shown === "YES" ? "text-mint-500" : "text-coral-500",
              )}
            >
              {shown}
            </motion.p>
          )}
        </div>

        <Btn size="lg" onClick={decide} disabled={rolling} className="mt-6 min-w-52">
          {rolling ? "Consulting fate…" : answer ? "Ask again" : "Get my answer"}
        </Btn>

        <div className="mt-4">
          <SpinTimeControl value={sanitizeSpinTime(spinTime)} onChange={setSpinTime} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-sm font-semibold text-ink-600">
          <span className="rounded-full bg-mint-100 px-3.5 py-1.5">YES {stats.yes}</span>
          <span className="rounded-full bg-coral-100 px-3.5 py-1.5">NO {stats.no}</span>
        </div>
      </div>
    </Card>
  );
}
