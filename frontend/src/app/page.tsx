"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Scale,
  Shield,
  Upload,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { RiskGauge } from "@/components/marketing/risk-gauge";
import { ROUTES } from "@/lib/constants";

const features = [
  {
    icon: Upload,
    title: "Upload Any Legal Doc",
    desc: "Drop in copyright strikes, eviction notices, employment disputes, NDAs, or any formal legal letter — our AI reads it instantly.",
  },
  {
    icon: FileText,
    title: "Plain-Language Summary",
    desc: "We strip away the legal jargon and give you a clear, human summary of exactly what the document says and what it means for you.",
  },
  {
    icon: MessageSquare,
    title: "AI-Crafted Reply",
    desc: "Get a professionally-worded response letter tailored to your situation — ready to send or customise in seconds.",
  },
  {
    icon: Shield,
    title: "Risk & Severity Score",
    desc: "Every clause is rated for risk. A visual severity score shows you exactly where danger lies so you can act with confidence.",
  },
  {
    icon: MessageSquare,
    title: "Context-Aware Legal Chat",
    desc: "Continue the conversation after analysis. Our AI knows your document and gives on-point, context-aware guidance.",
  },
  {
    icon: Clock,
    title: "Full Case History",
    desc: "All your previous documents and chats are saved. Revisit any past case or track how a situation evolved.",
  },
];

const steps = [
  { num: "01", label: "Upload your document", sub: "PDF, DOCX, or plain text" },
  { num: "02", label: "AI analyses in seconds", sub: "Summary, risks, and missing context" },
  { num: "03", label: "Read your action plan", sub: "Reply letter + severity score" },
  { num: "04", label: "Chat for deeper advice", sub: "Context-aware AI legal assistant" },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const primaryHref = session ? ROUTES.upload : ROUTES.signup;
  const primaryLabel = session ? "Upload Document" : "Analyse My Document";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background selection:bg-primary selection:text-primary-foreground">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative px-6 pb-20 pt-32 lg:pb-28 lg:pt-44">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Free AI Legal Advice — No Lawyers Needed
            </div>

            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Understand Any <br />
              Legal Letter in <br />
              <span className="font-serif italic text-primary">Seconds.</span>
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Got a copyright strike, eviction notice, or threatening formal letter? Upload it and LiveLegal AI
              instantly gives you a plain-language summary, a severity score, and a ready-to-send reply — all free.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={primaryHref}
                className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
              >
                {primaryLabel} <ArrowRight size={18} />
              </Link>
              {!session && (
                <Link
                  href={ROUTES.login}
                  className="flex items-center gap-2 rounded-full border border-border px-8 py-4 font-bold text-foreground transition-colors hover:bg-muted/50"
                >
                  Sign In
                </Link>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              {["No sign-up required to preview", "100% free AI legal advice", "Private & encrypted"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-risk-low" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">How LiveLegal AI Works</h2>
          <p className="mx-auto mb-14 max-w-2xl text-muted-foreground">
            Four steps from confusion to clarity — no legal degree required.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-border bg-card p-7 text-left shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="mb-4 font-serif text-4xl font-black text-primary/25">{s.num}</div>
                <p className="mb-1 font-semibold text-foreground">{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
              Everything You Need to <span className="font-light italic text-primary">Fight Back</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Legal documents are designed to confuse. We level the playing field.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="rounded-[28px] border border-border bg-card p-7 shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <f.icon size={22} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk visualisation */}
      <section id="analysis" className="border-y border-border px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-14">
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">Instant Severity Analysis</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Every document gets a risk profile — so you know at a glance whether to stay calm or act fast.
            </p>
          </div>

          <div className="mb-14 flex flex-col items-center justify-center gap-10 md:flex-row md:gap-20">
            <RiskGauge value={76} label="Safe Clauses" colorClass="text-risk-low" delay={0} />
            <RiskGauge value={18} label="Moderate Risks" colorClass="text-risk-moderate" delay={0.15} />
            <RiskGauge value={6} label="Critical Flags" colorClass="text-destructive" delay={0.3} />
          </div>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto flex h-3 max-w-2xl origin-left overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full bg-risk-low" style={{ width: "76%" }} />
            <div className="h-full bg-risk-moderate" style={{ width: "18%" }} />
            <div className="h-full bg-destructive" style={{ width: "6%" }} />
          </motion.div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <BarChart2 size={12} /> Example severity breakdown from a real document analysis
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 font-serif text-4xl font-bold text-foreground">
            Got a legal letter? <br />
            <span className="text-primary">Let AI handle it first.</span>
          </h2>
          <p className="mb-10 text-muted-foreground">
            Understand exactly what you&apos;re facing, get a reply, and chat with our AI for as long as you need —
            completely free.
          </p>
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            {session ? "Upload a Document" : "Start for Free"} <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-primary" />
            <span className="font-serif font-bold text-foreground">LiveLegal AI</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Democratising legal access with AI. Built for everyone, not just those who can afford a lawyer.
          </p>
        </div>
      </footer>
    </div>
  );
}
