import { Link, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  Search,
  Sparkles,
  MessageSquare,
  Settings as SettingsIcon,
  ShieldCheck,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import RiskIndicator from '../components/RiskIndicator';
import { apiUrl } from '../services/api';

const colorMap = {
  cyan: {
    bg: 'bg-[#00dbe9]/10',
    icon: 'text-[#dbfcff]',
    border: 'border-[#00dbe9]/20',
    glow: 'shadow-[0_0_20px_rgba(0,219,233,0.14)]',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-300',
    border: 'border-emerald-500/20',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]',
  },
  rose: {
    bg: 'bg-rose-500/10',
    icon: 'text-rose-300',
    border: 'border-rose-500/20',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.12)]',
  },
  violet: {
    bg: 'bg-[#7701d0]/10',
    icon: 'text-[#dcb8ff]',
    border: 'border-[#7701d0]/20',
    glow: 'shadow-[0_0_20px_rgba(119,1,208,0.12)]',
  },
};

const typeColors = {
  PDF: 'bg-rose-500/10 text-rose-200 border-rose-500/20',
  DOCX: 'bg-[#00dbe9]/10 text-[#dbfcff] border-[#00dbe9]/20',
  TXT: 'bg-white/5 text-[#b9cacb] border-white/10',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Guard: only run after Clerk finishes loading
    if (!isLoaded) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(apiUrl('/api/document/history'), {
          headers: { 'x-user-id': user?.id || 'anonymous' },
        });
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

  const highRiskCount =
    documents.filter((d) => d.riskLevel === 'High').length || 0;
  const analyzedToday =
    documents.filter((d) => {
      const today = new Date();
      const docDate = new Date(d.createdAt);
      return docDate.toDateString() === today.toDateString();
    }).length || 0;

  const filteredDocuments = documents.filter((doc) => {
    const haystack =
      `${doc.originalName || ''} ${doc.documentType || ''} ${doc.riskLevel || ''}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const dynamicStats = [
    {
      label: 'Total Documents',
      value: documents.length.toString(),
      icon: FileText,
      color: 'cyan',
      change: 'Total uploaded',
    },
    {
      label: 'Analyzed Today',
      value: analyzedToday.toString(),
      icon: TrendingUp,
      color: 'emerald',
      change: 'Since midnight',
    },
    {
      label: 'High Risk Docs',
      value: highRiskCount.toString(),
      icon: AlertTriangle,
      color: 'rose',
      change: 'Needs attention',
    },
    {
      label: 'Avg. Analysis Time',
      value: '18s',
      icon: Clock,
      color: 'violet',
      change: 'Lightning fast',
    },
  ];

  const recentDocuments = [...filteredDocuments].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  );

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Hero */}
        <div className="glass-card-strong relative overflow-hidden rounded-[1rem] p-6 sm:p-8">
          <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-[#00dbe9]/10 blur-3xl" />
          <div className="absolute -left-10 bottom-[-3rem] h-48 w-48 rounded-full bg-[#7701d0]/14 blur-3xl" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="font-metrics text-[11px] uppercase tracking-[0.35em] text-[#a4f6ff]">
                Aether Lex / dashboard
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-[#f7f4ff]">
                Welcome back, {user?.firstName || 'Counsel'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-6 text-[#b9cacb]">
                Neural processing is complete. You have {highRiskCount} urgent
                items requiring review and {analyzedToday} documents analyzed
                today.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#dbfcff] px-5 py-2.5 font-semibold text-[#00363a] transition-colors hover:shadow-[0_0_20px_rgba(0,219,233,0.22)]"
              >
                <Plus size={16} /> New Analysis
              </button>
              <Link
                to="/history"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-semibold text-[#e1e0fa] transition-colors hover:border-[#00dbe9]/30 hover:bg-[#00dbe9]/10"
              >
                Case History <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Search + shortcuts */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="glass-card flex-1 rounded-[1rem] px-4 py-3">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#849495]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search documents, types, or risk level..."
                className="w-full bg-transparent pl-7 pr-2 py-1 text-sm text-[#f7f4ff] placeholder:text-[#849495] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[#e1e0fa] transition-colors hover:border-[#00dbe9]/30 hover:bg-[#00dbe9]/10"
            >
              <SettingsIcon size={16} /> Settings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dynamicStats.map(({ label, value, icon: Icon, color, change }) => {
            const cls = colorMap[color];
            return (
              <div
                key={label}
                className={`glass-card rounded-[1rem] p-5 ${cls.border} ${cls.glow}`}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="font-metrics text-[10px] uppercase tracking-[0.3em] text-[#b9cacb]">
                    {label}
                  </span>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${cls.bg} ${cls.border}`}
                  >
                    <Icon size={16} className={cls.icon} />
                  </div>
                </div>
                <p className="font-metrics text-3xl text-[#f7f4ff] mb-1">
                  {value}
                </p>
                <p className="text-xs text-[#849495]">{change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Recent Documents */}
          <div className="xl:col-span-2 glass-card rounded-[1rem] overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 sm:px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00dbe9]/10 border border-[#00dbe9]/20 text-[#dbfcff]">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#f7f4ff]">
                    Recent Analyses
                  </h2>
                  <p className="text-xs text-[#849495]">
                    {filteredDocuments.length} documents in view
                  </p>
                </div>
              </div>
              <Link
                to="/history"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#dbfcff] hover:text-white transition-colors"
              >
                View history <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-6 py-4 font-metrics text-[10px] uppercase tracking-[0.28em] text-[#849495]">
                  <div className="col-span-5">Document</div>
                  <div className="col-span-2">Analysis Date</div>
                  <div className="col-span-2">Risk Score</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right">Action</div>
                </div>

                <div className="divide-y divide-white/10">
                  {loading ? (
                    <div className="px-6 py-10 text-center text-sm text-[#b9cacb]">
                      Loading documents...
                    </div>
                  ) : recentDocuments.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#849495]">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-semibold text-[#f7f4ff] mb-1">
                        No matching documents
                      </p>
                      <p className="text-xs text-[#849495]">
                        Upload your first legal document to get started or clear
                        the search.
                      </p>
                    </div>
                  ) : (
                    recentDocuments.map((doc) => {
                      const ext =
                        doc.originalName?.split('.').pop().toUpperCase() ||
                        'FILE';
                      return (
                        <div
                          key={doc._id}
                          className="grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors hover:bg-white/5"
                        >
                          <div className="col-span-5 flex items-center gap-4 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 shrink-0">
                              <FileText size={18} className="text-[#dbfcff]" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#f7f4ff]">
                                {doc.originalName}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold ${typeColors[ext] || typeColors.TXT}`}
                                >
                                  {ext}
                                </span>
                                <span className="font-metrics text-[10px] uppercase tracking-[0.24em] text-[#849495]">
                                  {doc.documentType || 'Legal File'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="col-span-2 text-sm text-[#b9cacb]">
                            {new Date(doc.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </div>

                          <div className="col-span-2">
                            <RiskIndicator
                              level={doc.riskLevel || 'Unknown'}
                              size="sm"
                            />
                          </div>

                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${doc.analyzed ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'}`}
                            >
                              <ShieldCheck size={12} />
                              {doc.analyzed ? 'Reviewed' : 'Pending'}
                            </span>
                          </div>

                          <div className="col-span-1 flex justify-end">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/analysis/${doc.documentId}`}
                                id={`dashboard-open-${doc.documentId}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#e1e0fa] transition-colors hover:border-[#00dbe9]/30 hover:bg-[#00dbe9]/10 hover:text-white"
                              >
                                Open
                              </Link>
                              <Link
                                to={`/active-chat/${doc.documentId}`}
                                className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#e1e0fa] transition-colors hover:border-[#00dbe9]/30 hover:bg-[#00dbe9]/10 hover:text-white"
                              >
                                <MessageSquare size={12} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div className="space-y-6">
            <div className="glass-card rounded-[1rem] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00dbe9]/10 border border-[#00dbe9]/20 text-[#dbfcff] overflow-hidden">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-metrics text-lg">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#f7f4ff]">
                    {user?.fullName || 'My Account'}
                  </p>
                  <p className="text-sm text-[#849495]">Lead Counsel</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-center">
                <Link
                  to="/upload"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[#e1e0fa] transition-colors hover:border-[#00dbe9]/30 hover:bg-[#00dbe9]/10"
                >
                  Upload Doc
                </Link>
                <Link
                  to="/history"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[#e1e0fa] transition-colors hover:border-[#00dbe9]/30 hover:bg-[#00dbe9]/10"
                >
                  Case History
                </Link>
                <Link
                  to="/settings"
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[#e1e0fa] transition-colors hover:border-[#00dbe9]/30 hover:bg-[#00dbe9]/10"
                >
                  Settings
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-[1rem] p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h3 className="font-display text-lg font-semibold text-[#f7f4ff]">
                  Recent Activity
                </h3>
                <span className="font-metrics text-[10px] uppercase tracking-[0.24em] text-[#849495]">
                  Live
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-[#f7f4ff]">
                    Connected sessions
                  </p>
                  <p className="mt-1 text-xs text-[#849495]">
                    Review active logins and refresh access tokens from
                    Settings.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-[#f7f4ff]">Status</p>
                  <p className="mt-1 text-xs text-[#849495]">
                    The dashboard adapts to dark mode and keeps the active
                    routes available across pages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
