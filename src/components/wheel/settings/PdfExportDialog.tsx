import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, Eye, FileText, Loader2, X } from "lucide-react";
import { Btn, Toggle, cx } from "../../ui";
import { generateWheelPdf, pdfFileName } from "../../../lib/pdf";
import type { WheelPdfData, WheelPdfOptions } from "../../../lib/pdf";

type Status = "idle" | "preparing" | "ready" | "error";

interface PdfExportDialogProps {
  open: boolean;
  onClose: () => void;
  getData: () => WheelPdfData;
}

const INCLUDE_LABELS: { key: keyof WheelPdfOptions["include"]; label: string; hint: string }[] = [
  { key: "preview", label: "Wheel preview", hint: "High-resolution image of the wheel" },
  { key: "title", label: "Wheel title", hint: "Your custom wheel name" },
  { key: "entries", label: "Entry list", hint: "All entries, numbered (weights shown when weighted)" },
  { key: "settings", label: "Settings summary", hint: "Spin duration, probability, winner rules…" },
  { key: "history", label: "Winner history", hint: "Previous results with timestamps" },
  { key: "date", label: "Generation date", hint: "When this PDF was created" },
];

export function PdfExportDialog({ open, onClose, getData }: PdfExportDialogProps) {
  const [format, setFormat] = useState<"a4" | "letter">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [include, setInclude] = useState<WheelPdfOptions["include"]>({
    preview: true,
    title: true,
    entries: true,
    settings: true,
    history: true,
    date: true,
  });
  const [status, setStatus] = useState<Status>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setBlob(null);
      setShowPreview(false);
    }
  }, [open]);

  // Changing any option invalidates a previously generated file
  const invalidate = () => {
    setStatus("idle");
    setBlob(null);
    setShowPreview(false);
  };

  // Release object URLs on close/unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const build = async (): Promise<Blob | null> => {
    if (status === "preparing") return null;
    setStatus("preparing");
    try {
      const data = getData();
      const result = await generateWheelPdf(data, { format, orientation, include });
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(result);
      urlRef.current = url;
      setPreviewUrl(url);
      setBlob(result);
      setStatus("ready");
      return result;
    } catch (err) {
      console.error("PDF generation failed", err);
      setStatus("error");
      return null;
    }
  };

  const download = async () => {
    const b = blob ?? (await build());
    if (!b) return;
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFileName(getData().title);
    document.body.appendChild(a);
    if (typeof a.download === "undefined") {
      // Very old browsers without the download attribute: open in a tab instead
      a.remove();
      window.open(url, "_blank", "noopener");
      return;
    }
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const preview = async () => {
    if (!blob) {
      const b = await build();
      if (!b) return;
    }
    setShowPreview(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Download PDF"
        >
          <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm" onClick={status === "preparing" ? undefined : onClose} aria-hidden />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="thin-scroll relative max-h-[100dvh] w-full overflow-y-auto bg-paper outline-none sm:max-h-[88vh] sm:max-w-xl sm:rounded-[28px] sm:shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <FileText className="h-5 w-5 text-brand-500" aria-hidden /> Download PDF
              </h2>
              <button type="button" onClick={onClose} aria-label="Close PDF dialog" className="rounded-full p-2 text-ink-400 transition hover:bg-ink-50 hover:text-ink-950">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* Format */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold tracking-[0.14em] text-ink-400 uppercase">Paper format</p>
                  <div className="flex rounded-full border border-ink-200 bg-ink-50 p-1" role="group" aria-label="Paper format">
                    {(["a4", "letter"] as const).map((f) => (
                      <button key={f} type="button" onClick={() => { setFormat(f); invalidate(); }} aria-pressed={format === f} className={cx("flex-1 rounded-full px-4 py-2 text-sm font-bold transition", format === f ? "bg-white text-ink-950 shadow-soft" : "text-ink-500")}>
                        {f === "a4" ? "A4" : "Letter"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold tracking-[0.14em] text-ink-400 uppercase">Orientation</p>
                  <div className="flex rounded-full border border-ink-200 bg-ink-50 p-1" role="group" aria-label="Orientation">
                    {(["portrait", "landscape"] as const).map((o) => (
                      <button key={o} type="button" onClick={() => { setOrientation(o); invalidate(); }} aria-pressed={orientation === o} className={cx("flex-1 rounded-full px-4 py-2 text-sm font-bold capitalize transition", orientation === o ? "bg-white text-ink-950 shadow-soft" : "text-ink-500")}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Include */}
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.14em] text-ink-400 uppercase">Include in the PDF</p>
                <div className="divide-y divide-ink-100/70 rounded-2xl border border-ink-100 bg-white px-4 shadow-soft">
                  {INCLUDE_LABELS.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900">{item.label}</p>
                        <p className="text-xs text-ink-400">{item.hint}</p>
                      </div>
                      <Toggle checked={include[item.key]} onChange={(v) => { setInclude((inc) => ({ ...inc, [item.key]: v })); invalidate(); }} label={`Include ${item.label}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div aria-live="polite" className="min-h-6 text-center">
                {status === "preparing" && (
                  <p className="flex items-center justify-center gap-2 text-sm font-bold text-brand-600">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Preparing your PDF…
                  </p>
                )}
                {status === "ready" && (
                  <p className="flex items-center justify-center gap-2 text-sm font-bold text-mint-600">
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Your PDF is ready.
                  </p>
                )}
                {status === "error" && <p className="text-sm font-bold text-coral-600">Something went wrong — please try again.</p>}
              </div>

              {/* Preview frame */}
              {showPreview && previewUrl && (
                <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
                  <iframe src={`${previewUrl}#toolbar=0`} title="PDF preview" className="h-[420px] w-full" />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-2.5 pb-[max(0rem,env(safe-area-inset-bottom))]">
                <Btn size="lg" onClick={download} disabled={status === "preparing"} className="min-w-44">
                  {status === "preparing" ? <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden /> : <Download className="h-4.5 w-4.5" aria-hidden />}
                  Download PDF
                </Btn>
                <Btn size="lg" variant="outline" onClick={preview} disabled={status === "preparing"}>
                  <Eye className="h-4.5 w-4.5" aria-hidden /> Preview PDF
                </Btn>
              </div>
              <p className="text-center text-xs text-ink-400">Free forever · generated privately in your browser · long lists flow onto extra pages automatically.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
