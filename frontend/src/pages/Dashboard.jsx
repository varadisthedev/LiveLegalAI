import { Link } from 'react-router-dom';
import { Upload, FileText, TrendingUp, Clock, Plus, ArrowRight, BarChart3, AlertTriangle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import RiskIndicator from '../components/RiskIndicator';

const stats = [
  { label: 'Total Documents', value: '4', icon: FileText, color: 'blue', change: '+2 this month' },
  { label: 'Analyzed Today', value: '1', icon: TrendingUp, color: 'green', change: 'Last: 2h ago' },
  { label: 'High Risk Docs', value: '1', icon: AlertTriangle, color: 'red', change: 'Needs attention' },
  { label: 'Avg. Analysis Time', value: '18s', icon: Clock, color: 'purple', change: 'Lightning fast' },
];

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
};

const typeColors = {
  PDF: 'bg-red-50 text-red-600 border-red-100',
  DOCX: 'bg-blue-50 text-blue-600 border-blue-100',
  TXT: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guard: only run after Clerk finishes loading
    if (!isLoaded) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          (import.meta.env.VITE_BACKEND_URL || 'https://livelegal-backend.up.railway.app') + '/api/document/history',
          { headers: { 'x-user-id': user?.id || 'anonymous' } }
        );
        const data = await res.json();
        if (data.success) setDocuments(data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  // user?.id is a stable string — prevents runaway polling
  }, [isLoaded, user?.id]);

  const highRiskCount = documents.filter(d => d.riskLevel === 'High').length || 0;
  const analyzedToday = documents.filter(d => {
    const today = new Date();
    const docDate = new Date(d.createdAt);
    return docDate.toDateString() === today.toDateString();
  }).length || 0;

  const dynamicStats = [
    { label: 'Total Documents', value: documents.length.toString(), icon: FileText, color: 'blue', change: 'Total uploaded' },
    { label: 'Analyzed Today', value: analyzedToday.toString(), icon: TrendingUp, color: 'green', change: 'Since midnight' },
    { label: 'High Risk Docs', value: highRiskCount.toString(), icon: AlertTriangle, color: 'red', change: 'Needs attention' },
    { label: 'Avg. Analysis Time', value: '18s', icon: Clock, color: 'purple', change: 'Lightning fast' },
  ];
  return (
    <AppLayout title="Dashboard">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.firstName || 'User'} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Here's an overview of your legal documents.</p>
        </div>
        <Link
          to="/upload"
          id="dashboard-upload-btn"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          Upload Document
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dynamicStats.map(({ label, value, icon: Icon, color, change }) => {
          const cls = colorMap[color];
          return (
            <div key={label} className={`bg-white border ${cls.border} rounded-2xl p-5 shadow-card hover:shadow-soft transition-all duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <div className={`w-8 h-8 ${cls.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={16} className={cls.icon} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              <p className="text-xs text-gray-400">{change}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Documents */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-800">Uploaded Documents</h2>
          </div>
          <Link to="/history" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading documents...</div>
          ) : documents.map((doc) => {
            const ext = doc.originalName?.split('.').pop().toUpperCase() || 'FILE';
            return (
              <div key={doc._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors group">
                {/* File icon */}
                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                  <FileText size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800 truncate">{doc.originalName}</p>
                    <span className={`hidden sm:inline-flex text-[11px] font-medium px-1.5 py-0.5 rounded border ${typeColors[ext] || typeColors.TXT}`}>{ext}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Risk + Action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <RiskIndicator level={doc.riskLevel || 'Unknown'} size="sm" />
                  <Link
                    to={`/analysis/${doc.documentId}`}
                    id={`dashboard-open-${doc.documentId}`}
                    className="hidden sm:flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Open Analysis
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state placeholder */}
        {!loading && documents.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">No documents yet</p>
            <p className="text-xs text-gray-400">Upload your first legal document to get started</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
