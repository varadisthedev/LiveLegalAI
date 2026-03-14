import { Bell, Search, ChevronDown, Plus, FileText, ArrowRight, Upload, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import AppLayout from '../components/AppLayout';

const getRiskColor = (riskLevel) => {
  if (riskLevel === 'High') return 'text-red-700 dark:text-red-500 bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
  if (riskLevel === 'Moderate') return 'text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
  if (riskLevel === 'Low') return 'text-green-700 dark:text-green-500 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
  return 'text-gray-700 dark:text-gray-500 bg-gray-100 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20';
};

const getRiskText = (riskLevel) => {
  if (!riskLevel || riskLevel === 'Unknown') return 'PENDING ANALYSIS';
  return `${riskLevel.toUpperCase()} RISK`;
};

export default function History() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showOptions, setShowOptions] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('https://livelegal-backend.up.railway.app/api/document/history', {
          headers: { 'x-user-id': user?.id || 'user_12345' }
        });
        const data = await res.json();
        if (data.success) {
          setDocuments(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchHistory();
    }
  }, [user]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 font-sans tracking-tight">Document History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage and audit your analyzed legal documents.</p>
        </div>
        <div className="flex items-center gap-4 align-self-end">
          <button className="hidden sm:flex w-10 h-10 rounded-full bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Bell size={18} />
          </button>
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName || 'User'}</span>
            <span className="text-xs text-gray-500">Legal Counsel</span>
          </div>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: { userButtonAvatarBox: "w-10 h-10 border border-gray-200 dark:border-gray-700" }
            }}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 relative w-full lg:w-auto">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by document title, client or keyword..."
            className="w-full bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
          />
        </div>
        <div className="flex gap-2 sm:gap-4 overflow-visible pb-1 sm:pb-0" ref={dropdownRef}>
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-2 bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap lg:w-auto"
            >
              <Plus size={16} /> New Analysis
            </button>

            {showOptions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] shadow-xl rounded-xl overflow-hidden z-[100] py-1">
                <button
                  onClick={() => navigate('/upload')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1D27] hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors"
                >
                  <Upload size={16} /> Upload Document
                </button>
                <div className="h-px bg-gray-100 dark:bg-[#1F2937] mx-2" />
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1D27] hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors"
                >
                  <MessageSquare size={16} /> Ask AI
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table - Responsive wrap */}
      <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl overflow-x-auto shadow-sm flex flex-col min-h-[400px]">
        {/* Table Header */}
        <div className="min-w-[800px] grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-[#1F2937] text-xs font-bold text-gray-500 tracking-wider uppercase bg-gray-50 dark:bg-transparent">
          <div className="col-span-5">Document Title</div>
          <div className="col-span-2">Upload Date</div>
          <div className="col-span-2">Severity Score</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="min-w-[800px] divide-y divide-gray-100 dark:divide-[#1F2937]">
          {loading ? (
             <div className="px-6 py-8 text-center text-sm text-gray-500">Loading documents...</div>
          ) : documents.length === 0 ? (
             <div className="px-6 py-8 text-center text-sm text-gray-500">No documents found.</div>
          ) : documents.map((doc) => (
            <div key={doc._id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-blue-50/50 dark:hover:bg-[#1A1D27] transition-colors group">
              <div className="col-span-5 flex items-start gap-4">
                <div className="mt-0.5">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-0.5 truncate max-w-sm">{doc.originalName}</p>
                  <p className="text-xs text-gray-500">{doc.documentType}</p>
                </div>
              </div>
              <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                 {new Date(doc.createdAt).toLocaleDateString()}
              </div>
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold border ${getRiskColor(doc.riskLevel)}`}>
                  {getRiskText(doc.riskLevel)}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className={`w-2 h-2 rounded-full ${doc.analyzed ? 'bg-green-500' : 'bg-amber-500'}`} />
                {doc.analyzed ? 'Completed' : 'Reviewing'}
              </div>
              <div className="col-span-1 text-right">
                <button 
                  onClick={() => navigate(`/analysis/${doc.documentId}`)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-gray-300 hover:text-blue-800 dark:hover:text-white transition-colors"
                >
                  Open Analysis <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-sm gap-4">
        <span className="text-gray-500 text-center sm:text-left">Showing {documents.length} documents</span>
        <div className="flex justify-center flex-1 sm:flex-none gap-2">
          <button className="px-4 py-2 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] text-gray-600 dark:text-gray-400 rounded hover:bg-gray-50 dark:hover:bg-[#1A1D27] hover:text-gray-900 dark:hover:text-white transition-colors">
             &lt; Previous
          </button>
          <button className="px-4 py-2 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] text-gray-600 dark:text-gray-400 rounded hover:bg-gray-50 dark:hover:bg-[#1A1D27] hover:text-gray-900 dark:hover:text-white transition-colors">
             Next &gt;
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
