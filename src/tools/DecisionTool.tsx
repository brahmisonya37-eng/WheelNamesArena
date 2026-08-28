import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, RotateCcw, X } from "lucide-react";
import { Btn, Card, CopyButton, cx } from "../components/ui";
import { usePickAnimation } from "./usePickAnimation";
import { SpinTimeControl } from "./SpinTimeControl";
import { useLocalStorage } from "../lib/hooks";
import { fireConfetti } from "../lib/confetti";
import { loadSettings } from "../lib/storage";
import { SPIN_TIME_DEFAULT, SPIN_TIME_KEY, sanitizeSpinTime } from "../lib/timing";

const MAX_OPTIONS = 12;

export default function DecisionTool() {
  const [options, setOptions] = useLocalStorage<string[]>("da.decision", ["Order takeout", "Cook at home", "Go out somewhere"]);
  const [spinTime, setSpinTime] = useLocalStorage<number>(SPIN_TIME_KEY, SPIN_TIME_DEFAULT);
  const [draft, setDraft] = useState("");
  const [winner, setWinner] = useState<string | null>(null);

  const { display, phase, run } = usePickAnimation({
    sound: loadSettings().sound,
    onSettle: (w) => {
      setWinner(w);
      if (loadSettings().confetti) fireConfetti(0.6);
    },
  });

  const addOption = () => {
    const v = draft.trim();
    if (!v || options.length >= MAX_OPTIONS) return;
    if (options.some((o) => o.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    setOptions((o) => [...o, v]);
    setDraft("");
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* Options editor */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-bold">
          Your options <span className="text-sm font-semibold text-ink-400">({options.length}/{MAX_OPTIONS})</span>
        </h2>
        <div className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOption()}
            placeholder="Add an option…"
            aria-label="Add an option"
            className="w-full min-w-0 rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-300"
          />
          <Btn onClick={addOption} disabled={!draft.trim() || options.length >= MAX_OPTIONS} aria-label="Add option">
            <Plus className="h-4 w-4" aria-hidden />
          </Btn>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Options">
          <AnimatePresence>
            {options.map((o) => (
              <motion.li key={o} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <span
                  className={cx(
                    "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    winner === o && phase === "done" ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 bg-white text-ink-800",
                  )}
                >
                  {o}
                  <button type="button" aria-label={`Remove ${o}`} onClick={() => setOptions((list) => list.filter((x) => x !== o))} className="text-ink-300 transition hover:text-coral-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {options.length === 0 && <p className="mt-4 text-sm text-ink-400">Add at least two options to decide between.</p>}
      </Card>

      {/* Reveal */}
      <Card className="p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-ink-400 uppercase">The verdict</p>
        <div className="flex min-h-[170px] items-center justify-center py-6" aria-live="polite">
          {display === null ? (
            <p className="text-center text-lg text-ink-300">Add options, then let chance decide.</p>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.p
                key={display + (phase === "done" ? "-d" : "")}
                initial={{ scale: phase === "done" ? 0.7 : 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cx("max-w-full font-display font-bold break-words text-balance", phase === "done" ? "text-4xl text-brand-500 sm:text-5xl" : "text-3xl text-ink-400 sm:text-4xl")}
              >
                {display}
              </motion.p>
            </AnimatePresence>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Btn size="lg" onClick={() => run(options, sanitizeSpinTime(spinTime) * 1000)} disabled={options.length < 2 || phase === "rolling"} className="min-w-44">
            {phase === "rolling" ? "Deciding…" : winner ? "Run it back" : "Decide for me"}
          </Btn>
          {phase === "done" && winner && (
            <>
              <CopyButton text={winner} label="Copy" size="md" />
              <Btn variant="outline" size="md" onClick={() => run(options, sanitizeSpinTime(spinTime) * 1000)}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Again
              </Btn>
            </>
          )}
        </div>
        <div className="mt-4">
          <SpinTimeControl value={sanitizeSpinTime(spinTime)} onChange={setSpinTime} />
        </div>
        <p className="mt-5 text-center text-xs text-ink-400">Every option has an equal chance. Accept the verdict — or run it back.</p>
      </Card>
    </div>
  );
}
