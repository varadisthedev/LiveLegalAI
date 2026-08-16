"use client";

import { motion } from "framer-motion";

export function RiskGauge({
  value,
  label,
  colorClass,
  delay,
}: {
  value: number;
  label: string;
  colorClass: string;
  delay: number;
}) {
  const dashArray = 283;
  const dashOffset = dashArray - (dashArray * value) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={colorClass}
            stroke="currentColor"
            initial={{ strokeDashoffset: dashArray }}
            whileInView={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{ strokeDasharray: dashArray }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-xl font-bold text-foreground">{value}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
    </motion.div>
  );
}
