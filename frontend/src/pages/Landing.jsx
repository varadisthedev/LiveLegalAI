import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Scale, Shield, FileSearch, MessageSquare, ArrowRight, Github } from 'lucide-react';
import HeroLegalScanner3D from '../components/HeroLegalScanner3D';

const features = [
  {
    icon: FileSearch,
    title: 'AI Legal Explanation',
    desc: 'Instantly summarize complex legal jargon into plain, understandable English.',
  },
  {
    icon: Shield,
    title: 'Risk Severity Analysis',
    desc: 'Automatically flag high-risk clauses and potential legal liabilities before you sign.',
  },
  {
    icon: MessageSquare,
    title: 'Suggested Legal Response',
    desc: 'Generate ready-to-use replies and negotiation counter-offers instantly.',
  },
];

const RiskGauge = ({ value, label, color, delay }) => {
  const dashArray = 283; // 2 * pi * r (r=45)
  const dashOffset = dashArray - (dashArray * value) / 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="flex flex-col items-center"
    >
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1C2541" strokeWidth="8" />
          <motion.circle 
            cx="50" cy="50" r="45" fill="none" 
            stroke={color} strokeWidth="8" strokeLinecap="round"
            initial={{ strokeDashoffset: dashArray }}
            whileInView={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            style={{ strokeDasharray: dashArray }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-[#EAEAEA]">{value}%</span>
        </div>
      </div>
      <h4 className="text-[#EAEAEA] font-semibold tracking-wide">{label}</h4>
    </motion.div>
  );
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B132B] font-sans selection:bg-[#3A86FF] selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0B132B]/80 backdrop-blur-md border-b border-[#1C2541]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3A86FF]/10 rounded-xl flex items-center justify-center border border-[#3A86FF]/30 shadow-[0_0_15px_rgba(58,134,255,0.2)]">
              <Scale size={20} className="text-[#5BC0EB]" />
            </div>
            <span className="text-xl font-bold tracking-wide text-[#EAEAEA]">
              LegalDoc <span className="text-[#3A86FF] drop-shadow-[0_0_8px_rgba(58,134,255,0.4)]">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#EAEAEA]/80">
            <a href="#features" className="hover:text-[#5BC0EB] transition-colors">Features</a>
            <a href="#analysis" className="hover:text-[#5BC0EB] transition-colors">Technology</a>
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <Link to="/login" className="text-sm font-medium text-[#EAEAEA]/80 hover:text-[#5BC0EB] transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-bold text-white bg-[#3A86FF] hover:bg-[#5BC0EB] transition-colors px-6 py-2.5 rounded-lg shadow-[0_0_20px_rgba(58,134,255,0.3)] hover:shadow-[0_0_25px_rgba(91,192,235,0.5)]"
                >
                  Get Started
                </motion.button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-bold text-white bg-[#3A86FF] hover:bg-[#5BC0EB] transition-colors px-6 py-2.5 rounded-lg shadow-[0_0_20px_rgba(58,134,255,0.3)]"
                >
                  Dashboard
                </motion.button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#3A86FF]/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#5BC0EB]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 bg-[#1C2541] border border-[#3A86FF]/30 text-[#5BC0EB] text-xs font-bold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#5BC0EB] rounded-full animate-pulse shadow-[0_0_8px_#5BC0EB]" />
              Secure Legal Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-[#EAEAEA] leading-tight tracking-tight mb-6">
              Understand Legal Documents <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3A86FF] to-[#5BC0EB] drop-shadow-lg">
                Instantly.
              </span>
            </h1>

            <p className="text-lg text-[#EAEAEA]/70 leading-relaxed mb-10 max-w-xl">
              Upload legal notices and get AI-powered explanations, risk analysis, and response guidance. Keep your business and personal life protected without exorbitant legal fees.
            </p>

            <SignedOut>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-[#3A86FF] to-[#5BC0EB] text-white font-bold px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(58,134,255,0.4)] transition-all"
                >
                  Analyze a Document <ArrowRight size={20} />
                </motion.button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/upload">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-[#3A86FF] to-[#5BC0EB] text-white font-bold px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(58,134,255,0.4)] transition-all"
                >
                  Analyze a Document <ArrowRight size={20} />
                </motion.button>
              </Link>
            </SignedIn>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden border border-[#1C2541]/50 bg-[#0B132B]/50 shadow-[inset_0_0_50px_rgba(28,37,65,0.5)]"
          >
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[#3A86FF] animate-pulse">Initializing Neural Engine...</div>}>
              <HeroLegalScanner3D />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#1C2541]/40 border-y border-[#1C2541]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#EAEAEA] mb-4">Precision Legal Tech</h2>
            <p className="text-[#EAEAEA]/60 max-w-2xl mx-auto">Equip yourself with tools historically reserved for large legal firms.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-[#0B132B] border border-[#1C2541] rounded-2xl p-8 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3A86FF] to-[#5BC0EB] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <div className="w-14 h-14 bg-[#1C2541] rounded-xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(58,134,255,0.3)] transition-all">
                  <feature.icon size={28} className="text-[#5BC0EB]" />
                </div>
                <h3 className="text-xl font-bold text-[#EAEAEA] mb-3 group-hover:text-[#5BC0EB] transition-colors">{feature.title}</h3>
                <p className="text-[#EAEAEA]/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Visualization Section */}
      <section id="analysis" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-[#3A86FF]/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl font-extrabold text-[#EAEAEA] mb-4">Real-Time Risk Profiling</h2>
            <p className="text-[#EAEAEA]/60 max-w-2xl mx-auto">Our AI engines instantly quantify your legal exposure across hundreds of clause typologies.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
            <RiskGauge value={85} label="Safe Elements" color="#10B981" delay={0} />
            <RiskGauge value={12} label="Moderate Risks" color="#F59E0B" delay={0.2} />
            <RiskGauge value={3}  label="Critical Risks" color="#EF4444" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#040814] py-12 px-6 border-t border-[#1C2541]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Scale size={18} className="text-[#5BC0EB]" />
            <span className="font-bold text-[#EAEAEA] tracking-wide">LegalDoc AI</span>
          </div>
          
          <p className="text-[#EAEAEA]/40 text-sm">
            Built for the modern legal-tech era. LiveLegal AI Hackathon Submission.
          </p>

          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#EAEAEA]/60 hover:text-[#EAEAEA] transition-colors">
            <Github size={20} />
          </a>
        </div>
      </footer>
    </div>
  );
}
