import { Link } from "react-router-dom";
import { TechLabel } from "../components/system/bits";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-32 text-center bg-grid min-h-[60vh]">
      <TechLabel className="block mb-6">ERROR / ROUTE.RESOLVE</TechLabel>
      <h1 className="font-display font-extrabold tracking-tight text-7xl sm:text-9xl text-ink">
        4<span className="text-violet">0</span>4
      </h1>
      <p className="mt-6 font-mono text-xs text-ink3 tracking-[0.2em] uppercase">Route not found in system registry</p>
      <Link to="/" data-testid="notfound-home"
        className="mt-10 inline-flex h-11 items-center px-7 border border-line font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
        ← Return to Root
      </Link>
    </div>
  );
}
