import { motion } from "framer-motion";

export default function ArchDiagram({ nodes, className = "" }) {
  if (!nodes || nodes.length === 0) return null;
  return (
    <div className={`${className}`}>
      <div className="hidden md:flex items-stretch gap-0">
        {nodes.map((node, i) => (
          <div key={node} className="flex items-center flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="panel px-3 py-3 text-center w-full"
            >
              <span className="font-mono text-[10px] tracking-[0.15em] text-ink2 block leading-snug">
                {node}
              </span>
            </motion.div>
            {i < nodes.length - 1 && (
              <div className="relative w-6 shrink-0 h-px bg-violet/60">
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border-t border-r border-violet" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex md:hidden flex-col items-stretch">
        {nodes.map((node, i) => (
          <div key={node} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="panel px-4 py-3 text-center w-full"
            >
              <span className="font-mono text-[10px] tracking-[0.15em] text-ink2">{node}</span>
            </motion.div>
            {i < nodes.length - 1 && (
              <div className="relative h-6 w-px bg-violet/60">
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-[135deg] border-t border-r border-violet" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
