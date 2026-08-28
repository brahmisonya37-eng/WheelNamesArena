export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" fill="#14121f" />
      <path d="M32 32 L32 6 A26 26 0 0 1 54.5 19 Z" fill="#6d4aff" />
      <path d="M32 32 L54.5 19 A26 26 0 0 1 54.5 45 Z" fill="#ff6b5e" />
      <path d="M32 32 L54.5 45 A26 26 0 0 1 32 58 Z" fill="#ffb020" />
      <path d="M32 32 L32 58 A26 26 0 0 1 9.5 45 Z" fill="#2dd4a7" />
      <path d="M32 32 L9.5 45 A26 26 0 0 1 9.5 19 Z" fill="#38bdf8" />
      <path d="M32 32 L9.5 19 A26 26 0 0 1 32 6 Z" fill="#f472b6" />
      <circle cx="32" cy="32" r="9" fill="#faf9f6" />
      <circle cx="32" cy="32" r="4" fill="#14121f" />
    </svg>
  );
}
