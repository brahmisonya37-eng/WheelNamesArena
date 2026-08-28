/**
 * PDF export for the wheel. jsPDF is dynamically imported so the main bundle
 * stays light — the library only loads when a user actually exports.
 */
import { textColorFor } from "./themes";
import { loadImage } from "./images";

export interface PdfSegment {
  label: string;
  color: string;
  start: number;
  end: number;
  photo?: string | null;
  icon?: string | null;
}

export interface WheelPdfData {
  title: string;
  segments: PdfSegment[];
  entries: { text: string; weight: number }[];
  weighted: boolean;
  settingsSummary: [string, string][];
  history: { name: string; at: number }[];
  appearance: {
    hubColor: string;
    textColor: string | null;
    borderWidth: number;
    borderColor: string;
    centerImage: string | null;
    insetImage: string | null;
  };
}

export interface WheelPdfOptions {
  format: "a4" | "letter";
  orientation: "portrait" | "landscape";
  include: {
    preview: boolean;
    title: boolean;
    entries: boolean;
    settings: boolean;
    history: boolean;
    date: boolean;
  };
}

/* ------------------------- High-res wheel rendering ------------------------ */

function truncateLabel(label: string, max: number): string {
  return label.length > max ? label.slice(0, max - 1).trimEnd() + "…" : label;
}

/** Render the wheel to a high-resolution PNG data URL (sharp when printed). */
export async function renderWheelToDataUrl(
  segments: PdfSegment[],
  size = 1400,
  hubColor = "#14121f",
  textColorOverride: string | null = null,
  borderWidth = 2.5,
  centerImage: string | null = null,
  insetImage: string | null = null,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) return "";
  const C = size / 2;
  const R = size / 2 - size * 0.022;
  const n = segments.length;

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

  // Rim
  g.beginPath();
  g.arc(C, C, R + size * 0.016, 0, Math.PI * 2);
  g.fillStyle = "#14121f";
  g.fill();

  if (n === 0) {
    g.beginPath();
    g.arc(C, C, R, 0, Math.PI * 2);
    g.fillStyle = "#e9e7f0";
    g.fill();
  } else if (n === 1) {
    g.beginPath();
    g.arc(C, C, R, 0, Math.PI * 2);
    g.fillStyle = segments[0].color;
    g.fill();
  } else {
    for (const s of segments) {
      g.beginPath();
      g.moveTo(C, C);
      g.arc(C, C, R, toRad(s.start), toRad(s.end));
      g.closePath();
      g.fillStyle = s.color;
      g.fill();
      if (borderWidth > 0) {
        g.strokeStyle = "#faf9f6";
        g.lineWidth = (borderWidth / 640) * size;
        g.stroke();
      }
    }
  }

  // Labels (upright, matching the on-screen wheel)
  if (n > 1 && n <= 48) {
    const fontSize = (n <= 6 ? 30 : n <= 10 ? 25 : n <= 16 ? 21 : n <= 24 ? 17 : n <= 36 ? 14 : 12) * (size / 640);
    const maxChars = n <= 8 ? 22 : n <= 16 ? 16 : n <= 32 ? 12 : 9;
    const labelR = n <= 3 ? R * 0.52 : R * 0.62;
    g.font = `600 ${fontSize}px Inter, Helvetica, Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const s of segments) {
      const mid = (s.start + s.end) / 2;
      const x = C + labelR * Math.cos(toRad(mid));
      const y = C + labelR * Math.sin(toRad(mid));
      g.fillStyle = textColorOverride ?? textColorFor(s.color);
      g.fillText(truncateLabel(s.label, maxChars), x, y);
    }
  } else if (n === 1) {
    g.font = `700 ${size * 0.05}px Inter, Helvetica, Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = textColorOverride ?? textColorFor(segments[0].color);
    g.fillText(truncateLabel(segments[0].label, 20), C, C);
  }

  // Studs
  if (n > 1) {
    for (const s of segments) {
      const x = C + (R + size * 0.008) * Math.cos(toRad(s.start));
      const y = C + (R + size * 0.008) * Math.sin(toRad(s.start));
      g.beginPath();
      g.arc(x, y, n > 40 ? size * 0.003 : size * 0.005, 0, Math.PI * 2);
      g.fillStyle = "#faf9f6";
      g.fill();
    }
  }

  // Participant avatars — photo or emoji (matching the live wheel)
  if (n > 1 && n <= 64) {
    const segAngle = 360 / n;
    const k = size / 640;
    const avatarPosR = R * 0.58;
    const chord = 2 * avatarPosR * Math.sin(((segAngle / 2) * Math.PI) / 180);
    const avatarR = Math.max(15 * k, Math.min(52 * k, chord * 0.42));
    for (const s of segments) {
      const rad = toRad((s.start + s.end) / 2);
      const px = C + avatarPosR * Math.cos(rad);
      const py = C + avatarPosR * Math.sin(rad);
      if (s.photo) {
        try {
          const img = await loadImage(s.photo);
          g.save();
          g.beginPath();
          g.arc(px, py, avatarR, 0, Math.PI * 2);
          g.clip();
          const scale = Math.max((avatarR * 2) / img.width, (avatarR * 2) / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          g.drawImage(img, px - dw / 2, py - dh / 2, dw, dh);
          g.restore();
          g.beginPath();
          g.arc(px, py, avatarR, 0, Math.PI * 2);
          g.lineWidth = Math.max(1.5, size * 0.004);
          g.strokeStyle = "#ffffff";
          g.stroke();
        } catch {
          /* skip photos that fail to load */
        }
      } else if (s.icon) {
        g.beginPath();
        g.arc(px, py, avatarR, 0, Math.PI * 2);
        g.fillStyle = "rgba(255,255,255,0.94)";
        g.fill();
        g.font = `${Math.round(avatarR * 1.35)}px sans-serif`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillStyle = "#14121f";
        g.fillText(s.icon, px, py + avatarR * 0.06);
        g.beginPath();
        g.arc(px, py, avatarR, 0, Math.PI * 2);
        g.lineWidth = Math.max(1.5, size * 0.004);
        g.strokeStyle = "#ffffff";
        g.stroke();
      }
    }
  }

  // Optional inset image — embedded in the wheel disc (matches the live wheel)
  if (insetImage) {
    try {
      const img = await loadImage(insetImage);
      const r = R * 0.46;
      g.save();
      g.beginPath();
      g.arc(C, C, r, 0, Math.PI * 2);
      g.clip();
      const side = r * 2;
      const scale = Math.max(side / img.width, side / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      g.drawImage(img, C - dw / 2, C - dh / 2, dw, dh);
      g.restore();
      g.beginPath();
      g.arc(C, C, r, 0, Math.PI * 2);
      g.lineWidth = size * 0.009;
      g.strokeStyle = "#ffffff";
      g.stroke();
    } catch {
      /* keep the plain wheel if the image fails to load */
    }
  }

  // Hub
  g.beginPath();
  g.arc(C, C, R * 0.185, 0, Math.PI * 2);
  g.fillStyle = hubColor;
  g.fill();
  g.lineWidth = size * 0.012;
  g.strokeStyle = "#ffffff";
  g.stroke();

  // Optional center image, clipped to a circle over the hub
  if (centerImage) {
    try {
      const img = await loadImage(centerImage);
      const r = R * 0.185;
      g.save();
      g.beginPath();
      g.arc(C, C, r, 0, Math.PI * 2);
      g.clip();
      const side = r * 2;
      const scale = Math.max(side / img.width, side / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      g.drawImage(img, C - dw / 2, C - dh / 2, dw, dh);
      g.restore();
      g.beginPath();
      g.arc(C, C, r, 0, Math.PI * 2);
      g.lineWidth = size * 0.008;
      g.strokeStyle = "#ffffff";
      g.stroke();
    } catch {
      /* keep the plain hub if the image fails to load */
    }
  }

  return canvas.toDataURL("image/png");
}

/* --------------------------------- PDF build -------------------------------- */

const BRAND = "#6d4aff";
const INK = "#14121f";
const MUTED = "#6b6584";

const PAGE_SIZES: Record<"a4" | "letter", [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
};

/** Build the PDF and return it as a Blob. Runs off the critical path. */
export async function generateWheelPdf(data: WheelPdfData, opts: WheelPdfOptions): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  // Let the "Preparing…" state paint before the heavy work starts
  await new Promise((r) => setTimeout(r, 40));

  const [w, h] = PAGE_SIZES[opts.format];
  const pageW = opts.orientation === "landscape" ? h : w;
  const pageH = opts.orientation === "landscape" ? w : h;
  const doc = new jsPDF({ orientation: opts.orientation, unit: "mm", format: opts.format });

  const M = 16; // margin
  const FOOTER = 12; // reserved footer band
  const contentW = pageW - M * 2;
  let y = M;

  const hex = (hexColor: string): [number, number, number] => {
    const s = hexColor.replace("#", "");
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  };

  const drawBrandHeader = () => {
    // Small wheel glyph
    const gx = M + 4;
    const gy = y + 4;
    const colors = ["#6d4aff", "#ff6b5e", "#ffb020", "#2dd4a7", "#38bdf8", "#f472b6"];
    for (let i = 0; i < 6; i++) {
      doc.setFillColor(...hex(colors[i]));
      doc.triangle(
        gx, gy,
        gx + 4 * Math.cos(((i * 60 - 90) * Math.PI) / 180), gy + 4 * Math.sin(((i * 60 - 90) * Math.PI) / 180),
        gx + 4 * Math.cos((((i + 1) * 60 - 90) * Math.PI) / 180), gy + 4 * Math.sin((((i + 1) * 60 - 90) * Math.PI) / 180),
        "F",
      );
    }
    doc.setFillColor(250, 249, 246);
    doc.circle(gx, gy, 1.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...hex(INK));
    doc.text("WheelNamesArena", M + 11, gy + 1.4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...hex(MUTED));
    doc.text("Free Random Tools for Every Decision", pageW - M, gy + 1.4, { align: "right" });
    doc.setDrawColor(233, 231, 240);
    doc.setLineWidth(0.4);
    doc.line(M, y + 11, pageW - M, y + 11);
    y += 17;
  };

  const ensure = (needed: number) => {
    if (y + needed > pageH - FOOTER) {
      doc.addPage();
      y = M;
      return true;
    }
    return false;
  };

  const sectionHeading = (label: string) => {
    ensure(16);
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(...hex(BRAND));
    doc.text(label.toUpperCase(), M, y);
    y += 2.5;
    doc.setDrawColor(...hex(BRAND));
    doc.setLineWidth(0.5);
    doc.line(M, y, M + 22, y);
    y += 5.5;
  };

  /* Page 1 header */
  drawBrandHeader();

  /* Wheel title */
  if (opts.include.title) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...hex(INK));
    const titleLines = doc.splitTextToSize(data.title || "My Wheel", contentW);
    doc.text(titleLines, M, y + 4);
    y += 4 + titleLines.length * 8 + 2;
  }

  /* Generation date */
  if (opts.include.date) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...hex(MUTED));
    const now = new Date();
    doc.text(
      `Generated ${now.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      M,
      y,
    );
    y += 7;
  }

  /* Wheel preview */
  if (opts.include.preview && data.segments.length > 0) {
    const img = await renderWheelToDataUrl(
      data.segments,
      1400,
      data.appearance.hubColor,
      data.appearance.textColor,
      data.appearance.borderWidth,
      data.appearance.centerImage,
      data.appearance.insetImage,
    );
    if (img) {
      const imgSize = Math.min(contentW * 0.62, 118);
      ensure(imgSize + 10);
      const x = (pageW - imgSize) / 2;
      doc.addImage(img, "PNG", x, y + 2, imgSize, imgSize, undefined, "SLOW");
      y += imgSize + 8;
    }
  }

  /* Entries */
  if (opts.include.entries && data.entries.length > 0) {
    sectionHeading(`Entries (${data.entries.length})`);
    const colCount = data.entries.length > 120 ? 3 : data.entries.length > 40 ? 2 : 1;
    const gap = 7;
    const colW = (contentW - gap * (colCount - 1)) / colCount;
    const lineH = 5.2;
    let col = 0;
    let colY = y;
    const topY = y;
    const bottom = () => pageH - FOOTER;

    data.entries.forEach((entry, idx) => {
      const label = data.weighted && entry.weight !== 1 ? `${entry.text}  (${entry.weight}\u00d7)` : entry.text;
      doc.setFontSize(9.5);
      const lines: string[] = doc.splitTextToSize(label, colW - 9);
      const blockH = lines.length * lineH + 1.6;
      if (colY + blockH > bottom()) {
        col++;
        colY = topY;
        if (col >= colCount) {
          doc.addPage();
          col = 0;
          colY = M;
        }
      }
      const x = M + col * (colW + gap);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hex(BRAND));
      doc.text(`${idx + 1}.`, x, colY + 3.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hex(INK));
      doc.text(lines, x + 8, colY + 3.2);
      colY += blockH;
    });
    y = col === 0 ? colY : Math.max(colY, topY + 10);
    if (col > 0) y = colY;
    y += 2;
  }

  /* Settings summary */
  if (opts.include.settings && data.settingsSummary.length > 0) {
    sectionHeading("Settings Summary");
    doc.setFontSize(9.5);
    for (const [k, v] of data.settingsSummary) {
      ensure(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hex(INK));
      doc.text(k, M, y + 3.4);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hex(MUTED));
      const valLines: string[] = doc.splitTextToSize(v, contentW * 0.62);
      doc.text(valLines, M + contentW * 0.38, y + 3.4);
      y += Math.max(1, valLines.length) * 5.4 + 1.6;
    }
    y += 2;
  }

  /* Winner history */
  if (opts.include.history) {
    sectionHeading(data.history.length > 0 ? `Winner History (${data.history.length})` : "Winner History");
    if (data.history.length === 0) {
      ensure(8);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(...hex(MUTED));
      doc.text("No winners drawn yet.", M, y + 3.4);
      y += 9;
    } else {
      doc.setFontSize(9.5);
      data.history.forEach((hEntry, i) => {
        ensure(7);
        const when = new Date(hEntry.at);
        const stamp = `${when.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...hex(INK));
        doc.text(`${i + 1}.  ${hEntry.name}`, M, y + 3.4);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...hex(MUTED));
        doc.text(stamp, pageW - M, y + 3.4, { align: "right" });
        y += 6.6;
      });
      y += 2;
    }
  }

  /* Footers with page numbers */
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(233, 231, 240);
    doc.setLineWidth(0.3);
    doc.line(M, pageH - FOOTER + 3, pageW - M, pageH - FOOTER + 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...hex(MUTED));
    doc.text("Generated with WheelNamesArena — free random tools, no sign-up.", M, pageH - FOOTER + 8);
    doc.text(`Page ${p} of ${pageCount}`, pageW - M, pageH - FOOTER + 8, { align: "right" });
  }

  return doc.output("blob");
}

/** Suggest a safe file name for the export. */
export function pdfFileName(title: string): string {
  const clean = (title || "wheel").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "wheel";
  return `wheelnamesarena-${clean}.pdf`;
}
