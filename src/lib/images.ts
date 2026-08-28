/**
 * Client-side image processing for wheel images (center / background / pointer).
 * Files are downscaled and re-encoded so they fit comfortably in localStorage.
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

export { loadImage };

const ACCEPTED = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i;

/**
 * Read an image file, downscale it to `maxDim` on its longest side and
 * re-encode it (PNG keeps transparency; everything else becomes JPEG).
 * Returns a data URL ready for localStorage.
 */
export async function processImageFile(file: File, maxDim: number): Promise<string> {
  if (!ACCEPTED.test(file.type)) {
    throw new Error("Unsupported file type — use PNG, JPG, WEBP or SVG.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("That file is too large — pick an image under 12 MB.");
  }

  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

  // SVGs stay as-is (tiny and infinitely sharp)
  if (file.type === "image/svg+xml") return dataUrl;

  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Canvas unavailable");
  g.drawImage(img, 0, 0, w, h);

  const keepPng = file.type === "image/png" || file.type === "image/gif";
  return keepPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.85);
}

/**
 * Fetch an image from a URL, then downscale/optimize it like a local upload.
 * Fails cleanly when the host blocks cross-origin reads (CORS) or the URL
 * is not an image.
 */
export async function processImageUrl(url: string, maxDim: number): Promise<string> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) throw new Error("Only http(s) image URLs are supported.");
  const res = await fetch(trimmed, { mode: "cors" });
  if (!res.ok) throw new Error(`Image request failed (${res.status})`);
  const blob = await res.blob();
  if (!blob.type.startsWith("image/")) throw new Error("URL does not point to an image.");
  const file = new File([blob], "image", { type: blob.type });
  return processImageFile(file, maxDim);
}
