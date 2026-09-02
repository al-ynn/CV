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
import ServicesAdmin from "./ServicesAdmin";
import PricingAdmin from "./PricingAdmin";
import { AdminFeedbackProvider } from "./AdminFeedback";
import {
  Sun, Moon, Monitor, LogOut, ExternalLink, Menu, X, LayoutDashboard, Globe,
  FolderGit2, Briefcase, Inbox as InboxIcon, Image as ImageIcon, Settings2,
  PanelLeftClose, PanelLeftOpen, ChevronRight,
} from "lucide-react";

const APPS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, sections: [
    { id: "dashboard", label: "Overview" },
    { id: "activity", label: "Activity Log" },
  ] },
  { id: "website", label: "Website", icon: Globe, sections: [
    { id: "homepage", label: "Homepage" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Contact & Social" },
    { id: "profile", label: "Profile" },
    { id: "seo", label: "SEO" },
  ] },
  { id: "portfolio", label: "Portfolio", icon: FolderGit2, sections: [
    { id: "projects", label: "Projects" },
    { id: "technologies", label: "Technologies" },
    { id: "skills", label: "Skills" },
  ] },
  { id: "career", label: "Career", icon: Briefcase, sections: [
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "certifications", label: "Certifications" },
    { id: "journey", label: "Journey Log" },
  ] },
  { id: "inbox", label: "Inbox", icon: InboxIcon, sections: [
    { id: "messages", label: "Contact Requests" },
  ] },
  { id: "assets", label: "Assets", icon: ImageIcon, sections: [
    { id: "media", label: "Media Library" },
    { id: "resume", label: "Resume / CV" },
  ] },
  { id: "system", label: "System", icon: Settings2, sections: [
    { id: "settings", label: "Site Settings" },
    { id: "appearance", label: "Appearance" },
    { id: "estimator", label: "Estimator" },
    { id: "security", label: "Security" },
  ] },
];

const SECTION_TO_APP = Object.fromEntries(
  APPS.flatMap((a) => a.sections.map((s) => [s.id, a.id]))
);

function Section({ id, user }) {
  if (id === "dashboard") return <Dashboard user={user} />;
  if (id === "about") return <AboutAdmin />;
  if (id === "homepage") return <HomepageAdmin />;
  if (id === "services") return <ServicesAdmin />;
  if (id === "pricing") return <PricingAdmin />;
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
  const [rail, setRail] = useState(false); // primary sidebar collapsed to icons
  const [subHidden, setSubHidden] = useState(false);
  const { theme, cycle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const section = location.pathname.replace(/^\/admin\/?/, "") || "dashboard";
  const resetMatch = location.pathname.match(/^\/admin\/reset\/(.+)$/);
  const appId = SECTION_TO_APP[section] || "dashboard";
  const app = APPS.find((a) => a.id === appId);
  const activeSection = app?.sections.find((s) => s.id === section);

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

  const goSection = (id) => { setDrawer(false); navigate(`/admin/${id}`); };

  // ----- primary sidebar (app rail) -----
  const primaryNav = (collapsed) => (
    <>
      <div className={`px-5 py-5 border-b border-line ${collapsed ? "px-0 text-center" : ""}`}>
        {collapsed ? (
          <span className="font-mono text-xs font-bold text-violet">A.</span>
        ) : (
          <>
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-ink">AMURAO.DEV</span>
            <div className="font-mono text-[9px] tracking-[0.25em] text-violet mt-1 flex items-center gap-2">
              <StatusDot /> ADMIN.CMS
            </div>
          </>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Admin apps">
        {APPS.map((a) => {
          const active = a.id === appId;
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => goSection(a.sections[0].id)}
              data-testid={`admin-app-${a.id}`}
              title={a.label}
              className={`w-full flex items-center gap-3 px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase border-l-2 transition-colors ${
                collapsed ? "justify-center px-0" : ""
              } ${active ? "border-violet text-violet bg-violet/10" : "border-transparent text-ink3 hover:text-ink hover:bg-canvas2/60"}`}
            >
              <Icon size={15} className="shrink-0" />
              {!collapsed && <span>{a.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className={`flex flex-col gap-1 p-3 border-t border-line ${collapsed ? "items-center" : ""}`}>
        <button onClick={() => setRail(!rail)} data-testid="admin-collapse-toggle"
          aria-label={rail ? "Expand navigation" : "Collapse navigation"}
          className={`hidden lg:flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 hover:text-ink ${collapsed ? "justify-center px-0" : ""}`}>
          {rail ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />} {!collapsed && (rail ? "Expand" : "Collapse Nav")}
        </button>
        <button onClick={cycle} data-testid="admin-theme-toggle"
          className={`flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 hover:text-ink ${collapsed ? "justify-center px-0" : ""}`}>
          <ThemeIcon size={13} /> {!collapsed && theme}
        </button>
        <a href="/" data-testid="admin-view-site"
          className={`flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 hover:text-ink ${collapsed ? "justify-center px-0" : ""}`}>
          <ExternalLink size={13} /> {!collapsed && "View Site"}
        </a>
        <button onClick={logout} data-testid="admin-logout"
          className={`flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-pk hover:opacity-80 ${collapsed ? "justify-center px-0" : ""}`}>
          <LogOut size={13} /> {!collapsed && "Logout"}
        </button>
      </div>
    </>
  );

  // ----- contextual sub-sidebar -----
  const subNav = (
    <>
      <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.3em] text-violet uppercase">{app.label}</span>
        <button onClick={() => setSubHidden(true)} aria-label="Hide section menu" data-testid="admin-sub-hide"
          className="hidden lg:grid h-6 w-6 place-items-center text-ink3 hover:text-ink">
          <X size={12} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2" aria-label={`${app.label} sections`}>
        {app.sections.map((s) => (
          <Link
            key={s.id}
            to={`/admin/${s.id}`}
            data-testid={`admin-nav-${s.id}`}
            onClick={() => setDrawer(false)}
            className={`flex items-center justify-between px-5 py-2.5 font-mono text-[10px] tracking-[0.18em] uppercase border-l-2 transition-colors ${
              section === s.id
                ? "border-violet text-ink bg-violet/10 font-semibold"
                : "border-transparent text-ink3 hover:text-ink hover:bg-canvas2/60"
            }`}
          >
            {s.label}
            {section === s.id && <ChevronRight size={11} className="text-violet" />}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <AdminFeedbackProvider>
    <div className="admin-shell min-h-screen bg-canvas flex flex-col lg:flex-row" data-testid="admin-dashboard">
      {/* desktop: primary rail + contextual sub-sidebar */}
      <aside className={`hidden lg:flex ${rail ? "w-16" : "w-52"} border-r border-line bg-canvas2/40 flex-col shrink-0 sticky top-0 h-screen transition-[width] duration-200`}>
        {primaryNav(rail)}
      </aside>
      {subHidden ? (
        <div className="hidden lg:flex flex-col border-r border-line bg-canvas2/20 shrink-0 sticky top-0 h-screen">
          <button onClick={() => setSubHidden(false)} data-testid="admin-sub-show" aria-label="Show section menu"
            className="m-2 h-8 w-8 grid place-items-center border border-line text-ink3 hover:text-violet hover:border-violet">
            <ChevronRight size={13} />
          </button>
        </div>
      ) : (
        <aside className="hidden lg:flex w-52 border-r border-line bg-canvas2/20 flex-col shrink-0 sticky top-0 h-screen" data-testid="admin-subnav">
          {subNav}
        </aside>
      )}

      {/* mobile top bar + drawer */}
      <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-line bg-canvas2/40 sticky top-0 z-40">
        <span className="font-mono text-xs font-bold tracking-[0.2em]">AMURAO.DEV <span className="text-violet">CMS</span></span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink3">{app.label} / {activeSection?.label}</span>
          <button onClick={() => setDrawer(true)} aria-label="Open admin menu" data-testid="admin-drawer-toggle"
            className="h-9 w-9 grid place-items-center border border-line">
            <Menu size={16} />
          </button>
        </div>
      </div>
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex" data-testid="admin-drawer">
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="relative w-80 max-w-[88vw] bg-canvas border-r border-line flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-center p-3 border-b border-line">
              <span className="font-mono text-[10px] tracking-[0.25em] text-violet uppercase px-2">Admin.Apps</span>
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="h-9 w-9 grid place-items-center border border-line">
                <X size={16} />
              </button>
            </div>
            {APPS.map((a) => {
              const Icon = a.icon;
              const active = a.id === appId;
              return (
                <div key={a.id} className="border-b border-line">
                  <div className={`flex items-center gap-3 px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase ${active ? "text-violet" : "text-ink3"}`}>
                    <Icon size={14} /> {a.label}
                  </div>
                  <div className="pb-2">
                    {a.sections.map((s) => (
                      <button key={s.id} onClick={() => goSection(s.id)} data-testid={`admin-mnav-${s.id}`}
                        className={`w-full text-left pl-12 pr-5 py-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
                          section === s.id ? "text-violet bg-violet/10" : "text-ink2 hover:text-ink"
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="p-3 flex flex-col gap-1">
              <button onClick={cycle} className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3">
                <ThemeIcon size={13} /> {theme}
              </button>
              <a href="/" className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3">
                <ExternalLink size={13} /> View Site
              </a>
              <button onClick={logout} className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-pk">
                <LogOut size={13} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        {/* breadcrumb bar */}
        <div className="hidden lg:flex items-center gap-2 h-11 px-6 border-b border-line font-mono text-[9px] tracking-[0.2em] uppercase text-ink3" data-testid="admin-breadcrumbs">
          <span>Admin</span>
          <span className="text-line">/</span>
          <span className="text-ink2">{app.label}</span>
          <span className="text-line">/</span>
          <span className="text-violet">{activeSection?.label || section}</span>
        </div>
        <div className="p-5 sm:p-8">
          <Section id={section} user={user} />
        </div>
      </main>
    </div>
    </AdminFeedbackProvider>
  );
}
