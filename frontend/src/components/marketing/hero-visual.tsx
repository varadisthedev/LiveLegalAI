"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, FileText, Sparkles } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="rounded-3xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Eviction_Notice.pdf</span>
          </div>
          <span className="rounded-full bg-risk-moderate/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-risk-moderate">
            Moderate Risk
          </span>
        </div>

        <div className="mb-5 flex items-center gap-4">
          <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-8 border-muted">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-risk-moderate" strokeDasharray="264" strokeDashoffset="95" strokeLinecap="round" />
            </svg>
            <span className="font-serif text-xl font-bold text-foreground">64</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
            <div className="h-2 w-2/3 rounded-full bg-muted">
              <div className="h-full w-1/2 rounded-full bg-risk-moderate" />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 rounded-xl border border-risk-moderate/20 bg-risk-moderate/5 p-3">
            <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-risk-moderate" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              10-day notice period is shorter than typical statutory minimums.
            </p>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl border border-risk-low/20 bg-risk-low/5 p-3">
            <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-risk-low" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Reply letter drafted — ready to review and send.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="absolute -right-6 -top-6 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg"
      >
        <Sparkles size={16} className="text-primary" />
        <div>
          <p className="text-xs font-bold text-foreground">Analyzed in 18s</p>
          <p className="text-[10px] text-muted-foreground">AI-powered review</p>
        </div>
      </motion.div>
    </div>
  );
}
