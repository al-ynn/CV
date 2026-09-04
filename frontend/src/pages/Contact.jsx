import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { TechLabel, StatusDot } from "../components/system/bits";
import DirectChannels from "../components/ContactChannels";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const inputCls =
  "w-full h-11 px-4 bg-card border border-line font-mono text-xs text-ink placeholder:text-ink3 focus:border-violet focus:outline-none transition-colors";
const labelCls = "block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-2";

const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

export default function Contact() {
  const { settings, estimator } = useContent();
  useSeo("Contact");
  const location = useLocation();
  const navigate = useNavigate();
  const brief = location.state?.brief;
  const interestedService = location.state?.service;

  const projectTypes = estimator.projectTypes || [];
  const budgetOptions = estimator.budgetOptions || [];
  const serviceType = interestedService ? projectTypes.find((type) => {
    const service = interestedService.toLowerCase();
    const candidate = type.toLowerCase();
    if (service.includes("store") || service.includes("commerce") || service.includes("payment")) return candidate.includes("commerce");
    if (service.includes("design") || service.includes("ui") || service.includes("prototype")) return candidate.includes("design");
    if (service.includes("system") || service.includes("inventory") || service.includes("workflow")) return candidate.includes("system");
    if (service.includes("wordpress") || service.includes("cms")) return candidate.includes("wordpress") || candidate.includes("cms");
    return candidate.includes("web") || candidate.includes("development");
  }) : "";

  const [form, setForm] = useState({
    name: "", email: "", company: "",
    projectType: brief?.type || serviceType || "",
    budget: "", timeline: "",
    message: brief
      ? `Project brief from the estimator:\nType: ${brief.type}\nFeatures: ${brief.features.join(", ") || "—"}\nEstimated range: ${brief.range}\n\nDetails: `
      : interestedService ? `I'm interested in: ${interestedService}.\n\nProject details: ` : "",
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
    if (form.website) {
      navigate("/contact/sent", { replace: true, state: { submitted: true } });
      return;
    }
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error("Contact email delivery is not configured.");
      }
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: "aleanaamurao12@gmail.com",
            name: form.name,
            email: form.email,
            company: form.company || "—",
            project_type: form.projectType,
            budget: form.budget || "—",
            timeline: form.timeline || "—",
            message: form.message,
            estimator_range: brief?.range || "—",
            estimator_features: brief?.features?.join(", ") || "—",
          },
        }),
      });
      if (!response.ok) throw new Error("Unable to send your message right now. Please try again.");
      navigate("/contact/sent", { replace: true, state: { submitted: true } });
    } catch (err) {
      setError(err.message || "Unable to send your message right now. Please try again.");
      setPhase("error");
    }
  };

  const FieldError = ({ k }) =>
    fieldErrors[k] ? <p className="mt-1.5 font-mono text-[10px] text-pk" data-testid={`error-${k}`}>{fieldErrors[k]}</p> : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-grid">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 78% 18%, color-mix(in srgb, var(--violet) 10%, transparent), transparent 34%), radial-gradient(circle at 12% 78%, color-mix(in srgb, var(--violet) 7%, transparent), transparent 30%)" }} />
      <div className="pointer-events-none absolute top-[12%] -right-32 h-96 w-96 border border-violet/15 rotate-45" />
      <div className="pointer-events-none absolute top-[18%] -right-24 h-96 w-96 border border-line rotate-45" />
      <div className="pointer-events-none absolute bottom-[8%] -left-40 h-80 w-80 border border-violet/10 rotate-45" />
      <div className="pointer-events-none absolute top-0 left-[18%] h-px w-[34%] bg-gradient-to-r from-transparent via-violet to-transparent opacity-50" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
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
              <span className="text-ink">Within a few hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink3">Status</span>
              <span className="flex items-center gap-2 text-grn">
                <StatusDot color={settings.available ? "var(--green)" : "var(--amber)"} />
                {settings.availability === "limited" ? "Limited" : settings.available ? "Available" : "Unavailable"}
              </span>
            </div>
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

      <section className="mt-14 border-t border-line pt-10" aria-label="Direct contact options">
        <TechLabel className="block mb-4">DIRECT.CONTACT</TechLabel>
        <DirectChannels settings={settings} columns="md:grid-cols-3" testidPrefix="contact-channel" compact />
      </section>
      </div>
    </div>
  );
}
