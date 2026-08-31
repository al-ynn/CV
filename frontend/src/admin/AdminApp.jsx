import { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { useTheme } from "../lib/theme";
import { StatusDot } from "../components/system/bits";
import { COLLECTION_SCHEMAS, SINGLETON_SCHEMAS } from "./registry";
import CollectionPage from "./CollectionPage";
import SingletonPage from "./SingletonPage";
import Dashboard from "./Dashboard";
import InboxPage from "./InboxPage";
import MediaPage from "./MediaPage";
import { ResumePage, SecurityPage, ActivityPage, ExportPanel } from "./MiscPages";
import AboutAdmin from "./AboutAdmin";
import HomepageAdmin from "./HomepageAdmin";
import { Sun, Moon, Monitor, LogOut, ExternalLink, Menu, X } from "lucide-react";

const NAV = [
  { group: "CONTROL CENTER", items: [
    { id: "dashboard", label: "Overview" },
    { id: "activity", label: "Activity Log" },
  ]},
  { group: "CONTENT", items: [
    { id: "homepage", label: "Homepage" },
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "services", label: "Services" },
    { id: "pricing", label: "Pricing" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "certifications", label: "Certifications" },
    { id: "skills", label: "Skills" },
    { id: "technologies", label: "Technologies" },
    { id: "journey", label: "Journey" },
  ]},
  { group: "INBOX", items: [{ id: "messages", label: "Contact Requests" }] },
  { group: "ASSETS", items: [
    { id: "media", label: "Media" },
    { id: "resume", label: "Resume" },
  ]},
  { group: "CONFIGURATION", items: [
    { id: "profile", label: "Profile" },
    { id: "seo", label: "SEO" },
    { id: "estimator", label: "Estimator" },
    { id: "settings", label: "Site Settings" },
    { id: "appearance", label: "Appearance" },
  ]},
  { group: "ACCOUNT", items: [{ id: "security", label: "Security" }] },
];

function Section({ id, user }) {
  if (id === "dashboard") return <Dashboard user={user} />;
  if (id === "about") return <AboutAdmin />;
  if (id === "homepage") return <HomepageAdmin />;
  if (id === "messages") return <InboxPage />;
  if (id === "media") return <MediaPage />;
  if (id === "resume") return <ResumePage />;
  if (id === "security") return <SecurityPage />;
  if (id === "activity") return <ActivityPage />;
  if (COLLECTION_SCHEMAS[id]) return <CollectionPage schema={COLLECTION_SCHEMAS[id]} name={id} key={id} />;
  const singletonKey = id === "settings" ? "site" : id;
  if (SINGLETON_SCHEMAS[singletonKey] && !["about", "homepage"].includes(singletonKey)) {
    return (
      <>
        <SingletonPage schema={SINGLETON_SCHEMAS[singletonKey]} name={singletonKey} key={singletonKey} />
        {id === "settings" && <ExportPanel />}
      </>
    );
  }
  return <p className="font-mono text-xs text-ink3">UNKNOWN SECTION</p>;
}

// ---------- auth screens ----------

function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "forgot") {
        await api.post("/auth/forgot-password", { email });
        setMsg("✓ If this is the admin email, a reset link has been sent.");
      } else {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("amurao_admin_token", data.token);
        onLogin(data.user);
      }
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas bg-grid flex items-center justify-center px-4">
      <form onSubmit={submit} className="panel w-full max-w-sm p-8" data-testid="admin-login-form">
        <span className="font-mono text-[10px] tracking-[0.3em] text-violet">AMURAO.DEV // ADMIN</span>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">
          {mode === "forgot" ? "RESET ACCESS" : "SYSTEM ACCESS"}
        </h1>
        <label className="block mt-7 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-2">Email</label>
        <input data-testid="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 px-4 bg-canvas border border-line font-mono text-xs focus:border-violet focus:outline-none" />
        {mode === "login" && (
          <>
            <label className="block mt-4 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-2">Password</label>
            <input data-testid="admin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 bg-canvas border border-line font-mono text-xs focus:border-violet focus:outline-none" />
          </>
        )}
        {error && <p className="mt-4 font-mono text-xs text-pk" data-testid="admin-login-error">{error}</p>}
        {msg && <p className="mt-4 font-mono text-xs text-grn">{msg}</p>}
        <button data-testid="admin-login-submit" disabled={busy}
          className="mt-6 w-full h-11 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold disabled:opacity-50"
          style={{ color: "var(--bg)" }}>
          {busy ? "…" : mode === "forgot" ? "Send Reset Link →" : "Authenticate →"}
        </button>
        <button type="button" onClick={() => { setMode(mode === "forgot" ? "login" : "forgot"); setError(""); setMsg(""); }}
          data-testid="admin-forgot-toggle"
          className="mt-4 w-full text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 hover:text-violet">
          {mode === "forgot" ? "← Back to login" : "Forgot password?"}
        </button>
      </form>
    </div>
  );
}

function ResetPassword({ token, onDone }) {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/reset-password", { token, password });
      setMsg("✓ Password updated. You can log in now.");
      setTimeout(onDone, 1500);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div className="min-h-screen bg-canvas bg-grid flex items-center justify-center px-4">
      <form onSubmit={submit} className="panel w-full max-w-sm p-8" data-testid="admin-reset-form">
        <span className="font-mono text-[10px] tracking-[0.3em] text-violet">AMURAO.DEV // ADMIN</span>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">NEW PASSWORD</h1>
        <label className="block mt-7 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-2">New Password</label>
        <input data-testid="admin-reset-password" type="password" required minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 px-4 bg-canvas border border-line font-mono text-xs focus:border-violet focus:outline-none" />
        {error && <p className="mt-4 font-mono text-xs text-pk">{error}</p>}
        {msg && <p className="mt-4 font-mono text-xs text-grn">{msg}</p>}
        <button data-testid="admin-reset-submit"
          className="mt-6 w-full h-11 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold"
          style={{ color: "var(--bg)" }}>
          Set Password →
        </button>
      </form>
    </div>
  );
}

// ---------- shell ----------

export default function AdminApp() {
  const [user, setUser] = useState(undefined);
  const [drawer, setDrawer] = useState(false);
  const { theme, cycle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const section = location.pathname.replace(/^\/admin\/?/, "") || "dashboard";
  const resetMatch = location.pathname.match(/^\/admin\/reset\/(.+)$/);

  const check = useCallback(async () => {
    if (!localStorage.getItem("amurao_admin_token")) return setUser(null);
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("amurao_admin_token");
      setUser(null);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  if (resetMatch) {
    return <ResetPassword token={resetMatch[1]} onDone={() => navigate("/admin")} />;
  }
  if (user === undefined) {
    return <div className="min-h-screen bg-canvas grid place-items-center font-mono text-xs text-ink3 animate-blink">CHECKING SESSION…</div>;
  }
  if (!user) return <Login onLogin={setUser} />;

  const logout = () => {
    localStorage.removeItem("amurao_admin_token");
    setUser(null);
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "system" ? Monitor : Moon;

  const sidebar = (
    <>
      <div className="px-5 py-5 border-b border-line">
        <span className="font-mono text-xs font-bold tracking-[0.2em] text-ink">AMURAO.DEV</span>
        <div className="font-mono text-[9px] tracking-[0.25em] text-violet mt-1 flex items-center gap-2">
          <StatusDot /> ADMIN.CMS
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Admin">
        {NAV.map((g) => (
          <div key={g.group} className="mb-2">
            <div className="px-5 pt-3 pb-1.5 font-mono text-[8px] tracking-[0.3em] text-ink3">{g.group}</div>
            {g.items.map((item) => (
              <Link
                key={item.id}
                to={`/admin/${item.id}`}
                data-testid={`admin-nav-${item.id}`}
                onClick={() => setDrawer(false)}
                className={`block px-5 py-2 font-mono text-[10px] tracking-[0.2em] uppercase border-l-2 transition-colors ${
                  section === item.id ? "border-violet text-violet bg-violet/5" : "border-transparent text-ink3 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex flex-col gap-1 p-3 border-t border-line">
        <button onClick={cycle} data-testid="admin-theme-toggle"
          className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 hover:text-ink text-left">
          <ThemeIcon size={13} /> {theme}
        </button>
        <a href="/" data-testid="admin-view-site"
          className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 hover:text-ink">
          <ExternalLink size={13} /> View Site
        </a>
        <button onClick={logout} data-testid="admin-logout"
          className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-pk hover:opacity-80 text-left">
          <LogOut size={13} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row" data-testid="admin-dashboard">
      <aside className="hidden lg:flex w-60 border-r border-line bg-canvas2/40 flex-col shrink-0 sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* mobile top bar + drawer */}
      <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-line bg-canvas2/40 sticky top-0 z-40">
        <span className="font-mono text-xs font-bold tracking-[0.2em]">AMURAO.DEV <span className="text-violet">CMS</span></span>
        <button onClick={() => setDrawer(true)} aria-label="Open admin menu" data-testid="admin-drawer-toggle"
          className="h-9 w-9 grid place-items-center border border-line">
          <Menu size={16} />
        </button>
      </div>
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex" data-testid="admin-drawer">
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="relative w-72 max-w-[85vw] bg-canvas border-r border-line flex flex-col h-full">
            <div className="flex justify-end p-3 border-b border-line">
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="h-9 w-9 grid place-items-center border border-line">
                <X size={16} />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 p-5 sm:p-8 max-w-[1200px]">
        <Section id={section} user={user} />
      </main>
    </div>
  );
}
