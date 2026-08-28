import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  FileDown,
  Paintbrush,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { Btn, cx } from "../../ui";
import { ColorField, ImageField, Segmented, SettingsSection, SliderRow, ToggleRow } from "./SettingsControls";
import { processImageFile } from "../../../lib/images";
import {
  THEME_ORDER,
  WHEEL_THEME_DEFS,
  resolveAppearance,
} from "../../../lib/wheelSettings";
import type { SoundStyle, WheelImages, WheelSettings, WheelThemeName } from "../../../lib/wheelSettings";
import { SOUND_STYLE_LABELS, previewSoundStyle, setSoundVolume, unlockAudio } from "../../../lib/sound";

type TabId = "spin" | "sound" | "appearance" | "results" | "randomization" | "export";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "spin", label: "Spin", icon: Timer },
  { id: "sound", label: "Sound", icon: Volume2 },
  { id: "appearance", label: "Appearance", icon: Paintbrush },
  { id: "results", label: "Results", icon: Sparkles },
  { id: "randomization", label: "Randomization", icon: Target },
  { id: "export", label: "Export", icon: Download },
];

const DURATION_PRESETS = [
  { label: "Fast — 3s", value: 3 },
  { label: "Normal — 6s", value: 6 },
  { label: "Slow — 10s", value: 10 },
];

interface WheelSettingsModalProps {
  open: boolean;
  onClose: () => void;
  ws: WheelSettings;
  onChange: (patch: Partial<WheelSettings>) => void;
  onResetSettings: () => void;
  onResetWheel: () => void;
  onOpenPdf: () => void;
  onExportEntries: () => void;
  entryCount: number;
}

export function WheelSettingsModal({
  open,
  onClose,
  ws,
  onChange,
  onResetSettings,
  onResetWheel,
  onOpenPdf,
  onExportEntries,
  entryCount,
}: WheelSettingsModalProps) {
  const [tab, setTab] = useState<TabId>("spin");
  const [resetWheelArmed, setResetWheelArmed] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = async (slot: keyof WheelImages, file: File, maxDim: number) => {
    setImageError(null);
    try {
      const dataUrl = await processImageFile(file, maxDim);
      onChange({ images: { ...ws.images, [slot]: dataUrl } });
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Couldn't process that image — try a different file.");
    }
  };

  useEffect(() => {
    if (open) {
      setTab("spin");
      setResetWheelArmed(false);
      window.setTimeout(() => panelRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Live-apply volume while the panel is open
  useEffect(() => {
    setSoundVolume(ws.volume);
  }, [ws.volume]);

  const appearance = resolveAppearance(ws);

  const setPaletteColor = (i: number, hex: string) => {
    const next = (ws.palette ?? appearance.palette).slice(0, 10);
    next[i] = hex;
    onChange({ palette: next });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Wheel settings"
        >
          <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm" onClick={onClose} aria-hidden />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-paper outline-none sm:h-auto sm:max-h-[88vh] sm:max-w-2xl sm:rounded-[28px] sm:shadow-lift"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <Settings className="h-5 w-5 text-brand-500" aria-hidden /> Wheel settings
              </h2>
              <button type="button" onClick={onClose} aria-label="Close settings" className="rounded-full p-2 text-ink-400 transition hover:bg-ink-50 hover:text-ink-950">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-ink-100 bg-white px-4 py-2.5" role="tablist" aria-label="Settings sections">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cx(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold whitespace-nowrap transition",
                    tab === t.id ? "bg-ink-950 text-white" : "text-ink-500 hover:bg-ink-50 hover:text-ink-950",
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" aria-hidden /> {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="thin-scroll flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {/* ================================ SPIN ================================ */}
              {tab === "spin" && (
                <>
                  <SettingsSection title="Spin duration">
                    <SliderRow
                      label="How long the wheel spins"
                      valueLabel={`Spin duration: ${ws.spinDuration} second${ws.spinDuration === 1 ? "" : "s"}`}
                      min={1}
                      max={60}
                      value={ws.spinDuration}
                      onChange={(v) => onChange({ spinDuration: v })}
                    >
                      <div className="flex flex-wrap gap-2">
                        {DURATION_PRESETS.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => onChange({ spinDuration: p.value })}
                            aria-pressed={ws.spinDuration === p.value}
                            className={cx(
                              "rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
                              ws.spinDuration === p.value ? "border-brand-500 bg-brand-50 text-brand-600" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
                            )}
                          >
                            {p.label}
                          </button>
                        ))}
                        <span
                          className={cx(
                            "rounded-full border px-3.5 py-1.5 text-xs font-bold",
                            !DURATION_PRESETS.some((p) => p.value === ws.spinDuration) ? "border-brand-500 bg-brand-50 text-brand-600" : "border-ink-200 bg-white text-ink-400",
                          )}
                        >
                          Custom — {ws.spinDuration}s
                        </span>
                      </div>
                    </SliderRow>
                  </SettingsSection>

                  <SettingsSection title="Before the spin">
                    <div className="py-2.5">
                      <p className="mb-2 text-sm font-semibold text-ink-900">Countdown before spin</p>
                      <Segmented
                        label="Countdown before spin"
                        value={ws.countdown}
                        onChange={(v) => onChange({ countdown: v as 0 | 3 | 5 | 10 })}
                        options={[
                          { value: 0, label: "Off" },
                          { value: 3, label: "3s" },
                          { value: 5, label: "5s" },
                          { value: 10, label: "10s" },
                        ]}
                      />
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Protection">
                    <ToggleRow label="Disable Spin button while spinning" hint="The button shows a spinner until the result lands." checked={ws.lockWhileSpinning} onChange={(v) => onChange({ lockWhileSpinning: v })} />
                    <ToggleRow label="Prevent accidental double spins" hint="Adds a short cooldown after each result." checked={ws.preventDoubleSpin} onChange={(v) => onChange({ preventDoubleSpin: v })} />
                  </SettingsSection>
                </>
              )}

              {/* ================================ SOUND =============================== */}
              {tab === "sound" && (
                <>
                  <SettingsSection title="Sound effects">
                    <ToggleRow label="Sound effects" hint="Master switch for all wheel sounds." checked={ws.soundOn} onChange={(v) => onChange({ soundOn: v })} />
                    <ToggleRow label="Spin sound" hint="Tick sounds as the wheel passes the pointer." checked={ws.spinSound} onChange={(v) => onChange({ spinSound: v })} />
                    <ToggleRow label="Winner sound" hint="Fanfare plus crowd applause & whistling." checked={ws.winnerSound} onChange={(v) => onChange({ winnerSound: v })} />
                    <ToggleRow label="Countdown sound" hint="Beeps during the pre-spin countdown." checked={ws.countdownSound} onChange={(v) => onChange({ countdownSound: v })} />
                    <SliderRow label="Volume" valueLabel={`${ws.volume}%`} min={0} max={100} value={ws.volume} onChange={(v) => onChange({ volume: v })} />
                  </SettingsSection>

                  <SettingsSection title="Sound style">
                    <div className="grid gap-2 py-2 sm:grid-cols-2">
                      {SOUND_STYLE_LABELS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onChange({ soundStyle: s.id as SoundStyle })}
                          aria-pressed={ws.soundStyle === s.id}
                          className={cx(
                            "rounded-2xl border p-3.5 text-left transition",
                            ws.soundStyle === s.id ? "border-brand-500 bg-brand-50 shadow-glow" : "border-ink-200 bg-white hover:border-ink-300",
                          )}
                        >
                          <span className={cx("block text-sm font-bold", ws.soundStyle === s.id ? "text-brand-600" : "text-ink-900")}>{s.label}</span>
                          <span className="mt-0.5 block text-xs text-ink-400">{s.hint}</span>
                        </button>
                      ))}
                    </div>
                    <div className="py-2">
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          unlockAudio();
                          setSoundVolume(ws.volume);
                          previewSoundStyle(ws.soundStyle);
                        }}
                      >
                        <Play className="h-4 w-4" aria-hidden /> Preview sound
                      </Btn>
                    </div>
                  </SettingsSection>
                </>
              )}

              {/* ============================= APPEARANCE ============================= */}
              {tab === "appearance" && (
                <>
                  <SettingsSection title="Theme">
                    <div className="grid grid-cols-2 gap-2 py-2 sm:grid-cols-4">
                      {THEME_ORDER.map((name) => {
                        const def = WHEEL_THEME_DEFS[name];
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => onChange({ theme: name as WheelThemeName })}
                            aria-pressed={ws.theme === name}
                            className={cx(
                              "rounded-2xl border p-3 transition",
                              ws.theme === name ? "border-brand-500 bg-brand-50 shadow-glow" : "border-ink-200 bg-white hover:border-ink-300",
                            )}
                          >
                            <span
                              className="mx-auto block h-9 w-9 rounded-full border-2 border-white shadow"
                              style={{ background: `conic-gradient(${def.palette[0]} 0 25%, ${def.palette[1]} 0 50%, ${def.palette[2]} 0 75%, ${def.palette[3] ?? def.palette[0]} 0)` }}
                              aria-hidden
                            />
                            <span className={cx("mt-2 block text-xs font-bold", ws.theme === name ? "text-brand-600" : "text-ink-700")}>{def.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Customize">
                    <div className="py-2.5">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink-900">Wheel colors</p>
                        {ws.palette && (
                          <button type="button" onClick={() => onChange({ palette: null })} className="flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-[11px] font-bold text-ink-500 transition hover:text-ink-950">
                            <RotateCcw className="h-3 w-3" aria-hidden /> Theme colors
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(ws.palette ?? appearance.palette).slice(0, 10).map((c, i) => (
                          <span key={i} className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow" style={{ background: c }}>
                            <input
                              type="color"
                              value={c}
                              onChange={(e) => setPaletteColor(i, e.target.value)}
                              aria-label={`Wheel color ${i + 1}`}
                              className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 p-0 opacity-0"
                            />
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-ink-400">Tap a segment color to change it. Changes apply instantly.</p>
                    </div>

                    <ColorField label="Background color" value={appearance.background || "#faf9f6"} onChange={(v) => onChange({ backgroundColor: v })} onReset={() => onChange({ backgroundColor: null })} resetLabel="None" />
                    <ColorField label="Text color" value={appearance.textColor ?? "#ffffff"} onChange={(v) => onChange({ textColor: v })} onReset={() => onChange({ textColor: null })} resetLabel="Auto" />
                    <ColorField label="Pointer color" value={appearance.pointerColor} onChange={(v) => onChange({ pointerColor: v })} onReset={() => onChange({ pointerColor: null })} resetLabel="Theme" />
                    <ColorField label="Center button color" value={appearance.hubColor} onChange={(v) => onChange({ hubColor: v })} onReset={() => onChange({ hubColor: null })} resetLabel="Theme" />

                    <SliderRow label="Text size" valueLabel={`${ws.textSize}%`} min={60} max={160} step={5} value={ws.textSize} onChange={(v) => onChange({ textSize: v })} />
                    <SliderRow label="Border thickness" valueLabel={`${ws.borderWidth}px`} min={0} max={8} step={0.5} value={ws.borderWidth} onChange={(v) => onChange({ borderWidth: v })} />
                    <SliderRow label="Segment spacing" valueLabel={ws.segmentGap === 0 ? "Off" : `${ws.segmentGap}°`} min={0} max={5} step={0.5} value={ws.segmentGap} onChange={(v) => onChange({ segmentGap: v })} />
                  </SettingsSection>

                  <SettingsSection title="Images">
                    <ImageField
                      label="Center image"
                      hint="Shown in the middle of the wheel, behind the SPIN button — perfect for logos."
                      value={ws.images.center}
                      round
                      onUpload={(f) => void handleImageUpload("center", f, 512)}
                      onRemove={() => onChange({ images: { ...ws.images, center: null } })}
                    />
                    <ImageField
                      label="Inset image"
                      hint="Embedded into the wheel disc itself — spins with the wheel, between the hub and the labels."
                      value={ws.images.inset}
                      round
                      onUpload={(f) => void handleImageUpload("inset", f, 768)}
                      onRemove={() => onChange({ images: { ...ws.images, inset: null } })}
                    />
                    <ImageField
                      label="Background image"
                      hint="Fills the area behind the wheel."
                      value={ws.images.background}
                      onUpload={(f) => void handleImageUpload("background", f, 1600)}
                      onRemove={() => onChange({ images: { ...ws.images, background: null } })}
                    />
                    <ImageField
                      label="Pointer image"
                      hint="Replaces the flap at the wheel's entrance — use an image that points downward."
                      value={ws.images.pointer}
                      onUpload={(f) => void handleImageUpload("pointer", f, 320)}
                      onRemove={() => onChange({ images: { ...ws.images, pointer: null } })}
                    />
                    {imageError && (
                      <p className="py-2 text-xs font-bold text-coral-600" role="alert">
                        {imageError}
                      </p>
                    )}
                    <p className="py-2 text-xs text-ink-400">PNG, JPG, WEBP or SVG · automatically compressed and stored privately in your browser.</p>
                  </SettingsSection>
                </>
              )}

              {/* =============================== RESULTS =============================== */}
              {tab === "results" && (
                <>
                  <SettingsSection title="After the spin">
                    <div className="py-2.5">
                      <p className="mb-2 text-sm font-semibold text-ink-900">Winner handling</p>
                      <Segmented
                        label="Winner handling after a spin"
                        value={ws.removeWinnerAfterSpin ? "remove" : "keep"}
                        onChange={(v) => onChange({ removeWinnerAfterSpin: v === "remove" })}
                        options={[
                          { value: "keep", label: "Keep winner" },
                          { value: "remove", label: "Remove winner" },
                        ]}
                      />
                      <p className="mt-2 text-xs text-ink-400">“Remove winner” takes the winner off the wheel automatically after every spin.</p>
                    </div>
                    <ToggleRow label="Show winner popup" hint="Celebrate each result with a winner card." checked={ws.showWinnerPopup} onChange={(v) => onChange({ showWinnerPopup: v })} />
                    <ToggleRow label="Show winner history" hint="Keep a visible list of recent results." checked={ws.showHistory} onChange={(v) => onChange({ showHistory: v })} />
                    <ToggleRow label="Enable confetti" hint="Colorful confetti when a winner lands." checked={ws.confetti} onChange={(v) => onChange({ confetti: v })} />
                    <ToggleRow label="Automatically continue to next spin" hint="Keeps drawing back-to-back winners. Works best with the popup off." checked={ws.autoContinue} onChange={(v) => onChange({ autoContinue: v })} />
                    <ToggleRow label="Prevent previous winners from being selected again" hint="Past winners are hidden from the wheel until you clear the history." checked={ws.excludePreviousWinners} onChange={(v) => onChange({ excludePreviousWinners: v })} />
                  </SettingsSection>
                </>
              )}

              {/* ============================ RANDOMIZATION ============================ */}
              {tab === "randomization" && (
                <>
                  <SettingsSection title="Probability">
                    <div className="py-2.5">
                      <Segmented
                        label="Probability mode"
                        value={ws.probability}
                        onChange={(v) => onChange({ probability: v as "equal" | "weighted" })}
                        options={[
                          { value: "equal", label: "Equal probability" },
                          { value: "weighted", label: "Weighted" },
                        ]}
                      />
                      {ws.probability === "weighted" ? (
                        <p className="mt-3 rounded-xl bg-sun-100/70 p-3 text-xs leading-relaxed text-ink-700">
                          <strong>Higher weights increase the probability of selection.</strong> Set each entry's weight with the <span className="font-mono font-bold">×</span> field in the entry list — e.g. Sarah at 2× is twice as likely as John at 1×. Segment sizes on the wheel reflect the weights.
                        </p>
                      ) : (
                        <p className="mt-3 text-xs text-ink-400">Every entry has exactly the same chance on every spin. This is the default.</p>
                      )}
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Advanced">
                    <ToggleRow label="Prevent immediate repeats" hint="The last winner can't win the very next spin." checked={ws.preventImmediateRepeat} onChange={(v) => onChange({ preventImmediateRepeat: v })} />
                    <ToggleRow label="Exclude previous winners" hint="Same as the Results tab option — past winners leave the wheel." checked={ws.excludePreviousWinners} onChange={(v) => onChange({ excludePreviousWinners: v })} />
                  </SettingsSection>
                </>
              )}

              {/* ================================ EXPORT ================================ */}
              {tab === "export" && (
                <>
                  <SettingsSection title="Export">
                    <div className="space-y-3 py-2">
                      <Btn onClick={onOpenPdf} className="w-full sm:w-auto">
                        <Download className="h-4 w-4" aria-hidden /> Download PDF
                      </Btn>
                      <p className="text-xs text-ink-400">A professional report: wheel preview, entries, settings summary and winner history. Free, A4 or Letter.</p>
                      <Btn variant="outline" onClick={onExportEntries} className="w-full sm:w-auto">
                        <FileDown className="h-4 w-4" aria-hidden /> Export entries (.txt)
                      </Btn>
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Reset">
                    <div className="space-y-3 py-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <Btn variant="outline" size="sm" onClick={onResetSettings}>
                          <RotateCcw className="h-4 w-4" aria-hidden /> Reset settings
                        </Btn>
                        <span className="text-xs text-ink-400">Back to defaults — keeps your entries.</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Btn
                          variant={resetWheelArmed ? "coral" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (!resetWheelArmed) {
                              setResetWheelArmed(true);
                              window.setTimeout(() => setResetWheelArmed(false), 3500);
                              return;
                            }
                            setResetWheelArmed(false);
                            onResetWheel();
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden /> {resetWheelArmed ? "Confirm: delete everything?" : "Reset wheel"}
                        </Btn>
                        <span className="text-xs text-ink-400">Deletes entries, title, history and settings.</span>
                      </div>
                    </div>
                  </SettingsSection>

                  <p className="flex items-center gap-1.5 px-1 text-xs text-ink-400">
                    <Zap className="h-3.5 w-3.5 text-brand-400" aria-hidden /> {entryCount} entries on this wheel · everything is stored privately in your browser.
                  </p>
                </>
              )}
            </div>

            {/* Sticky footer */}
            <div className="flex items-center justify-between gap-3 border-t border-ink-100 bg-white px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={onResetSettings}
                className="flex items-center gap-1.5 text-xs font-bold text-ink-400 transition hover:text-coral-600"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset settings
              </button>
              <Btn onClick={onClose} className="min-w-32">
                Done
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
