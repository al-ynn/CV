import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Resume from "@/pages/Resume";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import AboutPreview from "@/pages/AboutPreview";
import AdminApp from "@/admin/AdminApp";

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11 });
    return () => lenis.destroy();
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
                <Route path="/journey" element={<Journey />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/about-preview/:token" element={<AboutPreview />} />
              <Route path="/admin/*" element={<AdminApp />} />
            </Routes>
          </BrowserRouter>
        </ContentProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}

export default App;
