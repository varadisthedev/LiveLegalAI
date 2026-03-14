import { Link } from 'react-router-dom';
import { FileText, Calendar, ArrowRight, Eye } from 'lucide-react';
import RiskIndicator from './RiskIndicator';

export default function HistoryCard({ doc }) {
  const typeColors = {
    PDF: 'bg-red-50 text-red-600 border-red-100',
    DOCX: 'bg-blue-50 text-blue-600 border-blue-100',
    TXT: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-soft transition-all duration-200 group animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
          <FileText size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate pr-2 group-hover:text-blue-700 transition-colors">
              {doc.name}
            </h3>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${typeColors[doc.type] || typeColors.TXT}`}>
              {doc.type}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} />
              {new Date(doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-gray-200">·</span>
            <span className="text-xs text-gray-400">{doc.size}</span>
            <span className="text-gray-200">·</span>
            <span className="text-xs text-gray-400">{doc.pages} pages</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <RiskIndicator level={doc.riskLevel} size="sm" />
            <div className="flex items-center gap-1.5">
              <Link
                to={`/chat/${doc.id}`}
                className="text-xs text-gray-500 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Chat
              </Link>
              <Link
                to={`/analysis/${doc.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-all group/btn"
                id={`view-doc-${doc.id}`}
              >
                <Eye size={12} />
                View Analysis
                <ArrowRight size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
