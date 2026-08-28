import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Trash2 } from "lucide-react";
import { Btn, Card, CopyButton, Toggle, cx } from "../components/ui";
import { SpinTimeControl } from "./SpinTimeControl";
import { useLocalStorage } from "../lib/hooks";
import { dedupe, parseList, sampleUnique } from "../lib/random";
import { fireConfetti } from "../lib/confetti";
import { playCelebration, playTick, unlockAudio } from "../lib/sound";
import { loadSettings } from "../lib/storage";
import { usePrefersReducedMotion } from "../lib/hooks";
import { SPIN_TIME_DEFAULT, SPIN_TIME_KEY, sanitizeSpinTime, stepDelays } from "../lib/timing";

interface Round {
  winners: string[];
  at: number;
}

export default function GiveawayTool() {
  const [text, setText] = useLocalStorage<string>("da.giveaway", "");
  const [spinTime, setSpinTime] = useLocalStorage<number>(SPIN_TIME_KEY, SPIN_TIME_DEFAULT);
  const [dedupeOn, setDedupeOn] = useState(true);
  const [removeWinners, setRemoveWinners] = useState(true);
  const [winnerCount, setWinnerCount] = useState(1);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [phase, setPhase] = useState<"idle" | "rolling" | "revealed">("idle");
  const [cycling, setCycling] = useState<string | null>(null);
  const [winners, setWinners] = useState<string[]>([]);
  const timer = useRef(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const rawEntries = useMemo(() => parseList(text), [text]);
  const pool = useMemo(() => {
    const base = dedupeOn ? dedupe(rawEntries) : rawEntries;
    const ex = new Set(excluded.map((e) => e.toLowerCase()));
    return base.filter((e) => !ex.has(e.toLowerCase()));
  }, [rawEntries, dedupeOn, excluded]);

  const duplicates = rawEntries.length - dedupe(rawEntries).length;

  const draw = () => {
    if (phase === "rolling" || pool.length === 0) return;
    const k = Math.min(winnerCount, pool.length);
    const settings = loadSettings();
    if (settings.sound) unlockAudio(); // unlock inside the tap for mobile browsers
    const finish = () => {
      const drawn = sampleUnique(pool, k);
      setWinners(drawn);
      setPhase("revealed");
      setRounds((r) => [{ winners: drawn, at: Date.now() }, ...r].slice(0, 12));
      if (removeWinners) setExcluded((ex) => [...ex, ...drawn]);
      if (settings.sound) playCelebration();
      if (settings.confetti) fireConfetti(1.2);
    };
    if (reduced) {
      finish();
      return;
    }
    setPhase("rolling");
    setWinners([]);
    let steps = 0;
    const totalSteps = 14;
    const delays = stepDelays(totalSteps, sanitizeSpinTime(spinTime) * 1000);
    const tick = () => {
      setCycling(pool[Math.floor(Math.random() * pool.length)]);
      if (settings.sound && steps % 2 === 0) playTick();
      steps++;
      if (steps < totalSteps) {
        timer.current = window.setTimeout(tick, delays[steps] ?? 80);
      } else {
        finish();
      }
    };
    tick();
  };

  const resetRounds = () => {
    setRounds([]);
    setExcluded([]);
    setWinners([]);
    setPhase("idle");
  };

  const resultsText = rounds.length > 0 ? rounds.map((r, i) => `Round ${rounds.length - i}: ${r.winners.join(", ")}`).join("\n") : winners.join(", ");

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* Participants */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            Participants <span className="text-sm font-semibold text-ink-400">({pool.length})</span>
          </h2>
          <button
            type="button"
            title="Clear participants"
            aria-label="Clear participants"
            onClick={() => {
              setText("");
              resetRounds();
            }}
            className="rounded-lg p-2 text-ink-500 transition hover:bg-ink-50 hover:text-coral-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          placeholder={"Paste participants — one per line.\nComments, emails, ticket numbers… anything."}
          aria-label="Participant list"
          className="thin-scroll mt-3 w-full resize-y rounded-2xl border border-ink-200 bg-ink-50/40 p-4 font-mono text-sm leading-relaxed outline-none focus:border-brand-300 focus:bg-white"
        />
        {duplicates > 0 && (
          <p className="mt-2 text-xs font-semibold text-sun-500">
            {duplicates} duplicate {duplicates === 1 ? "entry" : "entries"} detected {dedupeOn ? "— ignored" : "— enable duplicate removal"}.
          </p>
        )}

        <div className="mt-4 space-y-3 rounded-2xl bg-ink-50 p-4">
          <label className="flex items-center justify-between gap-3 text-sm font-semibold text-ink-800">
            Remove duplicates
            <Toggle checked={dedupeOn} onChange={setDedupeOn} label="Remove duplicates" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm font-semibold text-ink-800">
            Remove winners from pool (multi-round)
            <Toggle checked={removeWinners} onChange={setRemoveWinners} label="Remove winners from pool" />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink-800">Winners per draw</span>
            <div className="flex items-center rounded-full border border-ink-200 bg-white">
              <button type="button" aria-label="Fewer winners" onClick={() => setWinnerCount((c) => Math.max(1, c - 1))} className="px-3 py-1 text-lg font-bold text-ink-500 hover:text-ink-950">−</button>
              <span className="w-8 text-center font-display text-lg font-bold">{winnerCount}</span>
              <button type="button" aria-label="More winners" onClick={() => setWinnerCount((c) => Math.min(10, c + 1))} className="px-3 py-1 text-lg font-bold text-ink-500 hover:text-ink-950">+</button>
            </div>
          </div>
        </div>

        <Btn size="lg" variant="coral" onClick={draw} disabled={pool.length === 0 || phase === "rolling"} className="mt-5 w-full">
          <Gift className="h-5 w-5" aria-hidden /> {phase === "rolling" ? "Drawing…" : "Draw winners"}
        </Btn>
        <div className="mt-3">
          <SpinTimeControl value={sanitizeSpinTime(spinTime)} onChange={setSpinTime} />
        </div>
        {pool.length === 0 && <p className="mt-2 text-center text-xs text-ink-400">Paste participants to begin.</p>}
      </Card>

      {/* Stage + history */}
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-coral-500 to-brand-500 p-6 text-center sm:p-8">
            <p className="text-xs font-bold tracking-[0.22em] text-white/80 uppercase">Live draw</p>
            <div className="flex min-h-[120px] items-center justify-center" aria-live="polite">
              {phase === "idle" && <p className="text-lg font-semibold text-white/70">Winners will be revealed here.</p>}
              {phase === "rolling" && cycling && (
                <p className="font-display text-3xl font-bold text-white/90 sm:text-4xl">{cycling}</p>
              )}
              {phase === "revealed" && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {winners.map((w, i) => (
                    <motion.span
                      key={`${w}-${i}`}
                      initial={{ scale: 0.5, opacity: 0, y: 16 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.18, type: "spring", stiffness: 300, damping: 20 }}
                      className="rounded-2xl bg-white px-6 py-4 font-display text-2xl font-bold text-ink-950 shadow-lift sm:text-3xl"
                    >
                      🏆 {w}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
            {phase === "revealed" && (
              <div className="mt-2 flex justify-center">
                <CopyButton text={winners.join(", ")} label="Copy winners" variant="white" />
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Winner history</h2>
            {rounds.length > 0 && (
              <div className="flex items-center gap-2">
                <CopyButton text={resultsText} label="Copy all" />
                <button type="button" onClick={resetRounds} className="text-xs font-semibold text-ink-400 transition hover:text-coral-600">
                  Reset rounds
                </button>
              </div>
            )}
          </div>
          {rounds.length === 0 ? (
            <p className="text-sm text-ink-400">No draws yet. Run multiple rounds to give away several prizes.</p>
          ) : (
            <ol className="thin-scroll max-h-64 space-y-2 overflow-y-auto">
              <AnimatePresence>
                {rounds.map((r, i) => (
                  <motion.li
                    key={r.at}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cx("rounded-2xl px-4 py-3", i === 0 ? "bg-brand-50" : "bg-ink-50")}
                  >
                    <p className="text-[11px] font-bold tracking-wide text-ink-400 uppercase">
                      Round {rounds.length - i} · {new Date(r.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink-900">{r.winners.join(", ")}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
