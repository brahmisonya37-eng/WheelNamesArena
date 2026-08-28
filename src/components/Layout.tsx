import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, Search, Sparkles, X } from "lucide-react";
import { LogoMark } from "./Logo";
import { SearchModal } from "./SearchModal";
import { Btn, cx } from "./ui";
import { TOOLS } from "../lib/tools";

const NAV = [
  { to: "/wheel-spinner", label: "Wheel Spinner" },
  { to: "/tools", label: "Random Tools" },
  { to: "/for-teachers", label: "Teachers" },
  { to: "/for-streamers", label: "Streamers" },
  { to: "/guides", label: "Guides" },
  { to: "/blog", label: "Blog" },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  // Global search shortcuts: Cmd/Ctrl+K and "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
        return;
      }
      if (e.key === "/") {
        const el = e.target as HTMLElement | null;
        if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[80] focus:rounded-full focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* ---------------------------------- Header --------------------------------- */}
      <header className="glass sticky top-0 z-40 w-full max-w-full border-b border-ink-950/5 box-border">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-3 sm:gap-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5" aria-label="WheelNamesArena home">
            <LogoMark className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            <span className="whitespace-nowrap font-display text-[13px] font-bold tracking-tight min-[360px]:text-[15px] sm:text-lg">
              WheelNames<span className="text-brand-500">Arena</span>
            </span>
          </Link>

          <nav className="ml-5 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    "rounded-full px-3 py-2 text-sm font-semibold transition",
                    isActive ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-ink-950/5 hover:text-ink-950",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-ink-200 bg-white/80 px-4 py-2 text-sm text-ink-400 transition hover:border-ink-300 hover:text-ink-700 xl:flex"
              aria-label="Search tools (press slash)"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span>Search tools…</span>
              <kbd className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold text-ink-500">/</kbd>
            </button>
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search tools" className="flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-950/5 sm:h-10 sm:w-10 xl:hidden">
              <Search className="h-5 w-5" />
            </button>
            <Btn to="/wheel-spinner" size="sm" className="hidden sm:inline-flex">
              <Sparkles className="h-4 w-4" aria-hidden /> Create a Wheel
            </Btn>
            <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-950/5 sm:h-10 sm:w-10 lg:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="border-t border-ink-100 bg-white px-4 py-4 lg:hidden" aria-label="Mobile">
            <div className="grid gap-1">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => cx("rounded-xl px-4 py-2.5 text-sm font-semibold", isActive ? "bg-ink-950 text-white" : "text-ink-700 hover:bg-ink-50")}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-100 pt-3">
              {TOOLS.slice(0, 6).map((t) => (
                <Link key={t.slug} to={`/${t.slug}`} className="rounded-xl bg-ink-50 px-3 py-2 text-xs font-semibold text-ink-700">
                  {t.name}
                </Link>
              ))}
            </div>
            <Btn to="/wheel-spinner" className="mt-3 w-full">
              <Sparkles className="h-4 w-4" aria-hidden /> Create a Wheel
            </Btn>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      {/* ---------------------------------- Footer --------------------------------- */}
      <footer className="mt-20 border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
            <div>
              <Link to="/" className="flex items-center gap-2.5" aria-label="WheelNamesArena home">
                <LogoMark className="h-8 w-8" />
                <span className="font-display text-lg font-bold">
                  WheelNames<span className="text-brand-500">Arena</span>
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
                Free random tools for every decision. Spin your way to an answer — no sign-up, no paywalls, just spin.
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-mint-600">
                100% free forever
              </p>
            </div>

            <nav aria-label="Tools">
              <h3 className="text-xs font-bold tracking-[0.16em] text-ink-400 uppercase">Tools</h3>
              <ul className="mt-3 space-y-2">
                {["wheel-spinner", "random-name-picker", "random-number-generator", "random-team-generator", "giveaway-picker", "coin-flip"].map((slug) => {
                  const t = TOOLS.find((x) => x.slug === slug)!;
                  return (
                    <li key={slug}>
                      <Link to={`/${slug}`} className="text-sm text-ink-600 transition hover:text-brand-600">
                        {t.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <nav aria-label="Use cases">
              <h3 className="text-xs font-bold tracking-[0.16em] text-ink-400 uppercase">Use cases</h3>
              <ul className="mt-3 space-y-2">
                <li><Link to="/for-teachers" className="text-sm text-ink-600 transition hover:text-brand-600">For teachers</Link></li>
                <li><Link to="/for-streamers" className="text-sm text-ink-600 transition hover:text-brand-600">For streamers</Link></li>
                <li><Link to="/giveaway-picker" className="text-sm text-ink-600 transition hover:text-brand-600">Giveaways</Link></li>
                <li><Link to="/random-team-generator" className="text-sm text-ink-600 transition hover:text-brand-600">Team building</Link></li>
                <li><Link to="/decision-maker" className="text-sm text-ink-600 transition hover:text-brand-600">Everyday decisions</Link></li>
              </ul>
            </nav>

            <nav aria-label="Resources">
              <h3 className="text-xs font-bold tracking-[0.16em] text-ink-400 uppercase">Resources</h3>
              <ul className="mt-3 space-y-2">
                <li><Link to="/blog" className="text-sm text-ink-600 transition hover:text-brand-600">Blog</Link></li>
                <li><Link to="/guides" className="text-sm text-ink-600 transition hover:text-brand-600">Random Tools Guide</Link></li>
                <li><Link to="/guides/how-to-run-a-giveaway" className="text-sm text-ink-600 transition hover:text-brand-600">Running giveaways</Link></li>
                <li><Link to="/guides/how-to-pick-a-random-student" className="text-sm text-ink-600 transition hover:text-brand-600">Picking students</Link></li>
                <li><Link to="/tools" className="text-sm text-ink-600 transition hover:text-brand-600">All tools</Link></li>
              </ul>
            </nav>

            <nav aria-label="Company">
              <h3 className="text-xs font-bold tracking-[0.16em] text-ink-400 uppercase">Company</h3>
              <ul className="mt-3 space-y-2">
                <li><Link to="/about" className="text-sm text-ink-600 transition hover:text-brand-600">About</Link></li>
                <li><Link to="/contact" className="text-sm text-ink-600 transition hover:text-brand-600">Contact</Link></li>
                <li><Link to="/privacy" className="text-sm text-ink-600 transition hover:text-brand-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-ink-600 transition hover:text-brand-600">Terms of Use</Link></li>
              </ul>
            </nav>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-100 pt-6 text-xs text-ink-400 sm:flex-row">
            <p>© {new Date().getFullYear()} WheelNamesArena. Free random tools for every decision.</p>
            <p>Made for teachers, streamers, students & the indecisive.</p>
          </div>
        </div>
      </footer>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
