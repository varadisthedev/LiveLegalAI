import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, HelpCircle, Lock, Server, CheckSquare, ArrowRight } from 'lucide-react';

export default function Verify() {
  const [code, setCode] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) return;

    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);

    // Auto focus next
    if (val && idx < 5) {
      inputRefs.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1].focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A] text-gray-900 dark:text-gray-200 flex flex-col font-sans selection:bg-blue-500/30 transition-colors duration-200">
      
      {/* Top Header */}
      <header className="absolute top-0 w-full px-6 sm:px-8 py-6 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-700 dark:from-[#1C36A4] dark:to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
               <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM16 11V13H8V11H16ZM16 15V17H8V15H16Z" />
             </svg>
          </div>
          <span className="text-gray-900 dark:text-white font-bold leading-tight text-lg tracking-wide hidden sm:block">LegalDoc Advisor</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-500 text-xs font-bold tracking-wider">
            <Lock size={12} /> END-TO-END ENCRYPTED
          </div>
          <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#1F2937] text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#151822] transition-colors flex items-center justify-center">
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 mt-16 sm:mt-0 relative z-0">
        
        {/* Verification Card */}
        <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 sm:p-10 w-full max-w-md shadow-sm dark:shadow-soft dark:shadow-blue-900/5 hover:border-gray-300 dark:hover:border-[#2A3143] transition-colors text-center relative pointer-events-auto">
          
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6 mx-auto">
            <Shield size={24} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Verify your identity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 px-2 sm:px-4">
            We've sent a 6-digit verification code to <br className="hidden sm:block" />
            <span className="font-semibold text-gray-900 dark:text-gray-200">m***n@company.com</span>. Please enter it below to proceed safely.
          </p>

          <div className="flex justify-between gap-1 sm:gap-2 mb-8">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => inputRefs.current[idx] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-10 h-12 sm:w-12 sm:h-14 bg-gray-50 dark:bg-[#0F111A] border border-gray-200 dark:border-[#1F2937] rounded-lg text-center text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
              />
            ))}
          </div>

          <Link to="/dashboard" className="flex items-center justify-center gap-2 w-full bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-3.5 rounded-lg text-sm transition-colors shadow-md dark:shadow-lg dark:shadow-blue-900/40 mb-8 border border-transparent dark:border-[#3b82f6]/20">
            Verify & Continue <ArrowRight size={16} />
          </Link>

          <div className="w-full h-px bg-gray-200 dark:bg-[#1F2937] mb-6" />

          <p className="text-sm text-gray-500 mb-3 font-medium">
            Didn't receive the code? <button className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none transition-colors ml-1">Resend</button>
          </p>
          <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors border-b border-transparent hover:border-gray-500 bg-transparent">
            Use another verification method
          </button>
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
        <p className="text-xs text-gray-500 dark:text-gray-600 font-medium tracking-wide">
          © 2024 LegalDoc Advisor. All rights reserved. Professional Legal Security Infrastructure.
        </p>
      </footer>
    </div>
  );
}
