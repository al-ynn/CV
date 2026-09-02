import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CursorTrail from "../system/CursorTrail";
import { useContent } from "../../lib/content";

export default function Layout({ onPalette }) {
  const { error, refresh } = useContent();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <CursorTrail />
      <Navbar onPalette={onPalette} />
      <main className="flex-1 pt-16">
        {error && (
          <div className="border-b border-pk/40 bg-pk/10 px-5 py-3 font-mono text-[10px] tracking-[0.08em] text-pk" role="alert" data-testid="content-api-error">
            CONTENT API UNAVAILABLE — {String(error)} <button onClick={refresh} className="ml-3 underline hover:no-underline">RETRY</button>
          </div>
        )}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
