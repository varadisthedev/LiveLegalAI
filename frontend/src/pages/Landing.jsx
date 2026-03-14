import { Link } from 'react-router-dom';
import { Scale, ArrowRight, Shield, Zap, FileSearch, MessageSquare, CheckCircle, ChevronRight } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

const features = [
  {
    icon: FileSearch,
    title: 'Instant Analysis',
    desc: 'Upload any legal document and receive a comprehensive analysis in seconds powered by advanced AI.',
  },
  {
    icon: Shield,
    title: 'Risk Detection',
    desc: 'Automatically identify high-risk clauses, unfavorable terms, and potential legal liabilities.',
  },
  {
    icon: MessageSquare,
    title: 'Chat with Docs',
    desc: 'Ask plain-English questions about your documents and get clear, accurate answers instantly.',
  },
  {
    icon: Zap,
    title: 'Key Clause Extraction',
    desc: 'Automatically highlight and summarize the most important clauses in any legal agreement.',
  },
];

const stats = [
  { value: '50K+', label: 'Documents Analyzed' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '< 30s', label: 'Analysis Time' },
  { value: '10K+', label: 'Happy Users' },
];

const testimonials = [
  {
    quote: "LegalDoc AI saved us hours reviewing vendor contracts. The risk flagging is incredibly accurate.",
    name: "Sarah Chen",
    role: "General Counsel, TechStartup Inc.",
    initials: "SC",
  },
  {
    quote: "Finally I can understand lease agreements without paying $500/hr for a lawyer. Game changer.",
    name: "Michael Torres",
    role: "Small Business Owner",
    initials: "MT",
  },
  {
    quote: "The chat feature is outstanding. I asked about every clause and got clear explanations instantly.",
    name: "Priya Sharma",
    role: "Freelance Consultant",
    initials: "PS",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Scale size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">LegalDoc <span className="text-blue-600">AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <SignedOut>
              <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">Sign In</Link>
              <Link
                to="/signup"
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-xl shadow-md"
                id="landing-get-started-top"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-xl shadow-md"
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-blue-50/60 via-white to-white relative overflow-hidden">
        {/* BG Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-20 -z-10" />

        <div className="max-w-3xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            AI-Powered Legal Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Upload Legal Documents &<br />
            <span className="text-blue-600">Understand Them Instantly</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            LegalDoc AI analyzes contracts, leases, NDAs, and more — extracting key clauses, flagging risks, and explaining everything in plain language.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <SignedOut>
              <Link
                to="/signup"
                id="landing-get-started-hero"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-base"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                id="landing-get-started-hero"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-base"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            </SignedIn>
            
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium px-6 py-3.5 rounded-xl shadow-card hover:shadow-soft transition-all duration-200 text-base"
            >
              View Demo
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8">
            {['No credit card required', 'Free forever plan', 'Secure & private'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-gray-500">
                <CheckCircle size={14} className="text-green-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Card Preview */}
        <div className="max-w-4xl mx-auto mt-16 px-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-amber-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
              <span className="ml-3 text-xs text-gray-400 font-mono">LegalDoc AI — Document Analysis</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileSearch size={16} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">Document Summary</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Standard NDA between two parties covering confidential information for a period of 3 years...</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">Risk Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-amber-700">Medium Risk</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">2 clauses require attention</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Key Clauses</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-green-400" /> Confidentiality Obligation</li>
                  <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-green-400" /> Termination Conditions</li>
                  <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-green-400" /> Remedies Clause</li>
                </ul>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">Chat with Doc</span>
                </div>
                <p className="text-xs text-gray-400 italic mb-2">"What is the most risky clause?"</p>
                <p className="text-xs text-gray-600 leading-relaxed">The penalty clause poses the highest risk — it limits your ability to seek full damages...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{value}</p>
                <p className="text-sm text-blue-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything you need to understand legal documents</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Powerful AI tools that make legal language accessible to everyone.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card hover:shadow-soft transition-all duration-200 group">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Trusted by thousands</h2>
            <p className="text-gray-500">See what our users are saying about LegalDoc AI.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, initials }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-xs">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start understanding your legal documents today</h2>
          <p className="text-blue-100 text-lg mb-8">Join over 10,000 users who save time and money with LegalDoc AI.</p>
          <SignedOut>
            <Link
              to="/signup"
              id="landing-cta-bottom"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-700 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-base"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              to="/dashboard"
              id="landing-cta-bottom"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-700 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-base"
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scale size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">LegalDoc <span className="text-blue-400">AI</span></span>
          </div>
          <p className="text-sm text-gray-500">© 2026 LegalDoc AI. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <a key={link} href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
