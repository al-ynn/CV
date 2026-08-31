import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api, { formatApiError } from "../lib/api";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { TechLabel, StatusDot } from "../components/system/bits";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const DEFAULT_TYPES = ["Full-Stack Web Development", "UI/UX & Product Design", "E-Commerce Development",
  "Backend, API & Database", "Business / Information System", "WordPress / CMS", "Development Support", "Something else"];
const DEFAULT_BUDGETS = ["Below ₱10K", "₱10K–₱25K", "₱25K–₱50K", "₱50K–₱100K", "₱100K+", "Not sure yet"];

const inputCls =
  "w-full h-11 px-4 bg-card border border-line font-mono text-xs text-ink placeholder:text-ink3 focus:border-violet focus:outline-none transition-colors";
const labelCls = "block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-2";

export default function Contact() {
  const { settings, estimator } = useContent();
  useSeo("Contact");
  const location = useLocation();
  const brief = location.state?.brief;

  const projectTypes = estimator.projectTypes?.length ? estimator.projectTypes : DEFAULT_TYPES;
  const budgetOptions = estimator.budgetOptions?.length ? estimator.budgetOptions : DEFAULT_BUDGETS;

  const [form, setForm] = useState({
    name: "", email: "", company: "",
    projectType: brief?.type || "",
    budget: "", timeline: "",
    message: brief
      ? `Project brief from the estimator:\nType: ${brief.type}\nFeatures: ${brief.features.join(", ") || "—"}\nEstimated range: ${brief.range}\n\nDetails: `
      : "",
    website: "",
  });
  const [phase, setPhase] = useState("idle");
  const [logLines, setLogLines] = useState([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "A valid email is required.";
    if (!form.projectType) errs.projectType = "Please select a project type.";
    if (form.message.trim().length < 10) errs.message = "Project description must be at least 10 characters.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setPhase("deploying");
    setLogLines([]);
    const steps = ["VALIDATING REQUEST...", "✓ CONTACT INFORMATION", "✓ PROJECT DETAILS", "✓ MESSAGE QUEUED"];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 420));
      setLogLines((l) => [...l, steps[i]]);
    }
    try {
      await api.post("/inquiries", { ...form, brief: brief || undefined });
      setPhase("done");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
      setPhase("error");
    }
  };

  const FieldError = ({ k }) =>
    fieldErrors[k] ? <p className="mt-1.5 font-mono text-[10px] text-pk" data-testid={`error-${k}`}>{fieldErrors[k]}</p> : null;

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <div className="grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5">
          <TechLabel className="block mb-6">06 / TRANSMISSION</TechLabel>
          <h1 className="font-display font-extrabold tracking-tight leading-[0.95] text-5xl sm:text-6xl lg:text-7xl text-ink">
            HAVE A<br />SYSTEM<br /><span className="text-violet">IN MIND?</span>
          </h1>
          <p className="mt-7 max-w-md text-sm sm:text-base text-ink2 leading-relaxed">
            Tell me what you're building, what problem you're trying to solve, or what existing system needs improvement.
          </p>
          <div className="mt-10 panel p-5 space-y-4 font-mono text-[10px] tracking-[0.15em] uppercase">
            <div className="flex items-center justify-between">
              <span className="text-ink3">Response</span>
              <span className="text-ink">Within a few days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink3">Status</span>
              <span className="flex items-center gap-2 text-grn">
                <StatusDot color={settings.available ? "var(--green)" : "var(--amber)"} />
                {settings.availability === "limited" ? "Limited" : settings.available ? "Available" : "Unavailable"}
              </span>
            </div>
            {settings.contactEmail && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-ink3">Direct</span>
                <a href={`mailto:${settings.contactEmail}`} data-testid="contact-email-link"
                  className="text-violet hover:underline truncate">{settings.contactEmail}</a>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-ink3">Small budgets</span>
              <span className="text-ink">Welcome</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {phase === "done" ? (
              <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="panel p-8 sm:p-12" data-testid="contact-success">
                <div className="font-mono text-xs space-y-2 mb-8">
                  {logLines.map((l) => (
                    <div key={l} className={l.startsWith("✓") ? "text-grn" : "text-ink3"}>{l}</div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 size={22} className="text-grn" />
                  <span className="font-mono text-sm tracking-[0.25em] text-grn">REQUEST RECEIVED</span>
                </div>
                <p className="text-sm text-ink2 leading-relaxed">
                  I'll review the details and get back to you. If it needs scoping, we'll scope it together.
                </p>
                <button data-testid="contact-send-another"
                  onClick={() => { setPhase("idle"); setLogLines([]); setForm((f) => ({ ...f, message: "" })); }}
                  className="mt-8 font-mono text-[10px] tracking-[0.2em] uppercase text-violet hover:underline">
                  ← Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit}
                className="panel p-6 sm:p-8" data-testid="contact-form" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="cf-name" className={labelCls}>Name *</label>
                    <input id="cf-name" data-testid="contact-name" value={form.name} onChange={set("name")} className={inputCls} placeholder="Your name" />
                    <FieldError k="name" />
                  </div>
                  <div>
                    <label htmlFor="cf-email" className={labelCls}>Email *</label>
                    <input id="cf-email" data-testid="contact-email" type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="you@company.com" />
                    <FieldError k="email" />
                  </div>
                  <div>
                    <label htmlFor="cf-company" className={labelCls}>Company / Organization</label>
                    <input id="cf-company" data-testid="contact-company" value={form.company} onChange={set("company")} className={inputCls} placeholder="Optional" />
                  </div>
                  <div>
                    <label htmlFor="cf-type" className={labelCls}>Project Type *</label>
                    <select id="cf-type" data-testid="contact-project-type" value={form.projectType} onChange={set("projectType")} className={inputCls}>
                      <option value="">Select…</option>
                      {projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <FieldError k="projectType" />
                  </div>
                  <div>
                    <label htmlFor="cf-budget" className={labelCls}>Estimated Budget</label>
                    <select id="cf-budget" data-testid="contact-budget" value={form.budget} onChange={set("budget")} className={inputCls}>
                      <option value="">Select…</option>
                      {budgetOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cf-timeline" className={labelCls}>Desired Timeline</label>
                    <input id="cf-timeline" data-testid="contact-timeline" value={form.timeline} onChange={set("timeline")} className={inputCls} placeholder="e.g. 2–3 months" />
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor="cf-message" className={labelCls}>Project Description *</label>
                  <textarea id="cf-message" data-testid="contact-message" rows={6} value={form.message} onChange={set("message")}
                    className="w-full px-4 py-3 bg-card border border-line font-mono text-xs text-ink placeholder:text-ink3 focus:border-violet focus:outline-none transition-colors resize-y"
                    placeholder="What are you building? What problem does it solve? What exists already?" />
                  <FieldError k="message" />
                </div>
                <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")}
                  className="hidden" aria-hidden="true" name="website" />

                {phase === "error" && (
                  <div className="mt-5 flex items-center gap-2 text-pk font-mono text-xs" data-testid="contact-error">
                    <AlertTriangle size={14} /> {error}
                  </div>
                )}

                {phase === "deploying" && (
                  <div className="mt-5 font-mono text-xs space-y-1.5" data-testid="contact-deploy-log">
                    {logLines.map((l) => (
                      <motion.div key={l} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        className={l.startsWith("✓") ? "text-grn" : "text-ink3"}>
                        {l}
                      </motion.div>
                    ))}
                  </div>
                )}

                <button type="submit" data-testid="contact-submit" disabled={phase === "deploying"}
                  className="mt-7 w-full sm:w-auto h-12 px-10 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ color: "var(--bg)" }}>
                  {phase === "deploying" ? "DEPLOYING…" : "Transmit Request →"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
