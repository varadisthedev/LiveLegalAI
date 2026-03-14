import { ChevronRight, Share2, Download, RefreshCw, AlertTriangle, AlertCircle, Info, Copy, Edit2, Zap, FileText, FileSearch, ArrowRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import html2canvas from 'html2canvas';
import AppLayout from '../components/AppLayout';

export default function DocumentAnalysis() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const contentRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const analyzeDoc = async () => {
      try {
        const res = await fetch('https://livelegal-backend.up.railway.app/api/chat/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || 'user_12345'
          },
          body: JSON.stringify({ document_id: documentId })
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          setAnalysis(data.data);
        } else {
          setError(data.error || 'Failed to analyze document');
        }
      } catch (err) {
        setError('Error connecting to analysis server');
      } finally {
        setLoading(false);
      }
    };

    if (user && documentId) {
      analyzeDoc();
    }
  }, [user, documentId]);

  const handleDownloadSnapshot = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'Analysis_Snapshot.png';
      link.click();
    } catch (e) {
      console.error('Failed to capture screen:', e);
    }
    setIsDownloading(false);
  };
  return (
    <AppLayout>
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-200 dark:border-[#1F2937] pb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <span onClick={() => navigate('/dashboard')} className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">Documents</span>
          <ChevronRight size={14} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
          <span className="text-blue-600 dark:text-blue-500 truncate">{analysis ? analysis.document_type || 'Document' : 'Loading...'}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button 
            onClick={() => navigate(`/active-chat/${documentId}`)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1A1D27] transition-colors whitespace-nowrap"
          >
            <Zap size={16} /> Chat with Doc
          </button>
          <button 
            onClick={handleDownloadSnapshot}
            disabled={isDownloading}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm sm:shadow-lg transition-colors whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDownloading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            {isDownloading ? 'Snapshotting...' : 'Download Snapshot'}
          </button>
        </div>
      </div>

      {/* Title & Metadata */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Analyzing document...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      ) : analysis ? (
      <div ref={contentRef} className="px-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight break-all">{analysis.document_type || 'Unknown Document Type'}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Analyzed just now <span className="mx-1 sm:mx-2 text-gray-300 dark:text-gray-600">•</span> Legal Classification: {analysis.document_type || 'Contract'}
            </p>
          </div>
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
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="276" strokeDashoffset={276 - (276 * (analysis.severity_score || 0)) / 100} strokeLinecap="round" transform="rotate(-90 50 50)" className={analysis.risk_level === 'High' ? 'text-red-500' : analysis.risk_level === 'Moderate' ? 'text-amber-500' : 'text-blue-600 dark:text-[#1C36A4]'} />
                </svg>
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{analysis.severity_score || 0}<span className="text-base sm:text-lg text-gray-400 dark:text-gray-500">/100</span></span>
                  <p className={`text-[10px] font-bold tracking-wider uppercase mt-1 ${analysis.risk_level === 'High' ? 'text-red-600' : analysis.risk_level === 'Moderate' ? 'text-amber-500' : 'text-green-500'}`}>{analysis.risk_level || 'Unknown'} Risk</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {analysis.risk_factors?.slice(0, 3).map((factor, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate pr-2 max-w-[70%]">{factor.label}</span>
                    <span className={`text-xs font-bold ${factor.points > 25 ? 'text-red-500' : factor.points > 10 ? 'text-amber-500' : 'text-blue-500'}`}>{factor.points} pts</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-[#1A1D27] rounded-full overflow-hidden">
                    <div className={`h-full ${factor.points > 25 ? 'bg-red-500' : factor.points > 10 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(factor.points * 2, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={18} className="text-blue-600 dark:text-blue-500" />
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide">AI Executive Summary</h3>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
              {analysis.summary}
            </div>

            <div className="bg-blue-50 dark:bg-[#1A1D27] border border-blue-100 dark:border-[#2A3143] rounded-lg p-4 flex gap-3 text-xs text-gray-700 dark:text-gray-400 leading-relaxed max-w-full">
              <FileSearch size={16} className="text-blue-500 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="min-w-0"><span className="font-semibold text-gray-900 dark:text-gray-300">Explanation:</span> {analysis.explanation}</p>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Critical Issues Found */}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl p-6 shadow-sm dark:shadow-soft flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
              <h3 className="text-xs sm:text-[15px] font-bold text-gray-500 dark:text-gray-400 uppercase sm:normal-case tracking-widest sm:tracking-wide">AI Breakdown & Risk Factors</h3>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded inline-flex items-center ${analysis.risk_level === 'High' ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20'}`}>
                {analysis.risk_factors?.length || 0} Points Noted
              </span>
            </div>

            <div className="space-y-4">
              {analysis.risk_factors && analysis.risk_factors.length > 0 ? analysis.risk_factors.map((factor, idx) => (
                <div key={idx} className={`border rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 transition-colors ${factor.points > 25 ? 'bg-red-50/50 border-red-200 hover:border-red-300 dark:bg-[#1A1D27] dark:border-red-500/20 dark:hover:border-red-500/40' : factor.points > 10 ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300 dark:bg-[#1A1D27] dark:border-amber-500/20 dark:hover:border-amber-500/40' : 'bg-blue-50/50 border-blue-200 hover:border-blue-300 dark:bg-[#1A1D27] dark:border-blue-500/20 dark:hover:border-blue-500/40'}`}>
                  {factor.points > 25 ? <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" /> : factor.points > 10 ? <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" /> : <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white mb-1 tracking-wide">{factor.label}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed capitalize">Category: {factor.category?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              )) : (
                 <p className="text-sm text-gray-500 italic">No specific risk factors extracted.</p>
              )}
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
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed font-mono text-xs sm:text-[13px] flex-1 overflow-y-auto pr-2 scrollbar-thin max-h-[400px] whitespace-pre-wrap">
                {analysis.suggested_reply || "No suggestion provided."}
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

      </div>
    </div>
      ) : null}
    </AppLayout>
  );
}
