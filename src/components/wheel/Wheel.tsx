import { memo, useId, useMemo } from "react";
import { textColorFor } from "../../lib/themes";

export interface WheelSegmentDatum {
  label: string;
  color: string;
  /** Geometry in degrees, clockwise from top — supports weighted segments. */
  start: number;
  end: number;
  /** Optional participant photo shown as a circular avatar in the segment. */
  photo?: string | null;
  /** Optional emoji icon shown when no photo is set. */
  icon?: string | null;
}

export interface WheelAppearance {
  borderWidth: number;
  borderColor: string;
  textColor: string | null; // null = auto-contrast per segment
  textScale: number; // 1 = 100%
  rimColor: string;
  studColor: string;
}

export const DEFAULT_WHEEL_APPEARANCE: WheelAppearance = {
  borderWidth: 2.5,
  borderColor: "#faf9f6",
  textColor: null,
  textScale: 1,
  rimColor: "#14121f",
  studColor: "#faf9f6",
};

const SIZE = 640;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2 - 14;

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  // 0deg = up, clockwise positive
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function arcPath(startAngle: number, endAngle: number, radius: number): string {
  const start = polar(startAngle, radius);
  const end = polar(endAngle, radius);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function truncate(label: string, max: number): string {
  return label.length > max ? label.slice(0, max - 1).trimEnd() + "…" : label;
}

/* ---------------------------------------------------------------------------
 * Label fit engine
 *
 * Every label runs radially along its segment's bisector. For each entry the
 * engine computes the space that segment actually offers — radial length from
 * the inner exclusion zone (hub / center image / inset image / avatar) to the
 * rim, and perpendicular width from the segment angle at its narrowest point —
 * then chooses, per entry, with this priority:
 *   1. the LARGEST font that fits (never shrink as a first resort)
 *   2. split into TWO balanced lines before shrinking the font tiny
 *   3. gradually reduce font size only when needed
 *   4. intelligent "…" truncation only as a last resort
 *   5. initials, or nothing, for segments too small for readable text
 * Every segment independently gets the largest readable font that fits, so
 * short entries stay large while long ones wrap instead of becoming tiny.
 * Text is always contained inside its own segment and can never overlap a
 * neighbour, the pointer zone, or the center button.
 * ------------------------------------------------------------------------- */

let measureCtx: CanvasRenderingContext2D | null | undefined;

export function textWidth(text: string, fontSize: number): number {
  try {
    if (measureCtx === undefined) measureCtx = document.createElement("canvas").getContext("2d");
    if (measureCtx) {
      measureCtx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      return measureCtx.measureText(text).width;
    }
  } catch {
    /* no canvas available */
  }
  return text.length * fontSize * 0.56; // conservative fallback
}

function getInitials(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** Split into two lines balanced by length, preferring word boundaries. */
function splitBalanced(text: string): [string, string] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    const m = Math.ceil(text.length / 2);
    return [text.slice(0, m).trim(), text.slice(m).trim()];
  }
  let best = 1;
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length;
    const b = words.slice(i).join(" ").length;
    const score = Math.max(a, b);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Longest prefix of `text` that fits within `maxWidth` at `fontSize`, plus "…". */
function truncateToFit(text: string, fontSize: number, maxWidth: number): string {
  if (textWidth(text, fontSize) <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const m = Math.ceil((lo + hi) / 2);
    if (textWidth(text.slice(0, m).trimEnd() + "…", fontSize) <= maxWidth) lo = m;
    else hi = m - 1;
  }
  const cut = text.slice(0, lo).trimEnd();
  return cut ? `${cut}…` : "…";
}

interface LabelLayout {
  lines: string[];
  fontSize: number;
  mid: number;
  innerR: number;
  outerR: number;
  flip: boolean;
}

/**
 * Fit one entry's text into the space its segment offers.
 * Returns null when nothing legible fits (segment keeps its color/avatar).
 *
 * PRIORITY (most important first):
 *   1. Use the LARGEST font possible — never shrink as a first resort.
 *   2. Prefer splitting into TWO lines over shrinking the font tiny.
 *   3. Gradually reduce font size only when needed.
 *   4. Truncate with "…" only as a last resort.
 *
 * Geometry: the label band runs radially, so its perpendicular thickness
 * must fit inside the segment's angular width at the narrowest cross-section
 * (innerR), while each line's length must fit the available radial span L.
 * Each segment independently gets the largest readable font that fits.
 */

// Perpendicular (across-segment) space a line of text needs, per font-size unit.
const LINE_INK = 1.15; // one line ≈ 1.15 × fontSize of across-segment space
const STACK_INK = 2.35; // two stacked lines ≈ 2.35 × fontSize
const WIDTH_SAFETY = 0.9; // keep a little breathing room from segment edges

/** Largest font in [floor, start] whose measured width fits `maxWidth`. */
function largestFitFont(widthAt: (f: number) => number, maxWidth: number, start: number, floor: number): number | null {
  if (start < floor) return null;
  if (widthAt(start) <= maxWidth) return start;
  let f = start;
  while (f > floor) {
    f = Math.max(floor, f * 0.92);
    if (widthAt(f) <= maxWidth) return f;
    if (f === floor) break;
  }
  return widthAt(floor) <= maxWidth ? floor : null;
}

export function fitLabel(
  rawText: string,
  segAngleDeg: number,
  innerR: number,
  outerR: number,
  capFont: number,
  textScale: number,
): LabelLayout | null {
  const text = rawText.trim();
  if (!text) return null;

  const mid = 0; // set by caller via returned object spread
  const flip = false;
  const base = { mid, flip, innerR, outerR };

  const L = outerR - innerR - 6; // usable radial span (padding from rim/hub)
  if (L < 14) return null;

  const halfRad = (segAngleDeg / 2) * Math.PI / 180;
  const widthAtInner = 2 * innerR * Math.sin(halfRad); // narrowest cross-section

  // Readable floor — text is never rendered smaller than this.
  const MIN = Math.max(9, 10 * textScale);
  const cap = capFont * textScale;

  // Perpendicular caps: the biggest font whose line-stack fits the segment width.
  const maxByWidth1 = (widthAtInner * WIDTH_SAFETY) / LINE_INK; // one line
  const maxByWidth2 = (widthAtInner * WIDTH_SAFETY) / STACK_INK; // two lines

  // Segment far too narrow for readable text — try initials, else nothing.
  if (maxByWidth1 < MIN) {
    const ini = getInitials(text);
    if (ini && textWidth(ini, MIN) <= L && widthAtInner >= MIN * LINE_INK) {
      return { ...base, lines: [ini], fontSize: MIN };
    }
    return null;
  }

  // ---- Option A: ONE line — largest font that fits the radial span ----
  const startA = Math.min(cap, maxByWidth1);
  const fontA = largestFitFont((f) => textWidth(text, f), L, startA, MIN);

  // ---- Option B: TWO balanced lines (only when there's a word break) ----
  let fontB: number | null = null;
  let lineA = "";
  let lineB = "";
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && maxByWidth2 >= MIN) {
    [lineA, lineB] = splitBalanced(text);
    if (lineA && lineB) {
      const startB = Math.min(cap, maxByWidth2);
      const widest = (f: number) => Math.max(textWidth(lineA, f), textWidth(lineB, f));
      fontB = largestFitFont(widest, L, startB, MIN);
    }
  }

  // ---- Choose whichever yields the LARGER readable font ----
  // (Two lines win for long text because they allow a bigger font; a tie goes
  // to the cleaner single line.)
  if (fontA !== null && fontB !== null) {
    if (fontB > fontA) return { ...base, lines: [lineA, lineB], fontSize: fontB };
    return { ...base, lines: [text], fontSize: fontA };
  }
  if (fontA !== null) return { ...base, lines: [text], fontSize: fontA };
  if (fontB !== null) return { ...base, lines: [lineA, lineB], fontSize: fontB };

  // ---- Last resort: intelligent truncation at the readable floor ----
  const floorFont = Math.max(MIN, Math.min(cap, maxByWidth1));
  if (widthAtInner >= floorFont * LINE_INK) {
    // Prefer two truncated lines when that fits better than one.
    if (words.length >= 2 && widthAtInner >= floorFont * STACK_INK) {
      const [a, b] = splitBalanced(text);
      if (a && b) {
        return { ...base, lines: [truncateToFit(a, floorFont, L), truncateToFit(b, floorFont, L)], fontSize: floorFont };
      }
    }
    const t1 = truncateToFit(text, floorFont, L);
    if (t1.length > 1) return { ...base, lines: [t1], fontSize: floorFont };
  }

  // Absolute fallback: initials.
  const ini = getInitials(text);
  if (ini && widthAtInner >= MIN * LINE_INK && textWidth(ini, MIN) <= L) {
    return { ...base, lines: [ini], fontSize: MIN };
  }
  return null;
}

/* --------------------------------------------------------------------------- */

interface WheelProps {
  segments: WheelSegmentDatum[];
  rotation: number;
  /** When set, this segment stays bright while the others dim (winner spotlight). */
  highlightIndex?: number | null;
  appearance?: WheelAppearance;
  /** Image embedded in the wheel disc — rotates with the wheel. */
  insetImage?: string | null;
}

/** Radius of the inset image disc, relative to the wheel radius. */
const INSET_R = 0.46;

/**
 * Pure presentational SVG wheel. Memoized so per-frame rotation updates
 * (applied to a parent wrapper) never rebuild the SVG tree.
 */
export const Wheel = memo(function Wheel({
  segments,
  rotation,
  highlightIndex = null,
  appearance = DEFAULT_WHEEL_APPEARANCE,
  insetImage = null,
}: WheelProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const n = segments.length;

  const segs = useMemo(
    () => segments.map((s, i) => ({ ...s, mid: (s.start + s.end) / 2, index: i })),
    [segments],
  );

  const dimmed = (i: number) => highlightIndex !== null && highlightIndex !== i;

  /* Participant avatars (photo or emoji) — circular, sized to fit each segment */
  const hasAvatars = n > 1 && n <= 64 && segs.some((s) => Boolean(s.photo || s.icon));
  const segAngleEven = n > 0 ? 360 / n : 360;
  const avatarPosR = R * 0.58;
  const chord = 2 * avatarPosR * Math.sin(((segAngleEven / 2) * Math.PI) / 180);
  const avatarR = Math.max(15, Math.min(52, chord * 0.42));
  const avatarPos = (mid: number) => polar(mid, avatarPosR);

  /* Per-segment label layouts — computed from real available space */
  const labelLayouts = useMemo(() => {
    if (n < 2) return [] as (LabelLayout & { index: number; color: string })[];
    const capFont = n <= 6 ? 34 : n <= 10 ? 29 : n <= 16 ? 24 : n <= 24 ? 20 : n <= 36 ? 16 : 13;
    const outerR = R - 8; // rim clearance
    return segs
      .map((s) => {
        const withAvatar = hasAvatars && Boolean(s.photo || s.icon);
        // Avatar segments with almost no angular space: the avatar speaks for itself
        if (withAvatar && s.end - s.start < 7) return null;
        // Inner exclusion zone: center button / center image / inset / avatar
        let innerR = R * 0.36;
        if (insetImage) innerR = Math.max(innerR, R * (INSET_R + 0.04));
        if (withAvatar) innerR = Math.max(innerR, avatarPosR + avatarR + 8);
        const layout = fitLabel(s.label, s.end - s.start, innerR, outerR, capFont, appearance.textScale);
        if (!layout) return null;
        return { ...layout, mid: s.mid, flip: s.mid > 90 && s.mid < 270, index: s.index, color: s.color };
      })
      .filter((x): x is LabelLayout & { index: number; color: string } => x !== null);
  }, [segs, n, hasAvatars, insetImage, avatarPosR, avatarR, appearance.textScale]);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="block h-full w-full select-none"
      role="img"
      aria-label={`Wheel with ${n} options`}
    >
      <defs>
        <filter id={`rim-shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#14121f" floodOpacity="0.28" />
        </filter>
        <radialGradient id={`gloss-${uid}`} cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </radialGradient>
        {insetImage && (
          <clipPath id={`inset-clip-${uid}`}>
            <circle cx={CX} cy={CY} r={R * INSET_R} />
          </clipPath>
        )}
        {hasAvatars &&
          segs
            .filter((s) => Boolean(s.photo))
            .map((s) => {
              const p = avatarPos(s.mid);
              return (
                <clipPath id={`avatar-clip-${uid}-${s.index}`} key={`avatar-clip-${s.index}`}>
                  <circle cx={p.x} cy={p.y} r={avatarR} />
                </clipPath>
              );
            })}
      </defs>

      {/* Outer rim */}
      <circle cx={CX} cy={CY} r={R + 10} fill={appearance.rimColor} filter={`url(#rim-shadow-${uid})`} />
      <circle cx={CX} cy={CY} r={R + 10} fill="none" stroke="#2a2544" strokeWidth="2" />

      <g transform={`rotate(${rotation} ${CX} ${CY})`}>
        {n === 0 ? (
          <circle cx={CX} cy={CY} r={R} fill="#e9e7f0" />
        ) : n === 1 ? (
          <>
            <circle cx={CX} cy={CY} r={R} fill={segments[0].color} />
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={34 * appearance.textScale}
              fontWeight={700}
              fill={appearance.textColor ?? textColorFor(segments[0].color)}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {truncate(segments[0].label, 20)}
            </text>
          </>
        ) : (
          segs.map((s) => (
            <path
              key={s.index}
              d={arcPath(s.start, s.end, R)}
              fill={s.color}
              stroke={appearance.borderWidth > 0 ? appearance.borderColor : "none"}
              strokeWidth={appearance.borderWidth}
              opacity={dimmed(s.index) ? 0.38 : 1}
              style={{ transition: "opacity 0.35s ease" }}
            />
          ))
        )}

        {/* Gloss overlay */}
        <circle cx={CX} cy={CY} r={R} fill={`url(#gloss-${uid})`} pointerEvents="none" />

        {/* Inset image — embedded in the wheel disc, rotates with it */}
        {insetImage && (
          <g pointerEvents="none">
            <image
              href={insetImage}
              x={CX - R * INSET_R}
              y={CY - R * INSET_R}
              width={R * INSET_R * 2}
              height={R * INSET_R * 2}
              clipPath={`url(#inset-clip-${uid})`}
              preserveAspectRatio="xMidYMid slice"
            />
            <circle cx={CX} cy={CY} r={R * INSET_R} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.95} />
          </g>
        )}

        {/* Participant avatars — photo or emoji, rotate with the wheel */}
        {hasAvatars &&
          segs.map((s) => {
            if (!s.photo && !s.icon) return null;
            const p = avatarPos(s.mid);
            return (
              <g key={`avatar-${s.index}`} pointerEvents="none" opacity={dimmed(s.index) ? 0.38 : 1} style={{ transition: "opacity 0.35s ease" }}>
                {s.photo ? (
                  <>
                    <image
                      href={s.photo}
                      x={p.x - avatarR}
                      y={p.y - avatarR}
                      width={avatarR * 2}
                      height={avatarR * 2}
                      clipPath={`url(#avatar-clip-${uid}-${s.index})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <circle cx={p.x} cy={p.y} r={avatarR} fill="none" stroke="#ffffff" strokeWidth={n > 24 ? 2 : 3.5} />
                  </>
                ) : (
                  <>
                    <circle cx={p.x} cy={p.y} r={avatarR} fill="#ffffff" opacity={0.94} />
                    <text
                      x={p.x}
                      y={p.y + avatarR * 0.06}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={avatarR * 1.35}
                      style={{ fontFamily: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif" }}
                    >
                      {s.icon}
                    </text>
                    <circle cx={p.x} cy={p.y} r={avatarR} fill="none" stroke="#ffffff" strokeWidth={n > 24 ? 2 : 3.5} />
                  </>
                )}
              </g>
            );
          })}

        {/* Labels — each fitted to its own segment's real available space.
            Rendered along the bisector, flipped on the left half so text is
            never upside down, and always contained inside the segment. */}
        {labelLayouts.map((layout) => {
          const { lines, fontSize, mid, flip, innerR, outerR, index } = layout;
          const rot = flip ? mid + 90 : mid - 90;
          const lh = fontSize * 1.18;
          const K = lines.length;
          const midRad = (mid * Math.PI) / 180;
          const perpX = Math.cos(midRad);
          const perpY = Math.sin(midRad);
          const radialSpan = outerR - innerR - 6;
          return (
            <g key={`label-${index}`} pointerEvents="none" opacity={dimmed(index) ? 0.35 : 1} style={{ transition: "opacity 0.35s ease" }}>
              {lines.map((line, j) => {
                const w = textWidth(line, fontSize);
                const startR = innerR + Math.max(0, (radialSpan - w) / 2) + 3;
                const anchorR = flip ? startR + w : startR;
                const p = polar(mid, anchorR);
                const off = (j - (K - 1) / 2) * lh;
                const x = p.x + perpX * off;
                const y = p.y + perpY * off;
                return (
                  <text
                    key={j}
                    x={x}
                    y={y}
                    transform={`rotate(${rot} ${x} ${y})`}
                    textAnchor="start"
                    dominantBaseline="central"
                    fontSize={fontSize}
                    fontWeight={600}
                    fill={appearance.textColor ?? textColorFor(layout.color)}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {line}
                  </text>
                );
              })}
            </g>
          );
        })}

        {/* Rim studs — rotate with the wheel like a real prize wheel */}
        {n > 1 &&
          segs.map((s) => {
            const p = polar(s.start, R + 5);
            return (
              <circle
                key={`stud-${s.index}`}
                cx={p.x}
                cy={p.y}
                r={n > 40 ? 2 : 3.5}
                fill={appearance.studColor}
                opacity={0.92}
              />
            );
          })}
      </g>
    </svg>
  );
});
