import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { ThemeProvider } from "@/lib/theme";
import { ContentProvider } from "@/lib/content";
import Layout from "@/components/layout/Layout";
import CommandPalette from "@/components/CommandPalette";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Work from "@/pages/Work";
import CaseStudy from "@/pages/CaseStudy";
import Services from "@/pages/Services";
import Pricing from "@/pages/Pricing";
import Journey from "@/pages/Journey";
import Experience from "@/pages/Experience";
import Resume from "@/pages/Resume";
import Contact from "@/pages/Contact";
import ContactSuccess from "@/pages/ContactSuccess";
import NotFound from "@/pages/NotFound";
import AboutPreview from "@/pages/AboutPreview";
import HomePreview from "@/pages/HomePreview";
import AdminApp from "@/admin/AdminApp";

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduceMotion ? null : new Lenis({ autoRaf: true, lerp: 0.11 });
    const body = document.body;
    const root = document.documentElement;
    const original = {
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      rootOverflow: root.style.overflow,
    };
    let locked = false;

    const syncOverlayLock = () => {
      const shouldLock = Boolean(document.querySelector('[aria-modal="true"], [data-scroll-lock="true"]'));
      if (shouldLock === locked) return;
      locked = shouldLock;
      if (locked) {
        const scrollbarWidth = window.innerWidth - root.clientWidth;
        body.style.overflow = "hidden";
        root.style.overflow = "hidden";
        if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
        lenis?.stop();
      } else {
        body.style.overflow = original.bodyOverflow;
        body.style.paddingRight = original.bodyPaddingRight;
        root.style.overflow = original.rootOverflow;
        lenis?.start();
      }
    };

    const observer = new MutationObserver(syncOverlayLock);
    observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-modal", "data-scroll-lock"] });
    syncOverlayLock();
    return () => {
      observer.disconnect();
      body.style.overflow = original.bodyOverflow;
      body.style.paddingRight = original.bodyPaddingRight;
      root.style.overflow = original.rootOverflow;
      lenis?.destroy();
    };
  }, []);

  useEffect(() => {
    console.log(
      "%cHello, developer.%c\nIf you're inspecting this, we'll probably get along.\n→ amurao.dev",
      "font-family:monospace;font-size:14px;color:#a855f7;font-weight:bold",
      "font-family:monospace;font-size:11px;color:#888"
    );
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ContentProvider>
          <BrowserRouter>
            <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
            <Routes>
              <Route element={<Layout onPalette={() => setPaletteOpen(true)} />}>
                <Route index element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/work" element={<Work />} />
                <Route path="/work/:slug" element={<CaseStudy />} />
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/experience" element={<Experience />} />
                <Route path="/journey" element={<Navigate to="/experience" replace />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/contact/sent" element={<ContactSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/about-preview/:token" element={<AboutPreview />} />
              <Route path="/home-preview/:token" element={<HomePreview />} />
              <Route path="/admin/*" element={<AdminApp />} />
            </Routes>
          </BrowserRouter>
        </ContentProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}

export default App;
