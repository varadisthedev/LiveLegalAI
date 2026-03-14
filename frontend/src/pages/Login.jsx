import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Server, CheckSquare, ArrowRight, UserCheck, Eye, EyeOff } from 'lucide-react';
import PasswordValidator, { usePasswordValid } from '../components/PasswordValidator';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isPasswordValid = usePasswordValid(form.password);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard'); // Login -> dashboard
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-gray-200 flex flex-col font-sans selection:bg-blue-500/30">
      
      {/* Top Header */}
      <header className="absolute top-0 w-full px-8 py-6 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#1C36A4] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
               <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM16 11V13H8V11H16ZM16 15V17H8V15H16Z" />
             </svg>
          </div>
          <span className="text-white font-bold leading-tight text-lg tracking-wide">LegalDoc Advisor</span>
        </Link>
        <div className="flex items-center gap-4 hidden sm:flex">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold tracking-wider">
            <Lock size={12} /> ENTERPRISE SECURITY
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-0">
        
        {/* Login Card */}
        <div className="bg-[#151822] border border-[#1F2937] rounded-xl p-8 sm:p-10 w-full max-w-md shadow-soft shadow-blue-900/5 hover:border-[#2A3143] transition-colors relative mt-16 sm:mt-0">
          
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6">
            <UserCheck size={24} />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">
            Sign in to access your legal documents, history, and AI analysis.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="email">Work Email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="alex@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0F111A] border border-[#1F2937] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor="password">Password</label>
                <button type="button" className="text-xs text-blue-500 hover:text-blue-400 font-medium tracking-wide">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#0F111A] border border-[#1F2937] text-white rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordValidator password={form.password} />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isPasswordValid}
                className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-lg text-sm transition-all shadow-lg shadow-blue-900/40 border border-[#3b82f6]/20 ${
                  isPasswordValid
                    ? 'bg-[#1C36A4] hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-700 cursor-not-allowed opacity-60'
                }`}
              >
                Sign In <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#1F2937] text-center">
            <p className="text-sm text-gray-500 font-medium tracking-wide">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-400 focus:outline-none transition-colors ml-1 font-bold">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex gap-4 sm:gap-6 mt-10 opacity-60 flex-wrap justify-center">
           <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              <Shield size={14} /> SECURE SSL
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              <Server size={14} /> AES-256
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              <CheckSquare size={14} /> GDPR READY
           </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 w-full text-center px-4 z-10">
        <p className="text-xs text-gray-600 font-medium tracking-wide">
          © 2024 LegalDoc Advisor. All rights reserved. Professional Legal Security Infrastructure.
        </p>
      </footer>
    </div>
  );
}
