import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dices as DicesIcon, RotateCcw } from "lucide-react";
import { Btn, Card, CopyButton, Toggle, cx } from "../components/ui";
import { randInt, shuffle } from "../lib/random";
import { fireConfetti } from "../lib/confetti";
import { playPop, playWin, unlockAudio } from "../lib/sound";
import { loadSettings } from "../lib/storage";
import { usePrefersReducedMotion, useLocalStorage } from "../lib/hooks";
import { SpinTimeControl } from "./SpinTimeControl";
import { SPIN_TIME_DEFAULT, SPIN_TIME_KEY, sanitizeSpinTime, stepDelays } from "../lib/timing";

/* ------------------------------ Number generator ----------------------------- */

export function NumberTool() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(true);
  const [sort, setSort] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spinTime, setSpinTime] = useLocalStorage<number>(SPIN_TIME_KEY, SPIN_TIME_DEFAULT);
  const timer = useRef(0);
  const settings = useRef(loadSettings());
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const clamp = (v: number) => Math.max(-1_000_000_000, Math.min(1_000_000_000, v));

  const generate = () => {
    if (rolling) return;
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const span = hi - lo + 1;
    if (count < 1) {
      setError("Count must be at least 1.");
      return;
    }
    if (unique && count > span) {
      setError(`Can't draw ${count} unique numbers from a range of ${span}.`);
      return;
    }
    setError(null);
    if (settings.current.sound) unlockAudio();
    const finish = () => {
      const drawn = unique
        ? shuffle(Array.from({ length: span }, (_, i) => lo + i)).slice(0, count)
        : Array.from({ length: count }, () => randInt(lo, hi));
      const final = sort ? [...drawn].sort((a, b) => a - b) : drawn;
      setResults(final);
      setRolling(false);
      if (settings.current.sound) playWin();
      if (settings.current.confetti && count === 1) fireConfetti(0.5);
    };
    if (reduced) {
      finish();
      return;
    }
    setRolling(true);
    let steps = 0;
    const totalSteps = 9;
    const delays = stepDelays(totalSteps, sanitizeSpinTime(spinTime) * 1000);
    const tick = () => {
      setResults(Array.from({ length: count }, () => randInt(lo, hi)));
      steps++;
      if (steps >= totalSteps) {
        finish();
      } else {
        timer.current = window.setTimeout(tick, delays[steps] ?? 70);
      }
    };
    tick();
  };

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-500 uppercase">Minimum</span>
          <input type="number" value={min} onChange={(e) => setMin(clamp(Number(e.target.value) || 0))} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-brand-400" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-500 uppercase">Maximum</span>
          <input type="number" value={max} onChange={(e) => setMax(clamp(Number(e.target.value) || 0))} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-brand-400" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-500 uppercase">How many</span>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-brand-400" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-700">
          <Toggle checked={unique} onChange={setUnique} label="Unique numbers" /> Unique numbers
        </label>
        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-700">
          <Toggle checked={sort} onChange={setSort} label="Sort results" /> Sort results
        </label>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-coral-600" role="alert">{error}</p>}

      <div className="mt-6 flex min-h-[110px] flex-wrap items-center justify-center gap-3 rounded-2xl bg-ink-50/60 p-6" aria-live="polite">
        {results.length === 0 ? (
          <p className="text-sm text-ink-400">Your numbers will appear here.</p>
        ) : (
          results.map((r, i) => (
            <motion.span
              key={`${i}-${r}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className={cx("rounded-2xl bg-white px-5 py-3 font-display font-bold text-ink-950 shadow-soft", results.length === 1 ? "text-5xl" : "text-2xl")}
            >
              {r.toLocaleString()}
            </motion.span>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Btn size="lg" onClick={generate} disabled={rolling} className="min-w-44">
          {rolling ? "Drawing…" : "Generate"}
        </Btn>
        {results.length > 0 && <CopyButton text={results.join(", ")} label="Copy results" size="md" />}
      </div>
      <div className="mt-4">
        <SpinTimeControl value={sanitizeSpinTime(spinTime)} onChange={setSpinTime} />
      </div>
    </Card>
  );
}

/* --------------------------------- Dice roller ------------------------------- */

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ face, rolling }: { face: number; rolling: boolean }) {
  return (
    <motion.div
      animate={rolling ? { rotate: [0, -14, 10, -6, 0] } : { rotate: 0 }}
      transition={{ duration: 0.4, repeat: rolling ? Infinity : 0 }}
      className="grid h-20 w-20 grid-cols-3 grid-rows-3 gap-0.5 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft sm:h-24 sm:w-24"
      aria-label={`Die showing ${face}`}
    >
      {Array.from({ length: 9 }, (_, cell) => (
        <span key={cell} className="flex items-center justify-center">
          {PIPS[face]?.includes(cell) && <span className="h-3 w-3 rounded-full bg-ink-950 sm:h-3.5 sm:w-3.5" />}
        </span>
      ))}
    </motion.div>
  );
}

export function DiceTool() {
  const [count, setCount] = useState(2);
  const [faces, setFaces] = useState<number[]>([3, 5]);
  const [rolling, setRolling] = useState(false);
  const [spinTime, setSpinTime] = useLocalStorage<number>(SPIN_TIME_KEY, SPIN_TIME_DEFAULT);
  const timer = useRef(0);
  const settings = useRef(loadSettings());
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Keep the rendered dice in sync when the count changes between rolls
  useEffect(() => {
    setFaces((f) => (f.length === count ? f : Array.from({ length: count }, (_, i) => f[i] ?? randInt(1, 6))));
  }, [count]);

  const roll = () => {
    if (rolling) return;
    if (settings.current.sound) unlockAudio();
    const finish = () => {
      setFaces(Array.from({ length: count }, () => randInt(1, 6)));
      setRolling(false);
      if (settings.current.sound) playWin();
    };
    if (reduced) {
      finish();
      return;
    }
    setRolling(true);
    if (settings.current.sound) playPop();
    let steps = 0;
    const totalSteps = 10;
    const delays = stepDelays(totalSteps, sanitizeSpinTime(spinTime) * 1000);
    const tick = () => {
      setFaces(Array.from({ length: count }, () => randInt(1, 6)));
      steps++;
      if (steps >= totalSteps) {
        finish();
      } else {
        timer.current = window.setTimeout(tick, delays[steps] ?? 75);
      }
    };
    tick();
  };

  const total = faces.reduce((a, b) => a + b, 0);

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink-700">Dice</span>
          <div className="flex items-center rounded-full border border-ink-200 bg-white">
            <button type="button" aria-label="Fewer dice" onClick={() => setCount((c) => Math.max(1, c - 1))} className="px-3.5 py-1.5 text-lg font-bold text-ink-500 hover:text-ink-950">−</button>
            <span className="w-8 text-center font-display text-lg font-bold" aria-live="polite">{count}</span>
            <button type="button" aria-label="More dice" onClick={() => setCount((c) => Math.min(8, c + 1))} className="px-3.5 py-1.5 text-lg font-bold text-ink-500 hover:text-ink-950">+</button>
          </div>
        </div>
        <Btn size="lg" onClick={roll} disabled={rolling} className="min-w-36">
          <DicesIcon className="h-5 w-5" aria-hidden /> {rolling ? "Rolling…" : "Roll dice"}
        </Btn>
      </div>

      <div className="mt-6 flex min-h-[130px] flex-wrap items-center justify-center gap-3 rounded-2xl bg-ink-50/60 p-6" aria-live="polite">
        {faces.slice(0, count).map((f, i) => (
          <Die key={i} face={f} rolling={rolling} />
        ))}
      </div>

      <p className="mt-4 text-center font-display text-xl font-bold text-ink-950">
        Total: <span className="text-brand-500">{faces.length === count ? total : "—"}</span>
      </p>
      <div className="mt-4">
        <SpinTimeControl value={sanitizeSpinTime(spinTime)} onChange={setSpinTime} />
      </div>
    </Card>
  );
}

/* ---------------------------------- Coin flip -------------------------------- */

export function CoinFlipTool() {
  const [rot, setRot] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [last, setLast] = useState<"heads" | "tails" | null>(null);
  const [stats, setStats] = useState({ heads: 0, tails: 0 });
  const [spinTime, setSpinTime] = useLocalStorage<number>(SPIN_TIME_KEY, SPIN_TIME_DEFAULT);
  const timer = useRef(0);
  const settings = useRef(loadSettings());
  const reduced = usePrefersReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const durMs = sanitizeSpinTime(spinTime) * 1000;

  const flip = () => {
    if (flipping) return;
    if (settings.current.sound) unlockAudio();
    const result: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    const faceUp: "heads" | "tails" = Math.round(rot / 180) % 2 === 0 ? "heads" : "tails";
    const base = Math.max(6, Math.round(durMs / 170));
    const wantOdd = result !== faceUp;
    const halfTurns = base % 2 === (wantOdd ? 1 : 0) ? base : base + 1;

    const settle = () => {
      setFlipping(false);
      setLast(result);
      setStats((s) => ({ ...s, [result]: s[result] + 1 }));
      if (settings.current.sound) playWin();
    };

    if (reduced) {
      setRot((r) => r + halfTurns * 180);
      settle();
      return;
    }
    setFlipping(true);
    if (settings.current.sound) playPop();
    setRot((r) => r + halfTurns * 180);
    timer.current = window.setTimeout(settle, durMs);
  };

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col items-center">
        <div style={{ perspective: 900 }} className="py-6">
          <motion.div
            animate={{ rotateX: rot }}
            transition={reduced ? { duration: 0 } : { duration: durMs / 1000, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative h-44 w-44 sm:h-52 sm:w-52"
            aria-label={last ? `Coin landed on ${last}` : "Coin"}
          >
            {/* Heads */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full border-8 border-sun-300 bg-gradient-to-br from-sun-300 to-sun-500 shadow-lift" style={{ backfaceVisibility: "hidden" }}>
              <div className="flex h-[76%] w-[76%] flex-col items-center justify-center rounded-full border-4 border-sun-500/40">
                <span className="font-display text-4xl font-bold text-ink-950/80 sm:text-5xl">H</span>
                <span className="mt-1 text-[10px] font-bold tracking-[0.24em] text-ink-950/60 uppercase">Heads</span>
              </div>
            </div>
            {/* Tails */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full border-8 border-brand-300 bg-gradient-to-br from-brand-300 to-brand-500 shadow-lift" style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}>
              <div className="flex h-[76%] w-[76%] flex-col items-center justify-center rounded-full border-4 border-white/30">
                <span className="font-display text-4xl font-bold text-white sm:text-5xl">T</span>
                <span className="mt-1 text-[10px] font-bold tracking-[0.24em] text-white/80 uppercase">Tails</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div aria-live="polite" className="min-h-8">
          {last && !flipping && (
            <motion.p initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-2xl font-bold text-ink-950">
              {last === "heads" ? "Heads!" : "Tails!"}
            </motion.p>
          )}
        </div>

        <Btn size="lg" onClick={flip} disabled={flipping} className="mt-4 min-w-44">
          {flipping ? "Flipping…" : "Flip coin"}
        </Btn>

        <div className="mt-4 w-full max-w-md">
          <SpinTimeControl value={sanitizeSpinTime(spinTime)} onChange={setSpinTime} />
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-ink-600">
          <span className="rounded-full bg-sun-100 px-3.5 py-1.5">Heads {stats.heads}</span>
          <span className="rounded-full bg-brand-50 px-3.5 py-1.5">Tails {stats.tails}</span>
          <button
            type="button"
            aria-label="Reset tally"
            onClick={() => {
              setStats({ heads: 0, tails: 0 });
              setLast(null);
            }}
            className="rounded-full p-2 text-ink-400 transition hover:bg-ink-50 hover:text-ink-950"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
