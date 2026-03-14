import { Bell, Search, ChevronDown, Plus, FileText, ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const documents = [
  {
    title: 'NDA_CloudScale_Inc.pdf',
    subtitle: 'Client: CloudScale Inc.',
    date: 'Oct 24, 2023',
    risk: 'HIGH RISK',
    riskColor: 'text-red-700 dark:text-red-500 bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
    status: 'Completed',
    statusColor: 'bg-green-500',
  },
  {
    title: 'Employment_Agreement_V4.docx',
    subtitle: 'Internal HR',
    date: 'Oct 22, 2023',
    risk: 'MEDIUM RISK',
    riskColor: 'text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    status: 'Completed',
    statusColor: 'bg-green-500',
  },
  {
    title: 'Privacy_Policy_Update_2024.pdf',
    subtitle: 'Compliance Team',
    date: 'Oct 18, 2023',
    risk: 'LOW RISK',
    riskColor: 'text-green-700 dark:text-green-500 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20',
    status: 'Completed',
    statusColor: 'bg-green-500',
  },
  {
    title: 'Supplier_Contract_Logistics.pdf',
    subtitle: 'Ops Dept',
    date: 'Oct 15, 2023',
    risk: 'HIGH RISK',
    riskColor: 'text-red-700 dark:text-red-500 bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
    status: 'Reviewing',
    statusColor: 'bg-amber-500',
  },
];

export default function History() {
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
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Alex Thompson</span>
            <span className="text-xs text-gray-500">Legal Counsel</span>
          </div>
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-orange-200 overflow-hidden items-center justify-center">
             <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-[#151822] mt-4" /> 
          </div>
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
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
          <button className="flex items-center gap-2 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-[#1A1D27] transition-colors whitespace-nowrap">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Risk Level <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
          </button>
          <button className="flex items-center gap-2 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-[#1A1D27] transition-colors whitespace-nowrap">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Date Range <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
          </button>
          <button className="flex items-center gap-2 bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap lg:w-auto">
            <Plus size={16} /> New Analysis
          </button>
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
          {documents.map((doc, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-blue-50/50 dark:hover:bg-[#1A1D27] transition-colors group">
              <div className="col-span-5 flex items-start gap-4">
                <div className="mt-0.5">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-0.5">{doc.title}</p>
                  <p className="text-xs text-gray-500">{doc.subtitle}</p>
                </div>
              </div>
              <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{doc.date}</div>
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold border ${doc.riskColor}`}>
                  {doc.risk}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className={`w-2 h-2 rounded-full ${doc.statusColor}`} />
                {doc.status}
              </div>
              <div className="col-span-1 text-right">
                <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-gray-300 hover:text-blue-800 dark:hover:text-white transition-colors">
                  Open Analysis <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-sm gap-4">
        <span className="text-gray-500 text-center sm:text-left">Showing 1 to 4 of 24 documents</span>
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
