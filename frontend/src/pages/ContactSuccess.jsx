import { Link, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import useSeo from "../lib/useSeo";
import { TechLabel } from "../components/system/bits";

export default function ContactSuccess() {
  useSeo("Message Sent");
  const location = useLocation();

  if (!location.state?.submitted) return <Navigate to="/contact" replace />;

  return (
    <main className="relative min-h-[75vh] overflow-hidden bg-grid flex items-center">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--violet) 12%, transparent), transparent 38%)" }} />
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto w-full max-w-2xl px-5 sm:px-8 py-20 text-center"
        data-testid="contact-success-page">
        <TechLabel className="block mb-7">TRANSMISSION.COMPLETE</TechLabel>
        <div className="mx-auto mb-7 grid h-16 w-16 place-items-center border border-grn/40 bg-grn/5">
          <CheckCircle2 size={30} className="text-grn" aria-hidden="true" />
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-ink">
          YOUR MESSAGE<br /><span className="text-violet">HAS BEEN SENT.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-sm sm:text-base leading-relaxed text-ink2">
          Thank you for reaching out. Your project details have been received, and I’ll review them carefully before getting back to you as soon as possible.
        </p>
        <Link to="/" data-testid="contact-success-home"
          className="mt-9 inline-flex h-12 items-center gap-3 bg-violet px-7 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
          style={{ color: "var(--bg)" }}>
          <ArrowLeft size={15} /> Back to home
        </Link>
      </motion.section>
    </main>
  );
}
