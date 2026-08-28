import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import { Wheel } from "./Wheel";
import type { WheelAppearance, WheelSegmentDatum } from "./Wheel";
import { useWheelSpin } from "./useWheelSpin";
import { playCountdownBeep, playTickStyled, unlockAudio } from "../../lib/sound";
import type { SoundStyle } from "../../lib/wheelSettings";
import { textColorFor } from "../../lib/themes";

/** iPhone Safari (and some older browsers) can't fullscreen arbitrary elements. */
const FULLSCREEN_SUPPORTED =
  typeof document !== "undefined" && typeof document.documentElement.requestFullscreen === "function";

export interface WheelStageHandle {
  spin: () => void;
  toggleFullscreen: () => void;
}

interface WheelStageProps {
  segments: WheelSegmentDatum[];
  /** Cumulative segment end angles — drives weighted winner detection. */
  bounds: number[];
  appearance?: WheelAppearance;

  /* Behavior */
  durationMs: number;
  countdownSeconds: number;
  lockWhileSpinning: boolean;
  preventDoubleSpin: boolean;
  inputLocked?: boolean;

  /* Sound */
  soundOn: boolean;
  spinSound: boolean;
  countdownSound: boolean;
  soundStyle: SoundStyle;
  onToggleSound: () => void;

  /* Colors */
  pointerColor: string;
  hubColor: string;
  stageBg: string | null;

  /* Images (data URLs) */
  centerImage?: string | null;
  insetImage?: string | null;
  backgroundImage?: string | null;
  pointerImage?: string | null;

  onWinner: (index: number) => void;
  onSpinStart?: () => void;
  /** Extra floating controls rendered inside the stage (fullscreen aware) */
  floating?: ReactNode;
  ariaLabel?: string;
}

/**
 * The interactive wheel stage: SVG wheel + pointer + SPIN hub + countdown,
 * keyboard, touch and fullscreen support. Owns the animation loop so
 * per-frame renders stay isolated from the rest of the page.
 */
export const WheelStage = forwardRef<WheelStageHandle, WheelStageProps>(function WheelStage(
  {
    segments,
    bounds,
    appearance,
    durationMs,
    countdownSeconds,
    lockWhileSpinning,
    preventDoubleSpin,
    inputLocked = false,
    soundOn,
    spinSound,
    countdownSound,
    soundStyle,
    onToggleSound,
    pointerColor,
    hubColor,
    stageBg,
    centerImage = null,
    insetImage = null,
    backgroundImage = null,
    pointerImage = null,
    onWinner,
    onSpinStart,
    floating,
    ariaLabel = "Spin the wheel",
  },
  ref,
) {
  const count = segments.length;
  const [tickPulse, setTickPulse] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [landed, setLanded] = useState<number | null>(null);
  const [countLeft, setCountLeft] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const countTimer = useRef(0);
  const cooldownUntil = useRef(0);
  const isSpinningRef = useRef(false);
  const lastPulseAt = useRef(0);
  const lastTickSoundAt = useRef(0);

  /* Live refs so handlers always see fresh props */
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;
  const spinSoundRef = useRef(spinSound);
  spinSoundRef.current = spinSound;
  const countdownSoundRef = useRef(countdownSound);
  countdownSoundRef.current = countdownSound;
  const styleRef = useRef(soundStyle);
  styleRef.current = soundStyle;
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;
  const durationRef = useRef(durationMs);
  durationRef.current = durationMs;
  const countdownRef = useRef(countdownSeconds);
  countdownRef.current = countdownSeconds;
  const preventDoubleRef = useRef(preventDoubleSpin);
  preventDoubleRef.current = preventDoubleSpin;
  const onWinnerRef = useRef(onWinner);
  onWinnerRef.current = onWinner;
  const onSpinStartRef = useRef(onSpinStart);
  onSpinStartRef.current = onSpinStart;
  const inputLockedRef = useRef(inputLocked);
  inputLockedRef.current = inputLocked;

  const { rotation, spinning, spin } = useWheelSpin(() => {
    // Throttled so fast wheels (many segments) never flood the DOM with
    // pointer remounts or WebAudio with tick nodes — keeps spins smooth
    // on low-end phones.
    const now = performance.now();
    if (soundRef.current && spinSoundRef.current && now - lastTickSoundAt.current > 40) {
      lastTickSoundAt.current = now;
      playTickStyled(styleRef.current);
    }
    if (now - lastPulseAt.current > 80) {
      lastPulseAt.current = now;
      setTickPulse((p) => p + 1);
    }
  });

  useEffect(() => {
    isSpinningRef.current = spinning;
  }, [spinning]);

  const beginSpin = useCallback(() => {
    const list = segmentsRef.current;
    const b = boundsRef.current;
    if (list.length < 2 || b.length < 2) return;
    if (soundRef.current) unlockAudio(); // inside the user gesture for iOS/Android
    setLanded(null);
    onSpinStartRef.current?.();
    spin(
      b,
      (index) => {
        cooldownUntil.current = Date.now() + (preventDoubleRef.current ? 450 : 0);
        setLanded(index);
        onWinnerRef.current(index);
      },
      durationRef.current,
    );
  }, [spin]);

  const startCountdown = useCallback(() => {
    let left = countdownRef.current;
    if (left <= 0) {
      beginSpin();
      return;
    }
    if (soundRef.current && countdownSoundRef.current) {
      unlockAudio();
      playCountdownBeep(false, styleRef.current);
    }
    setCountLeft(left);
    const tick = () => {
      left -= 1;
      if (left <= 0) {
        setCountLeft(null);
        if (soundRef.current && countdownSoundRef.current) playCountdownBeep(true, styleRef.current);
        beginSpin();
      } else {
        setCountLeft(left);
        if (soundRef.current && countdownSoundRef.current) playCountdownBeep(false, styleRef.current);
        countTimer.current = window.setTimeout(tick, 1000);
      }
    };
    countTimer.current = window.setTimeout(tick, 1000);
  }, [beginSpin]);

  const doSpin = useCallback(() => {
    if (isSpinningRef.current) return;
    if (Date.now() < cooldownUntil.current) return;
    // Clicking again during the countdown skips straight to the spin
    if (countLeft !== null) {
      window.clearTimeout(countTimer.current);
      setCountLeft(null);
      beginSpin();
      return;
    }
    if (countdownRef.current > 0) {
      startCountdown();
      return;
    }
    beginSpin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beginSpin, startCountdown, countLeft]);

  useImperativeHandle(ref, () => ({
    spin: () => {
      if (isSpinningRef.current || Date.now() < cooldownUntil.current) return;
      beginSpin();
    },
    toggleFullscreen: () => {
      if (!FULLSCREEN_SUPPORTED) return;
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        void stageRef.current?.requestFullscreen().catch(() => {});
      }
    },
  }));

  // A stale spotlight would point at the wrong segment after edits
  useEffect(() => {
    setLanded(null);
  }, [segments]);

  useEffect(() => () => window.clearTimeout(countTimer.current), []);

  // Space / Enter spins the wheel from anywhere (unless typing in a field or locked)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== "Enter") return;
      if (inputLockedRef.current) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (el && el.tagName === "BUTTON" && e.key === "Enter") return; // let buttons behave natively
      if (el && el.closest('[role="dialog"]')) return; // never spin behind an open dialog
      e.preventDefault();
      doSpin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doSpin]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const tooFew = count < 2;
  const hubTextColor = textColorFor(hubColor);

  const hasPanel = Boolean(stageBg) || Boolean(backgroundImage);
  const panelStyle: CSSProperties | undefined = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: stageBg ?? undefined,
      }
    : stageBg
      ? { background: stageBg }
      : undefined;

  return (
    <div ref={stageRef} className="wheel-stage relative">
      <div className={hasPanel ? "overflow-hidden rounded-[40px] p-6 sm:p-9" : undefined} style={panelStyle}>
        <div className="wheel-stage-inner relative mx-auto w-full max-w-[560px]">
          {/* Pointer — the entrance at the top of the wheel.
              Centering uses the CSS `translate` property (Tailwind class);
              the tap animation rotates around the pin (origin-[50%_27%]). */}
          <div
            key={tickPulse}
            className="absolute top-[-10px] left-1/2 z-20 h-12 w-10 -translate-x-1/2 origin-[50%_27%] animate-pointer-tap"
            aria-hidden
          >
            {pointerImage ? (
              <img src={pointerImage} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-md" />
            ) : (
              <svg viewBox="0 0 36 44" className="h-full w-full drop-shadow-md">
                <path d="M18 44 L2 8 Q18 -4 34 8 Z" fill={pointerColor} />
                <circle cx="18" cy="12" r="4.5" fill="#faf9f6" />
              </svg>
            )}
          </div>

          {/* Rotating wheel — clickable / tappable */}
          <div
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
            aria-disabled={tooFew || spinning}
            aria-busy={spinning}
            onClick={doSpin}
            onKeyDown={(e) => {
              if (e.code === "Space" || e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                doSpin();
              }
            }}
            className="relative aspect-square w-full cursor-pointer touch-manipulation rounded-full outline-none focus-visible:shadow-glow"
          >
            <div className="absolute inset-0 will-change-transform" style={{ transform: `rotate(${rotation}deg)` }}>
              <Wheel segments={segments} rotation={0} highlightIndex={landed} appearance={appearance} insetImage={insetImage} />
            </div>

            {/* Center image — sits in the hub, behind the SPIN button */}
            {centerImage && (
              <div className="pointer-events-none absolute top-1/2 left-1/2 z-[5] -translate-x-1/2 -translate-y-1/2" aria-hidden>
                <img
                  src={centerImage}
                  alt=""
                  draggable={false}
                  className="h-[31vmin] max-h-[178px] min-h-[122px] w-[31vmin] max-w-[178px] min-w-[122px] rounded-full border-4 border-white object-cover shadow-lift"
                />
              </div>
            )}

            {/* Hub / SPIN button */}
            <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  doSpin();
                }}
                disabled={tooFew || (lockWhileSpinning && spinning)}
                className="flex h-[21vmin] max-h-[118px] min-h-[84px] w-[21vmin] max-w-[118px] min-w-[84px] items-center justify-center rounded-full border-4 border-white font-display text-lg font-bold tracking-widest shadow-lift transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-60 sm:text-xl"
                style={{ background: hubColor, color: hubTextColor }}
                aria-label="Spin the wheel"
              >
                {spinning ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/30 border-t-white" aria-hidden />
                ) : (
                  "SPIN"
                )}
              </button>
            </div>

            {tooFew && (
              <div className="absolute inset-x-0 bottom-[8%] z-10 mx-auto w-fit rounded-full bg-ink-950/85 px-4 py-1.5 text-xs font-semibold text-white">
                Add at least 2 entries to spin
              </div>
            )}
          </div>

          {/* Countdown overlay */}
          {countLeft !== null && (
            <div
              className="absolute inset-0 z-30 flex cursor-pointer flex-col items-center justify-center rounded-full bg-ink-950/60 backdrop-blur-[2px]"
              onClick={doSpin}
              role="status"
              aria-label={`Spin starting in ${countLeft} seconds. Click to skip.`}
            >
              <motion.p
                key={countLeft}
                initial={{ scale: 1.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.22 }}
                className="font-display text-8xl font-bold text-white sm:text-9xl"
              >
                {countLeft}
              </motion.p>
              <p className="mt-2 text-xs font-semibold tracking-wide text-white/70 uppercase">Tap to skip</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating controls (visible in fullscreen too) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {floating}
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
          aria-pressed={soundOn}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-soft backdrop-blur transition hover:bg-white hover:text-ink-950"
        >
          {soundOn ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
        </button>
        {FULLSCREEN_SUPPORTED && (
          <button
            type="button"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void stageRef.current?.requestFullscreen().catch(() => {});
            }}
            aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-soft backdrop-blur transition hover:bg-white hover:text-ink-950"
          >
            {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
    </div>
  );
});
