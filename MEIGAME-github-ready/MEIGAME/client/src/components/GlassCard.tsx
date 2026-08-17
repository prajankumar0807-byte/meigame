import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function GlassCard({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <motion.div whileHover={{ y: -3, rotateX: 0.5 }} transition={{ duration: 0.18 }} onClick={onClick} className={`glass-card ${className}`}>{children}</motion.div>;
}
