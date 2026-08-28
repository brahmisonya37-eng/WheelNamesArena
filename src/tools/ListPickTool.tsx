import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Shuffle, Trash2, Volume2, VolumeX } from "lucide-react";
import { Btn, Card, CopyButton, Toggle, cx } from "../components/ui";
import { usePickAnimation } from "./usePickAnimation";
import { SpinTimeControl } from "./SpinTimeControl";
import { useLocalStorage } from "../lib/hooks";
import { parseList, shuffle } from "../lib/random";
import { fireConfetti } from "../lib/confetti";
import { loadSettings, saveSettings } from "../lib/storage";
import type { Settings } from "../lib/storage";
import { SPIN_TIME_DEFAULT, SPIN_TIME_KEY, sanitizeSpinTime } from "../lib/timing";

interface ListPickToolProps {
  storageKey: string;
  nounPlural: string;
  cta: string;
  defaults: string[];
  accent: string;
  placeholder?: string;
  /** When enabled, winners can be moved to a set-aside list (no double picks). */
  allowSetAside?: boolean;
  setAsideDefault?: boolean;
  setAsideNoun?: string;
}

export default function ListPickTool({
  storageKey,
  nounPlural,
  cta,
  defaults,
  accent,
  placeholder,
  allowSetAside = false,
  setAsideDefault = false,
  setAsideNoun = "set aside",
}: ListPickToolProps) {
  const [text, setText] = useLocalStorage<string>(storageKey, defaults.join("\n"));
  const [setAside, setSetAside] = useLocalStorage<string[]>(`${storageKey}.aside`, []);
  const [spinTime, setSpinTime] = useLocalStorage<number>(SPIN_TIME_KEY, SPIN_TIME_DEFAULT);
  const [setAsideOn, setSetAsideOn] = useState(setAsideDefault);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [history, setHistory] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  const allEntries = useMemo(() => parseList(text), [text]);
  const asideSet = useMemo(() => new Set(setAside.map((s) => s.toLowerCase())), [setAside]);
  const pool = useMemo(() => allEntries.filter((e) => !asideSet.has(e.toLowerCase())), [allEntries, asideSet]);

  const { display, phase, run } = usePickAnimation({
    sound: settings.sound,
    onSettle: (w) => {
      setWinner(w);
      setHistory((h) => [w, ...h].slice(0, 12));
      if (settings.confetti) fireConfetti(0.7);
      if (setAsideOn) setSetAside((s) => (s.includes(w) ? s : [...s, w]));
    },
  });

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      saveSettings(next);
      return next;
    });
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* Reveal card */}
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }} aria-hidden />
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-[0.18em] text-ink-400 uppercase">Result</p>
          <button
            type="button"
            onClick={() => updateSettings({ sound: !settings.sound })}
            aria-label={settings.sound ? "Mute sounds" : "Enable sounds"}
            aria-pressed={settings.sound}
            className="rounded-full p-2 text-ink-400 transition hover:bg-ink-50 hover:text-ink-950"
          >
            {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>

        <div ref={displayRef} className="flex min-h-[150px] items-center justify-center py-6" aria-live="polite">
          {display === null ? (
            <p className="text-center text-lg text-ink-300">Add your {nounPlural}, then press the button.</p>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.p
                key={display + (phase === "done" ? "-done" : "")}
                initial={{ scale: phase === "done" ? 0.7 : 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.16 }}
                className={cx("max-w-full font-display font-bold break-words text-balance", phase === "done" ? "text-4xl sm:text-5xl" : "text-3xl text-ink-400 sm:text-4xl")}
                style={phase === "done" ? { color: accent } : undefined}
              >
                {display}
              </motion.p>
            </AnimatePresence>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Btn size="lg" onClick={() => run(pool, sanitizeSpinTime(spinTime) * 1000)} disabled={pool.length === 0 || phase === "rolling"} className="min-w-44 hover:brightness-110 active:brightness-95" style={{ background: accent }}>
            {phase === "rolling" ? "Picking…" : cta}
          </Btn>
          {phase === "done" && winner && (
            <>
              <CopyButton text={winner} label="Copy" size="md" />
              <Btn variant="outline" size="md" onClick={() => run(pool, sanitizeSpinTime(spinTime) * 1000)} disabled={pool.length === 0}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Pick again
              </Btn>
            </>
          )}
        </div>

        <div className="mt-4">
          <SpinTimeControl value={sanitizeSpinTime(spinTime)} onChange={setSpinTime} />
        </div>

        {pool.length === 0 && allEntries.length > 0 && (
          <p className="mt-4 text-center text-sm text-ink-400">
            Everyone is set aside. <button type="button" className="font-semibold underline" onClick={() => setSetAside([])}>Restore all</button>.
          </p>
        )}

        {history.length > 0 && (
          <div className="mt-6 border-t border-ink-100 pt-4">
            <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-ink-400 uppercase">Recent picks</p>
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <span key={`${h}-${i}`} className="rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold text-ink-600">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* List editor */}
      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            Your {nounPlural} <span className="text-sm font-semibold text-ink-400">({pool.length})</span>
          </h2>
          <div className="flex gap-1">
            <button type="button" title="Shuffle list" aria-label="Shuffle list" onClick={() => setText(shuffle(allEntries).join("\n"))} className="rounded-lg p-2 text-ink-500 transition hover:bg-ink-50 hover:text-ink-950">
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Clear list"
              aria-label="Clear list"
              onClick={() => {
                setText("");
                setSetAside([]);
              }}
              className="rounded-lg p-2 text-ink-500 transition hover:bg-ink-50 hover:text-coral-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          placeholder={placeholder ?? `One ${nounPlural.replace(/s$/, "")} per line…`}
          aria-label={`List of ${nounPlural}`}
          className="thin-scroll w-full resize-y rounded-2xl border border-ink-200 bg-ink-50/40 p-4 font-mono text-sm leading-relaxed outline-none focus:border-brand-300 focus:bg-white"
        />
        <p className="mt-2 text-xs text-ink-400">One entry per line. Saved automatically in your browser.</p>

        {allowSetAside && (
          <div className="mt-4 rounded-2xl bg-ink-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink-800">Set picked {nounPlural} aside</span>
              <Toggle checked={setAsideOn} onChange={setSetAsideOn} label="Set picked entries aside" />
            </div>
            <p className="mt-1 text-xs text-ink-400">Prevents the same {nounPlural.replace(/s$/, "")} being picked twice in a round.</p>
            {setAside.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1.5">
                  {setAside.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink-500 shadow-sm">
                      {s}
                      <button type="button" aria-label={`Restore ${s}`} onClick={() => setSetAside((list) => list.filter((x) => x !== s))} className="text-ink-300 hover:text-coral-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <button type="button" onClick={() => setSetAside([])} className="mt-2 text-xs font-bold text-brand-500 underline-offset-2 hover:underline">
                  Restore all {setAsideNoun}
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
