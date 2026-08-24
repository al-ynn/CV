import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor, Menu, X, Terminal } from "lucide-react";
import { useTheme } from "../../lib/theme";
import { useContent } from "../../lib/content";
import { NAV_LINKS } from "../../data/content";
import { StatusDot } from "../system/bits";

const ThemeIcon = ({ theme }) =>
  theme === "light" ? <Sun size={15} /> : theme === "system" ? <Monitor size={15} /> : <Moon size={15} />;

export default function Navbar({ onPalette }) {
  const { theme, cycle } = useTheme();
  const { settings } = useContent();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 border-b transition-colors duration-300 ${
          scrolled ? "border-line bg-canvas/85 backdrop-blur-xl" : "border-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 group">
            <span className="font-mono text-sm font-bold tracking-[0.15em] text-ink">
              {settings.siteName}
            </span>
            {settings.available && <StatusDot />}
          </Link>

          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `font-mono text-[11px] tracking-[0.2em] uppercase transition-colors ${
                    isActive ? "text-violet" : "text-ink2 hover:text-ink"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              data-testid="theme-toggle"
              onClick={cycle}
              aria-label={`Theme: ${theme}. Click to switch.`}
              className="h-9 w-9 grid place-items-center border border-line text-ink2 hover:text-violet hover:border-violet transition-colors"
            >
              <ThemeIcon theme={theme} />
            </button>
            <button
              data-testid="open-command-palette"
              onClick={onPalette}
              aria-label="Open command palette"
              className="hidden sm:flex h-9 items-center gap-2 px-3 border border-line text-ink3 hover:text-ink hover:border-violet transition-colors font-mono text-[10px] tracking-[0.15em]"
            >
              <Terminal size={13} />
              <span>⌘K</span>
            </button>
            <Link
              to="/contact"
              data-testid="nav-cta"
              className="hidden sm:inline-flex h-9 items-center px-4 bg-violet text-base font-mono text-[11px] tracking-[0.15em] uppercase font-semibold hover:opacity-90 transition-opacity"
              style={{ color: "var(--bg)" }}
            >
              Let's Work →
            </Link>
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="lg:hidden h-9 w-9 grid place-items-center border border-line text-ink"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-canvas flex flex-col"
          >
            <div className="h-16 px-5 flex items-center justify-between border-b border-line">
              <span className="font-mono text-sm font-bold tracking-[0.15em]">{settings.siteName}</span>
              <button
                data-testid="mobile-menu-close"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="h-9 w-9 grid place-items-center border border-line"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-8" aria-label="Mobile">
              {[{ to: "/", label: "Home", num: "00" }, ...NAV_LINKS].map((l, i) => (
                <motion.button
                  key={l.to}
                  data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  onClick={() => {
                    setOpen(false);
                    navigate(l.to);
                  }}
                  className="w-full flex items-baseline gap-5 py-4 border-b border-line text-left group"
                >
                  <span className="font-mono text-[11px] text-violet tracking-[0.2em]">{l.num}</span>
                  <span className="font-display text-3xl font-extrabold tracking-tight group-hover:text-violet transition-colors">
                    {l.label}
                  </span>
                </motion.button>
              ))}
            </nav>
            <div className="px-5 py-6 border-t border-line flex items-center justify-between">
              <button
                data-testid="mobile-theme-toggle"
                onClick={cycle}
                className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-ink2"
              >
                <ThemeIcon theme={theme} /> {theme}
              </button>
              <span className="font-mono text-[10px] text-ink3 tracking-[0.2em]">SYS.NAV // MOBILE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
