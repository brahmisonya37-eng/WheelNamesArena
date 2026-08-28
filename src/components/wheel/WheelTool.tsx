import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  ArrowUpNarrowWide,
  Camera,
  ClipboardPaste,
  Crop,
  Download,
  Eraser,
  Eye,
  EyeOff,
  Filter,
  FolderOpen,
  GripVertical,
  Link2,
  Palette,
  PartyPopper,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Settings,
  Share2,
  Shuffle,
  Smile,
  Trash2,
  Undo2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import { WheelStage } from "./WheelStage";
import type { WheelStageHandle } from "./WheelStage";
import type { WheelAppearance } from "./Wheel";
import { WheelSettingsModal } from "./settings/WheelSettingsModal";
import { PdfExportDialog } from "./settings/PdfExportDialog";
import { Btn, Card, CopyButton, cx } from "../ui";
import { shuffle, parseList } from "../../lib/random";
import { playCelebrationStyled, setSoundVolume } from "../../lib/sound";
import { fireConfetti } from "../../lib/confetti";
import { processImageFile, processImageUrl } from "../../lib/images";
import { blankWheel, loadActiveId, loadLibrary, makeLibraryWheel, saveActiveId, saveLibrary } from "../../lib/wheelLibrary";
import type { LibraryWheel } from "../../lib/wheelLibrary";
import { WheelSwitcher } from "./WheelSwitcher";
import { wheelShareUrl, shareHref } from "../../lib/share";
import {
  DEFAULT_ENTRIES,
  loadHistory,
  loadWheels,
  makeSavedWheel,
  loadCurrentWheel,
  saveCurrentWheel,
  saveHistory,
  saveSettings,
  saveWheels,
} from "../../lib/storage";
import type { EntryItem, HistoryEntry, SavedWheel } from "../../lib/storage";
import {
  DEFAULT_WHEEL_SETTINGS,
  WHEEL_THEME_DEFS,
  computeGeometry,
  loadWheelSettings,
  resolveAppearance,
  saveWheelSettings,
} from "../../lib/wheelSettings";
import type { WheelSettings } from "../../lib/wheelSettings";
import type { WheelPdfData } from "../../lib/pdf";

/* ------------------------------ Sample presets ------------------------------ */

const PRESETS: { name: string; entries: string[] }[] = [
  { name: "Food night", entries: ["Pizza", "Sushi", "Tacos", "Burgers", "Ramen", "Pasta", "Curry", "Salad"] },
  { name: "Classroom", entries: ["Ava", "Liam", "Maya", "Noah", "Zoe", "Ethan", "Ivy", "Lucas", "Nora", "Owen"] },
  { name: "Prizes", entries: ["Sticker pack", "Gift card", "Homework pass", "Extra recess", "DJ for a day", "Front of the line", "Mystery prize", "High five"] },
  { name: "Game night", entries: ["Charades", "Trivia", "Pictionary", "Card game", "Board game", "Video game", "Karaoke", "Hide & seek"] },
];

/** Emoji icons users can pick instead of uploading an image. */
const EMOJIS = [
  "😀", "😎", "🤩", "🥳", "😺", "🐶", "🐱", "🦊",
  "🐼", "🐸", "🦄", "🐢", "⭐", "🔥", "🌈", "🎈",
  "🎁", "🏆", "🎯", "🎮", "🎲", "🍕", "🍩", "⚽",
  "🚀", "❤️", "💎", "👑",
];

/** Quick segment colors for per-entry customization. */
const QUICK_COLORS = ["#6d4aff", "#ff6b5e", "#ffb020", "#2dd4a7", "#38bdf8", "#f472b6", "#34d399", "#fb923c"];

/* ------------------------------- Share panel ------------------------------- */

function SharePanel({ entries }: { entries: string[] }) {
  const url = wheelShareUrl(entries);
  const text = "Spin this wheel on WheelNamesArena 🎡";
  const socials: { key: "whatsapp" | "x" | "reddit" | "telegram"; label: string }[] = [
    { key: "whatsapp", label: "WhatsApp" },
    { key: "x", label: "X" },
    { key: "reddit", label: "Reddit" },
    { key: "telegram", label: "Telegram" },
  ];
  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-ink-50 p-4 text-left">
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-700"
          aria-label="Wheel share link"
        />
        <CopyButton text={url} label="Copy" />
      </div>
      <div className="flex flex-wrap gap-2">
        {socials.map((s) => (
          <a
            key={s.key}
            href={shareHref(s.key, url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Entry row -------------------------------- */

interface EntryRowProps {
  item: EntryItem;
  index: number;
  count: number;
  weighted: boolean;
  isDragging: boolean;
  isOver: boolean;
  onChange: (v: string) => void;
  onWeight: (w: number) => void;
  onPhotoFile: (f: File) => void;
  onPhotoUrl: (url: string) => void;
  onIcon: (icon: string | null) => void;
  onColor: (color: string | null) => void;
  onRemoveImage: () => void;
  onCrop: () => void;
  onPreview: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

function EntryRow({ item, index, count, weighted, isDragging, isOver, onChange, onWeight, onPhotoFile, onPhotoUrl, onIcon, onColor, onRemoveImage, onCrop, onPreview, onRemove, onMove, onDragStart, onDragOver, onDrop, onDragEnd }: EntryRowProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [mode, setMode] = useState<"main" | "url" | "emoji">("main");
  const [urlDraft, setUrlDraft] = useState("");
  const [dropHover, setDropHover] = useState(false);

  const hasImage = Boolean(item.photo || item.icon);
  const altText = item.text.trim() || `Entry ${index + 1}`;

  const chip = "flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-600";

  const closeEditor = () => {
    setEditorOpen(false);
    setMode("main");
    setUrlDraft("");
  };

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cx(
        "group rounded-xl border border-transparent bg-white px-1.5 py-1 transition-shadow",
        isDragging && "opacity-40",
        isOver && "border-brand-400 shadow-glow",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="cursor-grab text-ink-300 group-hover:text-ink-500 active:cursor-grabbing" aria-hidden>
          <GripVertical className="h-4 w-4" />
        </span>
        <span className="w-6 shrink-0 text-right font-mono text-[11px] text-ink-400" aria-hidden>
          {index + 1}
        </span>

        {/* Image button — opens the entry's image & color editor. Also a drop target. */}
        <button
          type="button"
          onClick={() => (editorOpen ? closeEditor() : setEditorOpen(true))}
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer.types).includes("Files")) {
              e.preventDefault();
              e.stopPropagation();
              setDropHover(true);
            }
          }}
          onDragLeave={() => setDropHover(false)}
          onDrop={(e) => {
            const f = e.dataTransfer.files?.[0];
            if (f && f.type.startsWith("image/")) {
              e.preventDefault();
              e.stopPropagation();
              setDropHover(false);
              onPhotoFile(f);
            }
          }}
          aria-label={`Image and color options for ${altText}`}
          aria-expanded={editorOpen}
          title={hasImage ? "Edit image & color" : "Add image, emoji or color (drop an image here)"}
          className={cx(
            "relative h-8 w-8 shrink-0 overflow-hidden rounded-full border transition",
            dropHover ? "border-brand-500 ring-2 ring-brand-200" : "border-ink-200 hover:border-brand-300",
            editorOpen && "border-brand-400",
          )}
        >
          {item.photo ? (
            <img src={item.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : item.icon ? (
            <span className="flex h-full w-full items-center justify-center bg-ink-50 text-base" aria-hidden>
              {item.icon}
            </span>
          ) : (
            <Camera className="m-auto h-3.5 w-3.5 text-ink-300" aria-hidden />
          )}
          {item.color && <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-white" style={{ background: item.color }} aria-hidden />}
        </button>

        <input
          value={item.text}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Entry ${index + 1}`}
          placeholder="Entry…"
          className="w-full min-w-0 rounded-lg bg-transparent px-2 py-1.5 text-sm text-ink-950 outline-none placeholder:text-ink-300 focus:bg-brand-50"
        />
        {weighted && (
          <span className="flex shrink-0 items-center gap-0.5 rounded-lg bg-ink-50 px-1.5 py-1" title="Weight — higher means more likely">
            <input
              type="number"
              min={1}
              max={99}
              step={1}
              value={item.weight}
              onChange={(e) => {
                const v = Number(e.target.value);
                onWeight(Number.isFinite(v) ? Math.max(1, Math.min(99, Math.round(v))) : 1);
              }}
              aria-label={`Weight for entry ${index + 1}`}
              className="w-9 bg-transparent text-right text-xs font-bold text-ink-700 outline-none"
            />
            <span className="text-xs font-bold text-ink-400">×</span>
          </span>
        )}
        <span className="flex shrink-0 items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up" className="rounded p-1 text-ink-400 hover:text-ink-950 disabled:opacity-30">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Move down" className="rounded p-1 text-ink-400 hover:text-ink-950 disabled:opacity-30">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onRemove} aria-label="Remove entry" className="rounded p-1 text-ink-400 hover:text-coral-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      {/* ------------ Image & color editor panel ------------ */}
      {editorOpen && (
        <div className="mb-1 mt-1.5 ml-8 space-y-2.5 rounded-xl bg-ink-50/80 p-3">
          {mode === "main" && (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                {item.photo && (
                  <img src={item.photo} alt={`Current image for ${altText}`} loading="lazy" decoding="async" className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm" />
                )}
                <button type="button" className={chip} onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" aria-hidden /> Upload
                </button>
                <button type="button" className={chip} onClick={() => setMode("url")}>
                  <Link2 className="h-3.5 w-3.5" aria-hidden /> Image URL
                </button>
                <button type="button" className={chip} onClick={() => setMode("emoji")}>
                  <Smile className="h-3.5 w-3.5" aria-hidden /> Emoji
                </button>
                {item.photo && (
                  <button type="button" className={chip} onClick={onCrop}>
                    <Crop className="h-3.5 w-3.5" aria-hidden /> Crop
                  </button>
                )}
                {hasImage && (
                  <button type="button" className={chip} onClick={onPreview}>
                    <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Preview
                  </button>
                )}
                {hasImage && (
                  <button type="button" className={cx(chip, "hover:border-coral-500 hover:text-coral-600")} onClick={onRemoveImage}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] leading-snug text-ink-400">PNG, JPG, WEBP or SVG · auto-optimized · drag & drop onto the circle works too.</p>
            </>
          )}

          {mode === "url" && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (urlDraft.trim()) {
                  onPhotoUrl(urlDraft.trim());
                  setUrlDraft("");
                  setMode("main");
                }
              }}
            >
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://example.com/image.png"
                aria-label="Image URL"
                inputMode="url"
                className="w-full min-w-0 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-300"
              />
              <Btn size="sm" type="submit" disabled={!urlDraft.trim()}>Add</Btn>
              <Btn size="sm" variant="outline" type="button" onClick={() => setMode("main")}>Back</Btn>
            </form>
          )}

          {mode === "emoji" && (
            <div>
              <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      onIcon(e);
                      setMode("main");
                    }}
                    aria-label={`Use emoji ${e}`}
                    className={cx(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-lg transition hover:bg-white hover:shadow-sm",
                      item.icon === e && "bg-white shadow-sm ring-1 ring-brand-300",
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex justify-between">
                {item.icon && (
                  <button type="button" className="text-[11px] font-bold text-ink-500 underline-offset-2 hover:underline" onClick={() => onIcon(null)}>
                    Clear emoji
                  </button>
                )}
                <button type="button" className="ml-auto text-[11px] font-bold text-ink-500 underline-offset-2 hover:underline" onClick={() => setMode("main")}>
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Segment color */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-ink-100 pt-2.5">
            <span className="mr-1 flex items-center gap-1 text-[11px] font-bold text-ink-500">
              <Palette className="h-3.5 w-3.5" aria-hidden /> Segment color
            </span>
            {QUICK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onColor(c)}
                aria-label={`Set segment color ${c}`}
                aria-pressed={item.color === c}
                className={cx("h-7 w-7 rounded-full border-2 border-white shadow-sm transition hover:scale-110", item.color === c && "ring-2 ring-ink-950")}
                style={{ background: c }}
              />
            ))}
            <span className="relative inline-flex h-7 w-9 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm" title="Custom color">
              <Palette className="h-3.5 w-3.5 text-ink-400" aria-hidden />
              <input
                ref={colorRef}
                type="color"
                value={item.color ?? "#6d4aff"}
                onChange={(e) => onColor(e.target.value)}
                aria-label="Custom segment color"
                className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 p-0 opacity-0"
              />
            </span>
            {item.color && (
              <button type="button" onClick={() => onColor(null)} className="text-[11px] font-bold text-ink-500 underline-offset-2 hover:underline">
                Auto
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPhotoFile(f);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </li>
  );
}

/* -------------------------------- Crop modal ------------------------------- */

const CROP_VIEW = 260;

function CropModal({ src, name, onApply, onClose }: { src: string; name: string; onApply: (dataUrl: string) => void; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const base = img ? Math.max(CROP_VIEW / img.width, CROP_VIEW / img.height) : 1;
  const drawW = img ? img.width * base * zoom : CROP_VIEW;
  const drawH = img ? img.height * base * zoom : CROP_VIEW;
  const maxX = Math.max(0, (drawW - CROP_VIEW) / 2);
  const maxY = Math.max(0, (drawH - CROP_VIEW) / 2);

  // Keep the image covering the viewport when zoom changes
  useEffect(() => {
    setOffset((o) => ({ x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) }));
  }, [maxX, maxY]);

  const apply = () => {
    if (!img) return;
    const OUT = 240;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const g = canvas.getContext("2d");
    if (!g) return;
    const s = OUT / CROP_VIEW;
    const w = drawW * s;
    const h = drawH * s;
    g.drawImage(img, OUT / 2 - w / 2 + offset.x * s, OUT / 2 - h / 2 + offset.y * s, w, h);
    onApply(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <motion.div className="fixed inset-0 z-[75] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`Crop image for ${name}`}>
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm rounded-[24px] bg-white p-5 shadow-lift">
        <h3 className="font-display text-lg font-bold">Crop image</h3>
        <p className="mt-0.5 text-xs text-ink-400">Drag to reposition · pinch the slider to zoom</p>

        <div
          className="relative mx-auto mt-4 touch-none overflow-hidden rounded-2xl bg-ink-100 select-none"
          style={{ width: CROP_VIEW, height: CROP_VIEW, cursor: "grab" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragRef.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
          }}
          onPointerMove={(e) => {
            if (!dragRef.current) return;
            setOffset({
              x: Math.max(-maxX, Math.min(maxX, dragRef.current.ox + (e.clientX - dragRef.current.px))),
              y: Math.max(-maxY, Math.min(maxY, dragRef.current.oy + (e.clientY - dragRef.current.py))),
            });
          }}
          onPointerUp={() => (dragRef.current = null)}
          onPointerCancel={() => (dragRef.current = null)}
        >
          {img && (
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{ width: drawW, height: drawH, left: CROP_VIEW / 2 - drawW / 2 + offset.x, top: CROP_VIEW / 2 - drawH / 2 + offset.y }}
            />
          )}
          {/* Circular guide */}
          <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/90 shadow-[0_0_0_999px_rgba(20,18,31,0.3)]" aria-hidden />
        </div>

        <label className="mt-4 block">
          <span className="mb-1 flex justify-between text-xs font-bold text-ink-500">
            Zoom <span>{zoom.toFixed(1)}×</span>
          </span>
          <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom" aria-valuetext={`${zoom.toFixed(1)} times`} className="w-full cursor-pointer accent-brand-500" />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <Btn variant="outline" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn size="sm" onClick={apply} disabled={!img}>
            <Crop className="h-4 w-4" aria-hidden /> Apply crop
          </Btn>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------- Preview modal ------------------------------ */

function PreviewModal({ name, photo, icon, onClose }: { name: string; photo: string | null; icon: string | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-[75] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`Image preview for ${name}`}>
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xs rounded-[24px] bg-white p-6 text-center shadow-lift">
        {photo ? (
          <img src={photo} alt={`Image for ${name}`} className="mx-auto h-48 w-48 rounded-full border-4 border-white object-cover shadow-lift" />
        ) : (
          <p className="text-8xl" aria-hidden>{icon}</p>
        )}
        <p className="mt-4 font-display text-xl font-bold break-words">{name}</p>
        <Btn variant="outline" size="sm" onClick={onClose} className="mt-4">Close</Btn>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------- Main tool -------------------------------- */

export default function WheelTool({ initialEntries, initialName }: { initialEntries?: string[] | null; initialName?: string }) {
  const initial = useMemo(() => {
    if (initialEntries) {
      return { items: initialEntries.map((t) => ({ text: t, weight: 1 })), title: initialName ?? "Shared wheel" };
    }
    const stored = loadCurrentWheel();
    return stored ?? { items: DEFAULT_ENTRIES.map((t) => ({ text: t, weight: 1 })), title: "My Wheel" };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Core state */
  const [items, setItems] = useState<EntryItem[]>(initial.items);
  const [title, setTitle] = useState(initial.title);
  const [ws, setWs] = useState<WheelSettings>(loadWheelSettings);

  /* Multi-wheel library */
  const [library, setLibrary] = useState<LibraryWheel[]>(loadLibrary);
  const [activeId, setActiveId] = useState<string | null>(loadActiveId);
  const libraryRef = useRef(library);
  libraryRef.current = library;
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [wheels, setWheels] = useState<SavedWheel[]>(loadWheels);
  const [winner, setWinner] = useState<{ name: string; entryIndex: number; photo?: string | null; icon?: string | null } | null>(null);

  /* UI state */
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [modalShare, setModalShare] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [quickAdd, setQuickAdd] = useState("");
  const [cropTarget, setCropTarget] = useState<{ index: number; src: string; name: string } | null>(null);
  const [previewTarget, setPreviewTarget] = useState<{ name: string; photo: string | null; icon: string | null } | null>(null);

  const stageRef = useRef<WheelStageHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const autoTimer = useRef(0);
  const spinSnapshotRef = useRef<{ label: string; weight: number; entryIndex: number; photo?: string | null; icon?: string | null }[] | null>(null);

  /* Undo / redo */
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const undoStack = useRef<EntryItem[][]>([]);
  const redoStack = useRef<EntryItem[][]>([]);
  const lastSnapAt = useRef(0);
  const [, bumpVersion] = useState(0);

  const mutate = useCallback((fn: (prev: EntryItem[]) => EntryItem[], undoMode: "always" | "throttled" | "none" = "always") => {
    const prev = itemsRef.current;
    const next = fn(prev);
    if (next === prev) return;
    if (undoMode !== "none") {
      const now = Date.now();
      if (undoMode === "always" || now - lastSnapAt.current > 700) {
        undoStack.current.push(prev);
        if (undoStack.current.length > 60) undoStack.current.shift();
        redoStack.current = [];
        lastSnapAt.current = now;
      }
    }
    itemsRef.current = next;
    setItems(next);
    bumpVersion((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(itemsRef.current);
    itemsRef.current = prev;
    setItems(prev);
    bumpVersion((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(itemsRef.current);
    itemsRef.current = next;
    setItems(next);
    bumpVersion((v) => v + 1);
  }, []);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  /* Persistence */
  useEffect(() => saveCurrentWheel(items, title), [items, title]);
  useEffect(() => saveHistory(history), [history]);
  useEffect(() => saveWheels(wheels), [wheels]);
  useEffect(() => {
    const ok = saveWheelSettings(ws);
    setSoundVolume(ws.volume);
    // Keep the site-wide quick settings (used by other tools) in sync
    saveSettings({ sound: ws.soundOn, confetti: ws.confetti, theme: "classic" });
    if (!ok) notify("Couldn't save — the image may be too large for browser storage. Try a smaller one.");
  }, [ws, notify]);

  useEffect(() => () => window.clearTimeout(autoTimer.current), []);

  const patchWs = useCallback((patch: Partial<WheelSettings>) => setWs((s) => ({ ...s, ...patch })), []);

  /* ------------------------- Multi-wheel library logic ------------------------ */

  const normalizeSettings = (s: Partial<WheelSettings>): WheelSettings => ({
    ...DEFAULT_WHEEL_SETTINGS,
    ...s,
    images: { ...DEFAULT_WHEEL_SETTINGS.images, ...(s.images ?? {}) },
  });

  // Hydrate the active wheel from the library once on mount.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const lib = loadLibrary();
    const aid = loadActiveId();
    setLibrary(lib);
    if (aid) {
      const w = lib.find((x) => x.id === aid);
      if (w) {
        setItems(w.items);
        setTitle(w.title);
        setWs(normalizeSettings(w.settings));
        setActiveId(aid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced autosave: keep the active library entry in sync with the live state.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const t = window.setTimeout(() => {
      setLibrary((lib) => {
        const id = activeIdRef.current;
        const entry: LibraryWheel = makeLibraryWheel(title, items, ws);
        let next: LibraryWheel[];
        if (id && lib.some((w) => w.id === id)) {
          next = lib.map((w) => (w.id === id ? { ...entry, id } : w));
        } else {
          next = [entry, ...lib];
          activeIdRef.current = entry.id;
          setActiveId(entry.id);
          saveActiveId(entry.id);
        }
        saveLibrary(next);
        return next;
      });
    }, 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, title, ws]);

  const switchToWheel = useCallback(
    (id: string) => {
      if (id === activeIdRef.current) return;
      const lib = libraryRef.current;
      const w = lib.find((x) => x.id === id);
      if (!w) return;
      // Flush the current wheel's latest state before switching so no edits are lost
      const current = makeLibraryWheel(title, items, ws);
      const aid = activeIdRef.current;
      const flushed =
        aid && lib.some((x) => x.id === aid)
          ? lib.map((x) => (x.id === aid ? { ...current, id: aid } : x))
          : [current, ...lib];
      saveLibrary(flushed);
      setLibrary(flushed);
      libraryRef.current = flushed;
      setItems(w.items);
      setTitle(w.title);
      setWs(normalizeSettings(w.settings));
      setActiveId(id);
      activeIdRef.current = id;
      saveActiveId(id);
      setWinner(null);
      notify(`Loaded “${w.title}”`);
    },
    [notify, title, items, ws],
  );

  const createNewWheel = useCallback(() => {
    // Flush the current wheel first
    const current = makeLibraryWheel(title, items, ws);
    const lib = libraryRef.current;
    const aid = activeIdRef.current;
    const flushed =
      aid && lib.some((x) => x.id === aid)
        ? lib.map((x) => (x.id === aid ? { ...current, id: aid } : x))
        : [current, ...lib];
    const fresh = blankWheel(flushed.length + 1);
    const next = [fresh, ...flushed];
    saveLibrary(next);
    setLibrary(next);
    libraryRef.current = next;
    setItems(fresh.items);
    setTitle(fresh.title);
    setWs(normalizeSettings(fresh.settings));
    setActiveId(fresh.id);
    activeIdRef.current = fresh.id;
    saveActiveId(fresh.id);
    setWinner(null);
    notify(`Created “${fresh.title}”`);
  }, [notify, title, items, ws]);

  const duplicateLibraryWheel = useCallback(
    (id: string) => {
      const src = libraryRef.current.find((w) => w.id === id);
      if (!src) return;
      const copy = makeLibraryWheel(`${src.title} (copy)`, src.items, normalizeSettings(src.settings));
      setLibrary((lib) => {
        const next = [copy, ...lib];
        saveLibrary(next);
        return next;
      });
      notify(`Duplicated “${src.title}”`);
    },
    [notify],
  );

  const deleteLibraryWheel = useCallback(
    (id: string) => {
      const target = libraryRef.current.find((w) => w.id === id);
      setLibrary((lib) => {
        const next = lib.filter((w) => w.id !== id);
        saveLibrary(next);
        return next;
      });
      if (activeIdRef.current === id) {
        // Deleted the active wheel → load the next one, or start fresh.
        const remaining = libraryRef.current.filter((w) => w.id !== id);
        if (remaining.length > 0) {
          const nxt = remaining[0];
          setItems(nxt.items);
          setTitle(nxt.title);
          setWs(normalizeSettings(nxt.settings));
          setActiveId(nxt.id);
          activeIdRef.current = nxt.id;
          saveActiveId(nxt.id);
        } else {
          const fresh = blankWheel(1);
          setLibrary([fresh]);
          saveLibrary([fresh]);
          setItems(fresh.items);
          setTitle(fresh.title);
          setWs(normalizeSettings(fresh.settings));
          setActiveId(fresh.id);
          activeIdRef.current = fresh.id;
          saveActiveId(fresh.id);
        }
        setWinner(null);
      }
      notify(target ? `Deleted “${target.title}”` : "Wheel deleted");
    },
    [notify],
  );

  /* Derived: active entries → eligible pool → geometry → segments */
  const active = useMemo(
    () =>
      items
        .map((it, i) => ({
          label: it.text.trim(),
          weight: it.weight,
          photo: it.photo ?? null,
          icon: it.icon ?? null,
          color: it.color ?? null,
          entryIndex: i,
        }))
        .filter((x) => x.label.length > 0),
    [items],
  );

  const excludedNames = useMemo(() => {
    const set = new Set<string>();
    if (ws.excludePreviousWinners) for (const h of history) set.add(h.name.toLowerCase());
    if (ws.preventImmediateRepeat && history[0]) set.add(history[0].name.toLowerCase());
    return set;
  }, [ws.excludePreviousWinners, ws.preventImmediateRepeat, history]);

  const pool = useMemo(() => active.filter((a) => !excludedNames.has(a.label.toLowerCase())), [active, excludedNames]);

  const activePoolRef = useRef(pool);
  activePoolRef.current = pool;
  const wsRef = useRef(ws);
  wsRef.current = ws;

  const appearance = useMemo(() => resolveAppearance(ws), [ws]);

  const { segs: geo, bounds } = useMemo(
    () => computeGeometry(pool.map((p) => (ws.probability === "weighted" ? p.weight : 1)), ws.segmentGap),
    [pool, ws.probability, ws.segmentGap],
  );

  const segments = useMemo(
    () =>
      pool.map((p, i) => {
        let color = p.color;
        if (!color) {
          let ci = i % appearance.palette.length;
          if (pool.length > 1 && i === pool.length - 1 && ci === 0) ci = 1;
          color = appearance.palette[ci];
        }
        return { label: p.label, color, start: geo[i]?.start ?? 0, end: geo[i]?.end ?? 360, photo: p.photo, icon: p.icon };
      }),
    [pool, appearance.palette, geo],
  );

  const wheelAppearance = useMemo<WheelAppearance>(
    () => ({
      borderWidth: appearance.borderWidth,
      borderColor: appearance.background || "#faf9f6",
      textColor: appearance.textColor,
      textScale: appearance.textSize / 100,
      rimColor: "#14121f",
      studColor: "#faf9f6",
    }),
    [appearance],
  );

  /* Spin result */
  const removeEntryByName = useCallback(
    (name: string, undoMode: "always" | "throttled" | "none" = "always") => {
      mutate((prev) => {
        const idx = prev.findIndex((e) => e.text.trim() === name);
        if (idx === -1) return prev;
        return prev.filter((_, j) => j !== idx);
      }, undoMode);
    },
    [mutate],
  );

  const handleWinner = useCallback(
    (segIndex: number) => {
      const source = spinSnapshotRef.current ?? activePoolRef.current;
      const item = source[segIndex];
      if (!item) return;
      const s = wsRef.current;
      setHistory((h) => [{ name: item.label, at: Date.now() }, ...h].slice(0, 40));
      if (s.soundOn && s.winnerSound) playCelebrationStyled(s.soundStyle);
      if (s.confetti) fireConfetti(1.3);
      if (s.removeWinnerAfterSpin) removeEntryByName(item.label, "always");
      if (s.showWinnerPopup) {
        setWinner({ name: item.label, entryIndex: item.entryIndex, photo: item.photo ?? null, icon: item.icon ?? null });
      } else {
        notify(`Winner: ${item.label}`);
      }
      if (s.autoContinue) {
        window.clearTimeout(autoTimer.current);
        autoTimer.current = window.setTimeout(() => stageRef.current?.spin(), 1800);
      }
    },
    [notify, removeEntryByName],
  );

  /* Entry operations */
  const updateEntry = (i: number, v: string) => mutate((prev) => prev.map((it, j) => (j === i ? { ...it, text: v } : it)), "throttled");
  const updateWeight = (i: number, w: number) => mutate((prev) => prev.map((it, j) => (j === i ? { ...it, weight: w } : it)), "throttled");
  const updatePhoto = (i: number, dataUrl: string) => mutate((prev) => prev.map((it, j) => (j === i ? { ...it, photo: dataUrl, icon: null } : it)));
  const updateIcon = (i: number, icon: string | null) => mutate((prev) => prev.map((it, j) => (j === i ? { ...it, icon, photo: icon ? null : it.photo } : it)));
  const updateColor = (i: number, color: string | null) => mutate((prev) => prev.map((it, j) => (j === i ? { ...it, color } : it)));
  const removeImage = (i: number) => mutate((prev) => prev.map((it, j) => (j === i ? { ...it, photo: null, icon: null } : it)));
  const handlePhotoFile = async (i: number, file: File) => {
    try {
      const dataUrl = await processImageFile(file, 220);
      updatePhoto(i, dataUrl);
      notify("Image added");
    } catch {
      notify("Couldn't read that image — PNG, JPG, WEBP or SVG up to 12 MB.");
    }
  };
  const handlePhotoUrl = async (i: number, url: string) => {
    try {
      const dataUrl = await processImageUrl(url, 220);
      updatePhoto(i, dataUrl);
      notify("Image added from URL");
    } catch {
      notify("Couldn't load that URL — check the link (the host must allow cross-origin reads).");
    }
  };
  const removeEntry = (i: number) => mutate((prev) => prev.filter((_, j) => j !== i));
  const addEntry = () => {
    mutate((prev) => [...prev, { text: "", weight: 1 }]);
    notify("Entry added");
  };
  const moveEntry = (i: number, dir: -1 | 1) =>
    mutate((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const handleDrop = () => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      mutate((prev) => {
        const next = prev.slice();
        const [moved] = next.splice(dragIdx, 1);
        next.splice(overIdx, 0, moved);
        return next;
      });
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  const applyPaste = (mode: "add" | "replace") => {
    const parsed = parseList(pasteText);
    if (parsed.length === 0) return;
    const newItems = parsed.map((t) => ({ text: t, weight: 1 }));
    mutate((prev) => (mode === "replace" ? newItems : [...prev.filter((e) => e.text.trim()), ...newItems]));
    setPasteText("");
    setShowPaste(false);
    notify(`${mode === "replace" ? "Replaced wheel with" : "Added"} ${parsed.length} entries`);
  };

  const importFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseList(text);
    if (parsed.length === 0) {
      notify("No entries found in file");
      return;
    }
    mutate((prev) => [...prev.filter((e) => e.text.trim()), ...parsed.map((t) => ({ text: t, weight: 1 }))]);
    notify(`Imported ${parsed.length} entries`);
  };

  const quickAddSubmit = () => {
    const v = quickAdd.trim();
    if (!v) return;
    mutate((prev) => [...prev, { text: v, weight: 1 }]);
    setQuickAdd("");
  };

  const dedupeItems = () => {
    mutate((prev) => {
      const seen = new Set<string>();
      const out: EntryItem[] = [];
      let removed = 0;
      for (const it of prev) {
        const key = it.text.trim().toLowerCase();
        if (!key) continue;
        if (seen.has(key)) {
          removed++;
          continue;
        }
        seen.add(key);
        out.push(it);
      }
      if (removed > 0) notify(`Removed ${removed} duplicate${removed === 1 ? "" : "s"}`);
      return out.length === prev.length ? prev : out;
    });
  };

  const removeEmptyItems = () => {
    mutate((prev) => {
      const out = prev.filter((it) => it.text.trim().length > 0);
      if (out.length !== prev.length) notify(`Removed ${prev.length - out.length} empty entries`);
      return out.length === prev.length ? prev : out;
    });
  };

  const exportEntriesTxt = () => {
    const lines = active.map((a) => (ws.probability === "weighted" && a.weight !== 1 ? `${a.label} (${a.weight}x)` : a.label));
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title.trim() || "wheel").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "wheel"}-entries.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    notify("Entries exported");
  };

  /* Wheel management */
  const saveCurrent = () => {
    setWheels((prev) => [makeSavedWheel(title, active.map((a) => ({ text: a.label, weight: a.weight, photo: a.photo }))), ...prev].slice(0, 24));
    notify("Wheel saved to your browser");
  };
  const duplicateCurrent = () => {
    setWheels((prev) => [makeSavedWheel(`${title} (copy)`, active.map((a) => ({ text: a.label, weight: a.weight, photo: a.photo }))), ...prev].slice(0, 24));
    notify("Wheel duplicated");
  };
  const loadWheel = (w: SavedWheel) => {
    mutate(() =>
      w.items && w.items.length > 0
        ? w.items.map((it) => ({ text: it.text, weight: it.weight, photo: it.photo ?? null }))
        : w.entries.map((t) => ({ text: t, weight: 1 })),
    );
    setTitle(w.name);
    setShowSaved(false);
    setWinner(null);
    notify(`Loaded “${w.name}”`);
  };
  const loadPreset = (p: (typeof PRESETS)[number]) => {
    mutate(() => p.entries.map((t) => ({ text: t, weight: 1 })));
    setTitle(p.name);
    setWinner(null);
    notify(`Loaded “${p.name}” sample`);
  };

  const doReset = () => {
    if (!resetArmed) {
      setResetArmed(true);
      window.setTimeout(() => setResetArmed(false), 3000);
      return;
    }
    mutate(() => DEFAULT_ENTRIES.map((t) => ({ text: t, weight: 1 })), "none");
    setTitle("My Wheel");
    setHistory([]);
    setWinner(null);
    undoStack.current = [];
    redoStack.current = [];
    setResetArmed(false);
    notify("Wheel reset");
  };

  const resetSettings = () => {
    setWs({ ...DEFAULT_WHEEL_SETTINGS });
    notify("Settings reset to defaults");
  };

  /* Winner actions */
  const removeWinner = () => {
    if (!winner) return;
    removeEntryByName(winner.name, "always");
    setWinner(null);
    notify("Winner removed from wheel");
  };
  const spinAgain = () => {
    setWinner(null);
    setModalShare(false);
    window.setTimeout(() => stageRef.current?.spin(), 60);
  };

  /* Modal a11y: focus + escape */
  useEffect(() => {
    if (!winner) {
      setModalShare(false);
      return;
    }
    modalRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWinner(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [winner]);

  /* Undo / redo keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  /* PDF data builder */
  const buildPdfData = useCallback((): WheelPdfData => {
    const s = wsRef.current;
    const app = resolveAppearance(s);
    return {
      title: title.trim() || "My Wheel",
      segments: segments.map((seg) => ({ label: seg.label, color: seg.color, start: seg.start, end: seg.end, photo: seg.photo ?? null, icon: seg.icon ?? null })),
      entries: active.map((a) => ({ text: a.label, weight: a.weight })),
      weighted: s.probability === "weighted",
      settingsSummary: [
        ["Spin duration", `${s.spinDuration} seconds`],
        ["Countdown", s.countdown > 0 ? `${s.countdown} seconds` : "Disabled"],
        ["Probability", s.probability === "weighted" ? "Weighted" : "Equal"],
        ["Winner removal", s.removeWinnerAfterSpin ? "Enabled" : "Disabled (winner kept)"],
        ["Previous winners", s.excludePreviousWinners ? "Excluded from the wheel" : "Allowed"],
        ["Immediate repeats", s.preventImmediateRepeat ? "Prevented" : "Allowed"],
        ["Sound", s.soundOn ? `${s.soundStyle} style · ${s.volume}% volume` : "Muted"],
        ["Theme", WHEEL_THEME_DEFS[s.theme].label],
        ["Entries on wheel", `${active.length}`],
      ],
      history,
      appearance: {
        hubColor: app.hubColor,
        textColor: app.textColor,
        borderWidth: app.borderWidth,
        borderColor: app.background || "#ffffff",
        centerImage: s.images.center,
        insetImage: s.images.inset,
      },
    };
  }, [title, segments, active, history]);

  const allExcluded = pool.length === 0 && active.length > 0;

  const iconBtn = "rounded-lg p-2 text-ink-500 transition hover:bg-ink-50 hover:text-ink-950 disabled:opacity-30 disabled:pointer-events-none";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Multi-wheel switcher */}
      <WheelSwitcher
        library={library}
        activeId={activeId}
        activeTitle={title}
        onSwitch={switchToWheel}
        onNew={createNewWheel}
        onDuplicate={duplicateLibraryWheel}
        onDelete={deleteLibraryWheel}
      />

      {/* Wheel title */}
      <div className="mb-6 text-center">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Wheel title"
          placeholder="My Wheel"
          maxLength={60}
          className="mx-auto block w-full max-w-xl bg-transparent text-center font-display text-2xl font-bold text-ink-950 outline-none placeholder:text-ink-200 focus:placeholder:text-ink-300 sm:text-3xl"
        />
        <p className="mt-1 text-xs font-semibold text-ink-300">Wheel title — used on screen and in PDF exports</p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ------------------------------ Wheel column ----------------------------- */}
        <div className="min-w-0">
          <WheelStage
            ref={stageRef}
            segments={segments}
            bounds={bounds}
            appearance={wheelAppearance}
            durationMs={ws.spinDuration * 1000}
            countdownSeconds={ws.countdown}
            lockWhileSpinning={ws.lockWhileSpinning}
            preventDoubleSpin={ws.preventDoubleSpin}
            inputLocked={winner !== null || settingsOpen || pdfOpen}
            soundOn={ws.soundOn}
            spinSound={ws.spinSound}
            countdownSound={ws.countdownSound}
            soundStyle={ws.soundStyle}
            onToggleSound={() => patchWs({ soundOn: !ws.soundOn })}
            pointerColor={appearance.pointerColor}
            hubColor={appearance.hubColor}
            stageBg={appearance.background}
            centerImage={ws.images.center}
            insetImage={ws.images.inset}
            backgroundImage={ws.images.background}
            pointerImage={ws.images.pointer}
            onWinner={handleWinner}
            onSpinStart={() => {
              spinSnapshotRef.current = activePoolRef.current;
              setWinner(null);
              setShareOpen(false);
              setModalShare(false);
              window.clearTimeout(autoTimer.current);
            }}
            ariaLabel="Spin the wheel to pick a random entry"
          />

          {allExcluded && (
            <div className="mx-auto mt-4 max-w-md rounded-2xl bg-sun-100/70 px-4 py-3 text-center text-sm font-semibold text-ink-700">
              Every entry is a previous winner.{" "}
              <button type="button" className="underline underline-offset-2" onClick={() => setHistory([])}>
                Clear history
              </button>{" "}
              to bring them back.
            </div>
          )}

          {!hideControls && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => patchWs({ confetti: !ws.confetti })}
                aria-pressed={ws.confetti}
                className={cx(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  ws.confetti ? "border-brand-200 bg-brand-50 text-brand-600" : "border-ink-200 bg-white text-ink-500 hover:text-ink-950",
                )}
              >
                <PartyPopper className="h-4 w-4" aria-hidden /> Confetti
              </button>

              <Btn variant="dark" size="md" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" aria-hidden /> Settings
              </Btn>

              <Btn variant="outline" size="md" onClick={() => setPdfOpen(true)}>
                <Download className="h-4 w-4" aria-hidden /> Download PDF
              </Btn>

              <button
                type="button"
                onClick={() => setHideControls(true)}
                className="flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-500 transition hover:text-ink-950"
              >
                <EyeOff className="h-4 w-4" aria-hidden /> Hide controls
              </button>
              <button
                type="button"
                onClick={() => setShareOpen((v) => !v)}
                aria-expanded={shareOpen}
                className={cx(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  shareOpen ? "border-brand-200 bg-brand-50 text-brand-600" : "border-ink-200 bg-white text-ink-500 hover:text-ink-950",
                )}
              >
                <Share2 className="h-4 w-4" aria-hidden /> Share
              </button>
              <button
                type="button"
                onClick={doReset}
                className={cx(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  resetArmed ? "border-coral-500 bg-coral-100 text-coral-600" : "border-ink-200 bg-white text-ink-500 hover:text-ink-950",
                )}
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> {resetArmed ? "Sure?" : "Reset"}
              </button>
              <p className="mt-3 hidden w-full text-center text-xs font-semibold text-ink-300 md:block">
                Tip: press Space to spin · Ctrl+Z to undo entry changes
              </p>
            </div>
          )}

          {hideControls && (
            <div className="mt-6 flex justify-center">
              <Btn variant="outline" size="sm" onClick={() => setHideControls(false)}>
                <Eye className="h-4 w-4" aria-hidden /> Show controls
              </Btn>
            </div>
          )}

          <AnimatePresence>
            {shareOpen && !hideControls && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mx-auto mt-4 max-w-xl">
                <Card className="p-4">
                  <SharePanel entries={active.map((a) => a.label)} />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ------------------------------ Editor column ------------------------------ */}
        {!hideControls && (
          <aside className="min-w-0 space-y-5">
            {/* Entries */}
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">
                  Entries <span className="text-sm font-semibold text-ink-400">({active.length})</span>
                </h2>
                <div className="flex flex-wrap items-center gap-0.5">
                  <button type="button" title="Undo" aria-label="Undo" onClick={undo} disabled={undoStack.current.length === 0} className={iconBtn}>
                    <Undo2 className="h-4 w-4" />
                  </button>
                  <button type="button" title="Redo" aria-label="Redo" onClick={redo} disabled={redoStack.current.length === 0} className={iconBtn}>
                    <Redo2 className="h-4 w-4" />
                  </button>
                  <button type="button" title="Shuffle entries" aria-label="Shuffle entries" onClick={() => mutate((prev) => shuffle(prev))} className={iconBtn}>
                    <Shuffle className="h-4 w-4" />
                  </button>
                  <button type="button" title="Sort A–Z" aria-label="Sort entries A to Z" onClick={() => mutate((prev) => [...prev].sort((a, b) => a.text.localeCompare(b.text)))} className={iconBtn}>
                    <ArrowUpNarrowWide className="h-4 w-4" />
                  </button>
                  <button type="button" title="Sort Z–A" aria-label="Sort entries Z to A" onClick={() => mutate((prev) => [...prev].sort((a, b) => b.text.localeCompare(a.text)))} className={iconBtn}>
                    <ArrowDownWideNarrow className="h-4 w-4" />
                  </button>
                  <button type="button" title="Remove duplicates" aria-label="Remove duplicate entries" onClick={dedupeItems} className={iconBtn}>
                    <Filter className="h-4 w-4" />
                  </button>
                  <button type="button" title="Remove empty entries" aria-label="Remove empty entries" onClick={removeEmptyItems} className={iconBtn}>
                    <Eraser className="h-4 w-4" />
                  </button>
                  <button type="button" title="Paste a list" aria-label="Paste a list" onClick={() => setShowPaste((v) => !v)} className={cx(iconBtn, showPaste && "bg-brand-50 text-brand-600")}>
                    <ClipboardPaste className="h-4 w-4" />
                  </button>
                  <button type="button" title="Import a text file" aria-label="Import a text file" onClick={() => fileRef.current?.click()} className={iconBtn}>
                    <Upload className="h-4 w-4" />
                  </button>
                  <button type="button" title="Export entries as .txt" aria-label="Export entries as text file" onClick={exportEntriesTxt} className={iconBtn}>
                    <Download className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.csv,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void importFile(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              <AnimatePresence>
                {showPaste && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      rows={4}
                      placeholder={"Paste a list — one entry per line…"}
                      aria-label="Paste a list"
                      className="mb-2 w-full resize-y rounded-xl border border-ink-200 bg-ink-50/50 p-3 text-sm outline-none focus:border-brand-300 focus:bg-white"
                    />
                    <div className="mb-3 flex gap-2">
                      <Btn size="sm" onClick={() => applyPaste("add")}>Add to wheel</Btn>
                      <Btn size="sm" variant="outline" onClick={() => applyPaste("replace")}>Replace wheel</Btn>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick add */}
              <form
                className="mb-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  quickAddSubmit();
                }}
              >
                <input
                  value={quickAdd}
                  onChange={(e) => setQuickAdd(e.target.value)}
                  placeholder="Quick add an entry…"
                  aria-label="Quick add an entry"
                  className="w-full min-w-0 rounded-xl border border-ink-200 px-3.5 py-2 text-sm outline-none placeholder:text-ink-300 focus:border-brand-300"
                />
                <Btn size="sm" type="submit" disabled={!quickAdd.trim()}>
                  <Plus className="h-4 w-4" aria-hidden /> Add
                </Btn>
              </form>

              {/* Sample presets */}
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wide text-ink-400 uppercase">Samples</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => loadPreset(p)}
                    className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-600"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {ws.probability === "weighted" && (
                <p className="mb-2 rounded-xl bg-brand-50 px-3 py-2 text-xs leading-snug text-brand-700">
                  Weighted mode: set each entry's <strong>×</strong> value — higher weights win more often.
                </p>
              )}

              <ul className="thin-scroll max-h-[340px] space-y-1 overflow-y-auto pr-1" aria-label="Wheel entries">
                {items.map((it, i) => (
                  <EntryRow
                    key={i}
                    item={it}
                    index={i}
                    count={items.length}
                    weighted={ws.probability === "weighted"}
                    isDragging={dragIdx === i}
                    isOver={overIdx === i && dragIdx !== null && dragIdx !== i}
                    onChange={(v) => updateEntry(i, v)}
                    onWeight={(w) => updateWeight(i, w)}
                    onPhotoFile={(f) => void handlePhotoFile(i, f)}
                    onPhotoUrl={(url) => void handlePhotoUrl(i, url)}
                    onIcon={(icon) => updateIcon(i, icon)}
                    onColor={(color) => updateColor(i, color)}
                    onRemoveImage={() => removeImage(i)}
                    onCrop={() => {
                      if (it.photo) setCropTarget({ index: i, src: it.photo, name: it.text.trim() || `Entry ${i + 1}` });
                    }}
                    onPreview={() => setPreviewTarget({ name: it.text.trim() || `Entry ${i + 1}`, photo: it.photo ?? null, icon: it.icon ?? null })}
                    onRemove={() => removeEntry(i)}
                    onMove={(dir) => moveEntry(i, dir)}
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={(ev) => {
                      ev.preventDefault();
                      setOverIdx(i);
                    }}
                    onDrop={handleDrop}
                    onDragEnd={() => {
                      setDragIdx(null);
                      setOverIdx(null);
                    }}
                  />
                ))}
              </ul>

              <div className="mt-3 flex gap-2">
                <Btn size="sm" onClick={addEntry} className="flex-1">
                  <Plus className="h-4 w-4" aria-hidden /> Add entry
                </Btn>
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    mutate(() => []);
                    notify("All entries removed");
                  }}
                >
                  Clear
                </Btn>
              </div>
            </Card>

            {/* Wheel management */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">My wheels</h2>
                <button
                  type="button"
                  onClick={() => setShowSaved((v) => !v)}
                  aria-expanded={showSaved}
                  className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-ink-300 hover:text-ink-950"
                >
                  <FolderOpen className="h-3.5 w-3.5" aria-hidden />
                  {wheels.length > 0 ? `Saved (${wheels.length})` : "Saved"}
                </button>
              </div>

              <AnimatePresence>
                {showSaved && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="thin-scroll mt-3 max-h-44 space-y-1.5 overflow-y-auto">
                    {wheels.length === 0 && <li className="text-sm text-ink-400">No saved wheels yet — save yours below.</li>}
                    {wheels.map((w) => (
                      <li key={w.id} className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
                        <button type="button" onClick={() => loadWheel(w)} className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-semibold text-ink-900">{w.name}</span>
                          <span className="text-xs text-ink-400">{w.entries.length} entries</span>
                        </button>
                        <button type="button" onClick={() => setWheels((prev) => prev.filter((x) => x.id !== w.id))} aria-label={`Delete ${w.name}`} className="rounded p-1.5 text-ink-400 transition hover:text-coral-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              <div className="mt-3 flex gap-2">
                <Btn size="sm" variant="dark" onClick={saveCurrent} className="ml-auto">
                  <Save className="h-4 w-4" aria-hidden /> Save wheel
                </Btn>
                <Btn size="sm" variant="outline" onClick={duplicateCurrent}>
                  Duplicate
                </Btn>
              </div>
            </Card>

            {/* History */}
            {ws.showHistory && (
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">Winner history</h2>
                  {history.length > 0 && (
                    <button type="button" onClick={() => setHistory([])} className="text-xs font-semibold text-ink-400 transition hover:text-coral-600">
                      Clear
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <p className="text-sm text-ink-400">No spins yet. Results will appear here.</p>
                ) : (
                  <ol className="thin-scroll max-h-56 space-y-1.5 overflow-y-auto">
                    {history.map((h, i) => (
                      <li key={`${h.at}-${i}`} className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2">
                        <span className="min-w-0 truncate text-sm font-semibold text-ink-900">{h.name}</span>
                        <span className="ml-3 shrink-0 text-xs text-ink-400">
                          {new Date(h.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            )}
          </aside>
        )}
      </div>

      {/* ------------------------------ Winner modal ------------------------------ */}
      <AnimatePresence>
        {winner && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`Winner: ${winner.name}`}>
            <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setWinner(null)} aria-hidden />
            <motion.div
              ref={modalRef}
              tabIndex={-1}
              initial={{ scale: 0.82, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="thin-scroll relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-6 text-center shadow-lift outline-none sm:p-8"
            >
              <button type="button" onClick={() => setWinner(null)} aria-label="Close" className="absolute top-4 right-4 rounded-full p-2 text-ink-400 transition hover:bg-ink-50 hover:text-ink-950">
                <X className="h-5 w-5" />
              </button>
              <p className="text-xs font-bold tracking-[0.22em] text-brand-500 uppercase">🎉 Winner</p>

              {/* Large winner image / emoji */}
              {winner.photo ? (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0, rotate: -6 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
                  className="mt-4 flex justify-center"
                >
                  <img
                    src={winner.photo}
                    alt={`Photo of ${winner.name}`}
                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lift ring-4 ring-brand-100 sm:h-40 sm:w-40"
                  />
                </motion.div>
              ) : winner.icon ? (
                <motion.p
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
                  className="mt-4 text-7xl"
                  aria-hidden
                >
                  {winner.icon}
                </motion.p>
              ) : null}

              <p className="mt-3 font-display text-3xl leading-tight font-bold break-words text-ink-950 text-balance sm:text-4xl">{winner.name}</p>
              <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                <Btn onClick={spinAgain}>Spin again</Btn>
                <Btn variant="outline" onClick={removeWinner}>Remove winner</Btn>
                <CopyButton text={winner.name} label="Copy" size="md" />
                <Btn variant="outline" onClick={() => setModalShare((v) => !v)} aria-expanded={modalShare}>
                  <Share2 className="h-4 w-4" aria-hidden /> Share
                </Btn>
              </div>
              <AnimatePresence>
                {modalShare && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <SharePanel entries={active.map((a) => a.label)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings + PDF dialogs */}
      <WheelSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        ws={ws}
        onChange={patchWs}
        onResetSettings={resetSettings}
        onResetWheel={doReset}
        onOpenPdf={() => setPdfOpen(true)}
        onExportEntries={exportEntriesTxt}
        entryCount={active.length}
      />
      <PdfExportDialog open={pdfOpen} onClose={() => setPdfOpen(false)} getData={buildPdfData} />

      {/* Image crop & preview modals */}
      <AnimatePresence>
        {cropTarget && (
          <CropModal
            src={cropTarget.src}
            name={cropTarget.name}
            onClose={() => setCropTarget(null)}
            onApply={(dataUrl) => {
              updatePhoto(cropTarget.index, dataUrl);
              setCropTarget(null);
              notify("Image cropped");
            }}
          />
        )}
        {previewTarget && (
          <PreviewModal name={previewTarget.name} photo={previewTarget.photo} icon={previewTarget.icon} onClose={() => setPreviewTarget(null)} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="fixed bottom-6 left-1/2 z-[80] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl bg-ink-950 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lift">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
