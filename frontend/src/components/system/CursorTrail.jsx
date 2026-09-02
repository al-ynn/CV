import { useEffect, useRef } from "react";

export default function CursorTrail() {
  const ref = useRef(null);
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2;
    const el = ref.current;
    if (!fine || reduce || lowPower || !el) return;
    let raf = 0, tx = -500, ty = -500, x = tx, y = ty, shown = false;
    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; x = tx; y = ty; el.style.opacity = "1"; }
    };
    const onLeave = () => { shown = false; el.style.opacity = "0"; };
    const tick = () => {
      x += (tx - x) * 0.1;
      y += (ty - y) * 0.1;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return <div ref={ref} aria-hidden="true" className="cursor-glow" data-testid="cursor-trail" />;
}
