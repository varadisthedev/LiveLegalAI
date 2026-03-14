import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Info, FileCheck, MessageSquare } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import UploadBox from '../components/UploadBox';

const tips = [
  { icon: '📄', text: 'Supported formats: PDF, DOCX, TXT' },
  { icon: '📏', text: 'Maximum file size: 10MB' },
  { icon: '🔒', text: 'Your documents are processed securely and never shared' },
  { icon: '⚡', text: 'Analysis is complete within 30 seconds' },
];

export default function Upload() {
  const navigate = useNavigate();
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleUploadComplete = (file) => {
    setIsUploaded(true);
    setUploadedFileName(file.name);
  };

  return (
    <AppLayout title="Upload Document">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
              <UploadIcon size={20} className="text-blue-600 dark:text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Document</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:ml-13 sm:pl-0">
            Upload your legal document to receive an instant AI-powered analysis.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-2xl p-6 shadow-sm dark:shadow-soft mb-6 transition-colors">
          <UploadBox onUploadComplete={handleUploadComplete} />
        </div>

        {/* Action Panel after upload */}
        {isUploaded && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-[#1C36A4] dark:to-blue-800 rounded-2xl p-6 shadow-lg mb-6 border border-blue-500/20 dark:border-blue-500/30 transform transition-all animate-fade-in-up">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white text-center sm:text-left">
                  <h3 className="text-lg font-bold mb-1">Document Processed</h3>
                  <p className="text-blue-100 text-sm">"{uploadedFileName}" is ready for review.</p>
                </div>
                <div className="flex w-full sm:w-auto gap-3">
                   <button 
                    onClick={() => navigate('/analysis')}
                    className="flex-1 sm:flex-none justify-center items-center flex gap-2 bg-white text-blue-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-gray-50 transition-colors"
                   >
                     <FileCheck size={16} /> View Analysis
                   </button>
                   <button 
                    onClick={() => navigate('/active-chat')}
                    className="flex-1 sm:flex-none justify-center items-center flex gap-2 bg-blue-500/20 border border-blue-400/30 text-white hover:bg-blue-500/40 px-4 py-2.5 rounded-lg text-sm font-bold shadow transition-colors"
                   >
                     <MessageSquare size={16} /> Ask AI
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Tips */}
        {!isUploaded && (
          <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5 mb-6 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-blue-600 dark:text-blue-500" />
              <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-400">Before you upload</h2>
            </div>
            <ul className="space-y-2">
              {tips.map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-base flex-shrink-0 leading-5">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What happens next */}
        {!isUploaded && (
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-2xl p-5 shadow-sm dark:shadow-soft transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck size={16} className="text-green-600 dark:text-green-500" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">What happens after upload?</h2>
            </div>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Document Processing', desc: 'Your document is parsed and text is extracted securely.' },
                { step: '2', title: 'AI Analysis', desc: 'Our AI identifies clauses, risks, and key legal provisions.' },
                { step: '3', title: 'Results Ready', desc: 'View a full analysis report and start chatting with your document.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 dark:bg-[#1C36A4] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm">
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
