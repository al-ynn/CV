import { useEffect, useState, useCallback } from "react";
import api, { formatApiError } from "../lib/api";
import { useTheme } from "../lib/theme";
import { StatusDot } from "../components/system/bits";
import { Sun, Moon, Monitor, LogOut, ExternalLink } from "lucide-react";
import { Overview, Inquiries, ProjectsPanel, ServicesPanel, PricingPanel, SettingsPanel } from "./panels";

const TABS = [
  { id: "overview", label: "OVERVIEW" },
  { id: "inquiries", label: "INQUIRIES" },
  { id: "projects", label: "PROJECTS" },
  { id: "services", label: "SERVICES" },
  { id: "pricing", label: "PRICING" },
  { id: "settings", label: "SETTINGS" },
];

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("amurao_admin_token", data.token);
      onLogin(data.user);
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
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">SYSTEM ACCESS</h1>
        <label className="block mt-7 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-2">Email</label>
        <input data-testid="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 px-4 bg-canvas border border-line font-mono text-xs focus:border-violet focus:outline-none" />
        <label className="block mt-4 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-2">Password</label>
        <input data-testid="admin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 px-4 bg-canvas border border-line font-mono text-xs focus:border-violet focus:outline-none" />
        {error && <p className="mt-4 font-mono text-xs text-pk" data-testid="admin-login-error">{error}</p>}
        <button data-testid="admin-login-submit" disabled={busy}
          className="mt-6 w-full h-11 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold disabled:opacity-50"
          style={{ color: "var(--bg)" }}>
          {busy ? "AUTHENTICATING…" : "Authenticate →"}
        </button>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [user, setUser] = useState(undefined); // undefined=checking, null=logged out
  const [tab, setTab] = useState("overview");
  const { theme, cycle } = useTheme();

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

  if (user === undefined) {
    return <div className="min-h-screen bg-canvas grid place-items-center font-mono text-xs text-ink3 animate-blink">CHECKING SESSION…</div>;
  }
  if (!user) return <Login onLogin={setUser} />;

  const logout = () => {
    localStorage.removeItem("amurao_admin_token");
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row" data-testid="admin-dashboard">
      <aside className="lg:w-60 border-b lg:border-b-0 lg:border-r border-line bg-canvas2/40 flex lg:flex-col justify-between shrink-0">
        <div>
          <div className="px-5 py-5 border-b border-line hidden lg:block">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-ink">AMURAO.DEV</span>
            <div className="font-mono text-[9px] tracking-[0.25em] text-violet mt-1 flex items-center gap-2">
              <StatusDot /> ADMIN.CONSOLE
            </div>
          </div>
          <nav className="flex lg:flex-col overflow-x-auto" aria-label="Admin">
            {TABS.map((t) => (
              <button
                key={t.id}
                data-testid={`admin-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3.5 font-mono text-[10px] tracking-[0.2em] uppercase text-left whitespace-nowrap border-l-2 transition-colors ${
                  tab === t.id ? "border-violet text-violet bg-violet/5" : "border-transparent text-ink3 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="hidden lg:flex flex-col gap-1 p-3 border-t border-line">
          <button onClick={cycle} data-testid="admin-theme-toggle"
            className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 hover:text-ink">
            {theme === "light" ? <Sun size={13} /> : theme === "system" ? <Monitor size={13} /> : <Moon size={13} />} {theme}
          </button>
          <a href="/" data-testid="admin-view-site" className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 hover:text-ink">
            <ExternalLink size={13} /> View Site
          </a>
          <button onClick={logout} data-testid="admin-logout"
            className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-pk hover:opacity-80">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-5 sm:p-8 max-w-[1200px]">
        {tab === "overview" && <Overview setTab={setTab} />}
        {tab === "inquiries" && <Inquiries />}
        {tab === "projects" && <ProjectsPanel />}
        {tab === "services" && <ServicesPanel />}
        {tab === "pricing" && <PricingPanel />}
        {tab === "settings" && <SettingsPanel />}
        <div className="lg:hidden mt-8 flex gap-4 border-t border-line pt-4">
          <button onClick={cycle} className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink3">THEME: {theme}</button>
          <a href="/" className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink3">VIEW SITE</a>
          <button onClick={logout} data-testid="admin-logout-mobile" className="font-mono text-[10px] tracking-[0.15em] uppercase text-pk">LOGOUT</button>
        </div>
      </main>
    </div>
  );
}
