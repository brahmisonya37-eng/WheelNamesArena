import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.61, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
