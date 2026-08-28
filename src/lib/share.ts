/** Encode/decode wheels into shareable links, plus social share URLs. */

function toBase64Url(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(b)));
}

export function encodeWheel(entries: readonly string[]): string {
  return toBase64Url(JSON.stringify(entries));
}

export function decodeWheel(param: string): string[] | null {
  try {
    const data = JSON.parse(fromBase64Url(param));
    if (!Array.isArray(data)) return null;
    const clean = data.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, 500);
    return clean.length >= 2 ? clean : null;
  } catch {
    return null;
  }
}

export function wheelShareUrl(entries: readonly string[]): string {
  const base = `${window.location.origin}/wheel-spinner`;
  return `${base}?w=${encodeWheel(entries)}`;
}

export interface ShareTargets {
  label: string;
  key: "copy" | "whatsapp" | "x" | "reddit" | "telegram";
}

export const SHARE_TARGETS: ShareTargets[] = [
  { label: "Copy link", key: "copy" },
  { label: "WhatsApp", key: "whatsapp" },
  { label: "X (Twitter)", key: "x" },
  { label: "Reddit", key: "reddit" },
  { label: "Telegram", key: "telegram" },
];

export function shareHref(target: ShareTargets["key"], url: string, text: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (target) {
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${u}&title=${t}`;
    case "telegram":
      return `https://t.me/share/url?url=${u}&text=${t}`;
    default:
      return url;
  }
}
