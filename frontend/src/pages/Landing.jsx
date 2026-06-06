import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import {
  Upload, Shield, MessageSquare, Clock, BarChart2,
  ArrowRight, Github, Sparkles, FileText, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import HeroLegalScanner3D from '../components/HeroLegalScanner3D';

const features = [
  {
    icon: Upload,
    title: 'Upload Any Legal Doc',
    desc: 'Drop in copyright strikes, eviction notices, employment disputes, NDAs, or any formal legal letter — our AI reads it instantly.',
    color: '#9333ea',
  },
  {
    icon: FileText,
    title: 'Plain-Language Summary',
    desc: 'We strip away the legal jargon and give you a clear, human summary of exactly what the document says and what it means for you.',
    color: '#3A86FF',
  },
  {
    icon: MessageSquare,
    title: 'AI-Crafted Reply',
    desc: 'Get a professionally-worded response letter tailored to your situation — ready to send or customise in seconds.',
    color: '#10B981',
  },
  {
    icon: Shield,
    title: 'Risk & Severity Score',
    desc: 'Every clause is rated for risk. A visual severity graph shows you exactly where danger lies so you can act with confidence.',
    color: '#f59e0b',
  },
  {
    icon: MessageSquare,
    title: 'Sharp AI Legal Chatbot',
    desc: 'Continue the conversation after analysis. Our AI knows your case history and gives on-point, context-aware legal guidance.',
    color: '#ec4899',
  },
  {
    icon: Clock,
    title: 'Full Case History',
    desc: 'All your previous documents and chats are saved. Revisit any past case, continue a conversation, or track how a situation evolved.',
    color: '#5BC0EB',
  },
];

const steps = [
  { num: '01', label: 'Upload your document', sub: 'PDF, image scan, or paste text' },
  { num: '02', label: 'AI analyses in seconds', sub: 'Summary, risks, and missing context' },
  { num: '03', label: 'Read your action plan', sub: 'Reply letter + severity score graph' },
  { num: '04', label: 'Chat for deeper advice', sub: 'Context-aware AI legal assistant' },
];

const RiskGauge = ({ value, label, color, delay }) => {
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
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1D1231" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            initial={{ strokeDashoffset: dashArray }}
            whileInView={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: 'easeOut' }}
            style={{ strokeDasharray: dashArray }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-[#a78bfa]">{label}</span>
    </motion.div>
  );
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#07020d] font-sans selection:bg-[#7c3aed] selection:text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#07020d]/80 backdrop-blur-md border-b border-[#2d1b4e]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full grid place-items-center bg-[#7c3aed]/10 border border-[#7c3aed]/30">
              <Sparkles size={18} className="text-[#c4b5fd]" />
            </div>
            <span className="text-xl font-bold text-white">
              LiveLegal <span className="text-[#9333ea]">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#c4b5fd]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how"      className="hover:text-white transition-colors">How it works</a>
            <a href="#analysis" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <Link to="/login" className="text-sm text-[#c4b5fd] hover:text-white transition-colors">Sign In</Link>
              <Link to="/signup">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="text-sm font-bold text-white bg-gradient-to-r from-[#7c3aed] to-[#9333ea] px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all">
                  Get Started Free
                </motion.button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="text-sm font-bold text-white bg-gradient-to-r from-[#7c3aed] to-[#9333ea] px-6 py-2.5 rounded-full">
                  Dashboard
                </motion.button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7c3aed]/15 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-[#a855f7]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-[#1b0b30] border border-[#3e1a72] text-[#c4b5fd] text-xs font-bold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#9333ea] animate-pulse" />
              Free AI Legal Advice — No Lawyers Needed
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Understand Any <br />
              Legal Letter in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9333ea] to-[#d8b4fe] italic pr-2">
                Seconds.
              </span>
            </h1>

            <p className="text-lg text-[#a78bfa] leading-relaxed mb-10 max-w-xl">
              Got a copyright strike, eviction notice, or threatening formal letter?
              Upload it and LiveLegal AI instantly gives you a plain-language summary,
              a severity score, and a ready-to-send reply — all free.
            </p>

            <div className="flex flex-wrap gap-4">
              <SignedOut>
                <Link to="/signup">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:to-[#a855f7] text-white font-bold px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(124,58,237,0.4)] transition-all">
                    Analyse My Document <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/upload">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white font-bold px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(124,58,237,0.4)] transition-all">
                    Upload Document <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </SignedIn>
              <Link to="/login">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-transparent border border-[#3e1a72] text-[#c4b5fd] font-bold px-8 py-4 rounded-full hover:bg-[#1b0b30] transition-all">
                  Sign In
                </motion.button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-8 text-sm text-[#a78bfa]">
              {['No sign-up required to preview', '100% free AI legal advice', 'Private & encrypted'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#10B981]" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 3D */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
            className="relative w-full aspect-square lg:aspect-auto lg:h-[580px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md bg-gradient-to-r from-[#7c3aed]/15 to-[#d8b4fe]/5 blur-3xl rounded-full" />
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[#9333ea] animate-pulse">Loading AI Engine...</div>}>
              <HeroLegalScanner3D />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20 border-y border-[#1e1030]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold text-white mb-4">How LiveLegal AI Works</h2>
            <p className="text-[#a78bfa] mb-14 max-w-2xl mx-auto">Four steps from confusion to clarity — no legal degree required.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.num}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 }} viewport={{ once: true }}
                className="bg-gradient-to-b from-[#160a26] to-[#0d0517] border border-[#2d1b4e] rounded-3xl p-7 text-left hover:border-[#7c3aed]/50 transition-all duration-300 group">
                <div className="text-4xl font-black text-[#3e1a72] group-hover:text-[#7c3aed] transition-colors mb-4">{s.num}</div>
                <p className="text-white font-semibold mb-1">{s.label}</p>
                <p className="text-sm text-[#a78bfa]">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Everything You Need to <span className="text-[#a855f7] italic font-light">Fight Back</span>
            </h2>
            <p className="text-[#a78bfa] max-w-2xl mx-auto">
              Legal documents are designed to confuse. We level the playing field.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }} viewport={{ once: true }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-gradient-to-b from-[#160a26] to-[#0d0517] border border-[#2d1b4e] rounded-[28px] p-7 group hover:border-[#7c3aed]/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl grid place-items-center mb-5 transition-all"
                  style={{ background: `${f.color}18`, boxShadow: `0 0 0 1px ${f.color}30` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[#a78bfa] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk Visualisation ── */}
      <section id="analysis" className="py-24 px-6 border-y border-[#1e1030] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#7c3aed]/5 rounded-full blur-[80px] -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-14">
            <h2 className="text-3xl font-extrabold text-white mb-4">Instant Severity Analysis</h2>
            <p className="text-[#a78bfa] max-w-xl mx-auto">
              Every document gets a risk profile — so you know at a glance whether to stay calm or act fast.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 mb-14">
            <RiskGauge value={76} label="Safe Clauses"     color="#10B981" delay={0}   />
            <RiskGauge value={18} label="Moderate Risks"   color="#f59e0b" delay={0.2} />
            <RiskGauge value={6}  label="Critical Flags"   color="#ef4444" delay={0.4} />
          </div>

          {/* Mini severity bar */}
          <motion.div initial={{ opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }} viewport={{ once: true }}
            className="origin-left max-w-2xl mx-auto rounded-full overflow-hidden h-3 bg-[#1e1030] flex">
            <div className="bg-[#10B981] h-full" style={{ width: '76%' }} />
            <div className="bg-[#f59e0b] h-full" style={{ width: '18%' }} />
            <div className="bg-[#ef4444] h-full" style={{ width: '6%'  }} />
          </motion.div>
          <p className="text-[#a78bfa] text-xs mt-3">Example severity bar from a real document analysis</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-[#1b0b30] border border-[#3e1a72] text-[#c4b5fd] text-xs font-bold px-4 py-2 rounded-full mb-6">
              <AlertTriangle size={12} className="text-[#f59e0b]" />  No lawyers. No fees. No jargon.
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-6">
              Got a legal letter?<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9333ea] to-[#d8b4fe]">
                Let AI handle it first.
              </span>
            </h2>
            <p className="text-[#a78bfa] mb-10">
              Understand exactly what you're facing, get a reply, and chat with our AI for as long as you need — completely free.
            </p>
            <SignedOut>
              <Link to="/signup">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:to-[#a855f7] text-white font-bold px-10 py-4 rounded-full shadow-[0_10px_40px_rgba(124,58,237,0.4)] transition-all text-lg">
                  Start for Free <ArrowRight size={20} />
                </motion.button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/upload">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white font-bold px-10 py-4 rounded-full shadow-[0_10px_40px_rgba(124,58,237,0.4)] transition-all text-lg">
                  Upload a Document <ArrowRight size={20} />
                </motion.button>
              </Link>
            </SignedIn>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#04010a] py-10 px-6 border-t border-[#1e1030]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#c4b5fd]" />
            <span className="font-bold text-white">LiveLegal AI</span>
          </div>
          <p className="text-[#a78bfa] text-sm text-center">
            Democratising legal access with AI. Built for everyone, not just those who can afford a lawyer.
          </p>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#a78bfa] hover:text-white transition-colors">
            <Github size={20} />
          </a>
        </div>
      </footer>
    </div>
  );
}
