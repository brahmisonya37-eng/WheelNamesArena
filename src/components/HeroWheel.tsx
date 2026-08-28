import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Wheel } from "./wheel/Wheel";
import { useWheelSpin } from "./wheel/useWheelSpin";
import { paletteFor } from "../lib/themes";
import { playTick, playWin, unlockAudio } from "../lib/sound";
import { fireConfetti } from "../lib/confetti";
import { loadSettings } from "../lib/storage";
import { computeGeometry } from "../lib/wheelSettings";

const DEMO_ENTRIES = ["Movie night", "Pizza party", "Road trip", "Game night", "Cook together", "Karaoke", "Museum day", "Beach day"];

/** Interactive demo wheel for the homepage hero. */
export function HeroWheel() {
  const [result, setResult] = useState<string | null>(null);
  const palette = paletteFor("classic");
  // Cache settings once — this runs on every tick of the spin
  const settingsRef = useRef(loadSettings());

  const { bounds, segments } = useMemo(() => {
    const { segs, bounds: b } = computeGeometry(DEMO_ENTRIES.map(() => 1), 0);
    return {
      bounds: b,
      segments: DEMO_ENTRIES.map((label, i) => {
        let ci = i % palette.length;
        if (i === DEMO_ENTRIES.length - 1 && ci === 0) ci = 1;
        return { label, color: palette[ci], start: segs[i].start, end: segs[i].end };
      }),
    };
  }, [palette]);

  const { rotation, spinning, spin } = useWheelSpin(() => {
    if (settingsRef.current.sound) playTick();
  });

  const doSpin = () => {
    unlockAudio(); // unlock inside the tap so iOS/Android allow spin sounds
    setResult(null);
    spin(bounds, (index) => {
      const winner = DEMO_ENTRIES[index];
      setResult(winner);
      if (settingsRef.current.sound) playWin();
      if (settingsRef.current.confetti) fireConfetti(0.7);
    }, 4600);
  };

  const resultColor = result ? segments[DEMO_ENTRIES.indexOf(result)]?.color : undefined;

  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      {/* soft glow behind wheel */}
      <div className="absolute inset-6 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />

      <div className="relative">
        <div key="pointer" className="absolute top-[-8px] left-1/2 z-20 h-10 w-8 -translate-x-1/2" aria-hidden>
          <svg viewBox="0 0 36 44" className="h-full w-full drop-shadow-md">
            <path d="M18 44 L2 8 Q18 -4 34 8 Z" fill="#ff6b5e" />
            <circle cx="18" cy="12" r="4.5" fill="#faf9f6" />
          </svg>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label="Spin the demo wheel"
          onClick={doSpin}
          onKeyDown={(e) => {
            if (e.code === "Space" || e.key === "Enter") {
              e.preventDefault();
              doSpin();
            }
          }}
          className="relative aspect-square w-full cursor-pointer outline-none"
        >
          <div className="absolute inset-0 will-change-transform" style={{ transform: `rotate(${rotation}deg)` }}>
            <Wheel segments={segments} rotation={0} />
          </div>
          <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-ink-950 font-display text-base font-bold tracking-widest text-white shadow-lift transition-transform duration-150 hover:scale-105 sm:h-24 sm:w-24">
              {spinning ? <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white" aria-hidden /> : "SPIN"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex min-h-[52px] items-center justify-center" aria-live="polite">
        {result ? (
          <p className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-center text-sm font-bold text-ink-950 shadow-soft">
            <span className="h-3 w-3 rounded-full" style={{ background: resultColor }} aria-hidden />
            {result}! Now build your own wheel
            <ArrowRight className="h-4 w-4 text-brand-500" aria-hidden />
          </p>
        ) : (
          <p className="text-sm font-semibold text-ink-400">Go on — give it a spin.</p>
        )}
      </div>
      {result && (
        <div className="mt-2 text-center">
          <Link to="/wheel-spinner" className="text-sm font-bold text-brand-500 underline-offset-4 hover:underline">
            Open the full wheel spinner →
          </Link>
        </div>
      )}
    </div>
  );
}
