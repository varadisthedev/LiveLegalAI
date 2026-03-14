import { ChevronRight, Share2, Download, RefreshCw, AlertTriangle, AlertCircle, Info, Copy, Edit2, Zap, FileText, FileSearch, ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import ChatWidget from '../components/ChatWidget';

export default function DocumentAnalysis() {
  return (
    <AppLayout>
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-200 dark:border-[#1F2937] pb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <span className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Documents</span>
          <ChevronRight size={14} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
          <span className="text-blue-600 dark:text-blue-500 truncate">Employment_Contract_V2.pdf</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1A1D27] transition-colors whitespace-nowrap">
            <Share2 size={16} /> Share
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm sm:shadow-lg transition-colors whitespace-nowrap">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight break-all">Employment_Contract_V2.pdf</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Analyzed on Oct 24, 2023 <span className="mx-1 sm:mx-2 text-gray-300 dark:text-gray-600">•</span> 14 pages <span className="mx-1 sm:mx-2 text-gray-300 dark:text-gray-600">•</span> Legal Classification: Employment Agreement
          </p>
        </div>
        <button className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto justify-center">
          <RefreshCw size={14} /> Re-analyze Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Severity Risk Score */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Severity Risk Score</h3>
            
            <div className="flex justify-center mb-8 relative">
              {/* Donut Chart Visualization */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 sm:border-[12px] border-gray-100 dark:border-[#1F2937] relative flex items-center justify-center">
                {/* Simulated arc for 78% score */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="276" strokeDashoffset="60" strokeLinecap="round" transform="rotate(-90 50 50)" className="text-blue-600 dark:text-[#1C36A4]" />
                </svg>
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">78<span className="text-base sm:text-lg text-gray-400 dark:text-gray-500">/100</span></span>
                  <p className="text-[10px] font-bold text-red-600 dark:text-red-500 tracking-wider uppercase mt-1">High Risk</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Non-compete impact</span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-500">Significant</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-[#1A1D27] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Liability exposure</span>
                  <span className="text-xs font-bold text-amber-500">Moderate</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-[#1A1D27] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[60%]" />
                </div>
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={18} className="text-blue-600 dark:text-blue-500" />
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide">AI Executive Summary</h3>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              This agreement is a standard <span className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer border-b border-blue-200 dark:border-blue-400/30">Full-Time Employment Contract</span> for a Senior Executive position. While most clauses align with industry standards, the document is heavily weighted in favor of the employer regarding intellectual property and post-termination restrictions.
            </div>

            <ul className="space-y-4 mb-6 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 marker:text-blue-500 flex-1">
              <li className="pl-1 leading-relaxed">Compensation package includes a base salary of $185k with a 15% discretionary bonus target.</li>
              <li className="pl-1 leading-relaxed">The 'Governing Law' is Delaware, which has strict precedents for executive agreements.</li>
              <li className="pl-1 leading-relaxed">Indemnification clauses are narrow, potentially leaving the employee liable for specific operational decisions.</li>
            </ul>

            <div className="bg-blue-50 dark:bg-[#1A1D27] border border-blue-100 dark:border-[#2A3143] rounded-lg p-4 flex gap-3 text-xs text-gray-700 dark:text-gray-400 leading-relaxed max-w-full">
              <FileSearch size={16} className="text-blue-500 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="min-w-0"><span className="font-semibold text-gray-900 dark:text-gray-300">AI Advice:</span> Consider negotiating Section 12.4 to reduce non-compete duration to 6 months.</p>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Critical Issues Found */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
              <h3 className="text-xs sm:text-[15px] font-bold text-gray-500 dark:text-gray-400 uppercase sm:normal-case tracking-widest sm:tracking-wide">Critical Issues Found</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 px-3 py-1 rounded border border-red-200 dark:border-red-500/20 self-start sm:self-auto inline-flex items-center">
                4 Action Required
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50/50 dark:bg-[#1A1D27] border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 hover:border-red-300 dark:hover:border-red-500/40 transition-colors">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white mb-1 tracking-wide">Broad Non-Compete Clause</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Section 12.4 defines a 24-month restriction across all of North America, which may be unenforceable but highly restrictive.</p>
                </div>
              </div>
              
              <div className="bg-amber-50/50 dark:bg-[#1A1D27] border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors">
                <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white mb-1 tracking-wide">Intellectual Property Assignment</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Section 8.2 claims ownership of all prior inventions created before employment unless specifically listed in Appendix A.</p>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-[#1A1D27] border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors">
                <Info size={20} className="text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white mb-1 tracking-wide">Termination Notice Period</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Standard 2-week notice period found, but immediate dismissal for 'cause' is broadly defined in Section 15.3.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Negotiation Reply */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={18} className="text-blue-600 dark:text-blue-500" />
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide">Suggested Negotiation Reply</h3>
            </div>

            <div className="bg-gray-50 dark:bg-[#0F111A] border border-gray-200 dark:border-[#1F2937] rounded-xl p-4 sm:p-5 flex-1 flex flex-col font-mono text-sm group relative">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-3 border-b border-gray-200 dark:border-[#1F2937] gap-3">
                 <p className="text-xs text-gray-500 font-sans tracking-wide">"Copy this template to your email response"</p>
                 <div className="flex gap-4 sm:gap-3 text-gray-500 self-end sm:self-auto">
                    <Copy size={16} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
                    <Edit2 size={16} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
                 </div>
              </div>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed font-mono text-xs sm:text-[13px] flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-4 max-h-[400px]">
                <p>Dear HR Team,</p>
                <p>Thank you for sharing the draft agreement. I have reviewed the terms and would like to discuss two specific points to align them with current market standards for this role:</p>
                <p>1. <span className="text-blue-600 dark:text-blue-400">Section 12.4 (Non-Compete):</span> The current 24-month window is quite extensive. I would request modifying this to a 12-month period, which remains protective of the company while allowing for career progression.</p>
                <p>2. <span className="text-blue-600 dark:text-blue-400">Section 8.2 (Prior Inventions):</span> I'd like to clarify that any intellectual property developed independently prior to my start date remains my sole property. Can we update Appendix A together?</p>
                <p>I look forward to finalizing this partnership.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1F2937] flex justify-center sm:justify-end">
                 <button className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto">
                   <RefreshCw size={14} /> Rewrite with Different Tone
                 </button>
              </div>
            </div>
          </div>

        </div>
        
        {/* Full width element - Live Preview */}
        <div className="lg:col-span-12 mt-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide">Live Document Preview</h3>
                <div className="flex gap-2">
                   <button className="w-8 h-8 rounded bg-gray-100 dark:bg-[#1F2937] text-gray-700 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                     <span className="text-lg leading-none mb-1">+</span>
                   </button>
                   <button className="w-8 h-8 rounded bg-gray-100 dark:bg-[#1F2937] text-gray-700 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg font-bold">
                     -
                   </button>
                </div>
            </div>
            {/* The actual viewer area */}
            <div className="w-full h-80 bg-gray-50 dark:bg-[#0F111A] border border-gray-200 dark:border-[#1F2937] rounded-xl rounded-tl-none relative overflow-hidden flex items-center justify-center group">
               {/* Pattern overlay representing PDF */}
               <div className="absolute inset-4 border border-gray-300 dark:border-[#1F2937] border-dashed rounded bg-white dark:bg-[#151822] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <FileText size={32} className="mb-3 opacity-50" />
                  <p className="text-xs font-bold tracking-widest uppercase opacity-50 text-center px-4">Interactive PDF View Mode</p>
               </div>
            </div>
        </div>
        
        <ChatWidget documentName="Employment_Contract_V2.pdf" />

      </div>
    </AppLayout>
  );
}
