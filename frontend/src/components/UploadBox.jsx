import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { apiUrl } from '../services/api';

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const ACCEPTED_EXTS = ['.pdf', '.docx', '.txt'];

export default function UploadBox({ onUploadComplete }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef();
  const { user } = useUser();

  const validateFile = (f) => {
    if (!f) return 'No file selected.';
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTS.includes(ext)) return 'Only PDF, DOCX, and TXT files are supported.';
    if (f.size > 10 * 1024 * 1024) return 'File size must be under 10MB.';
    return '';
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError('');
    setFile(f);
    setProgress(0);
    setUploaded(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  };

  const simulateUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError('');

    // Simulate progress bar while uploading
    let p = 0;
    const progressInterval = setInterval(() => {
      p += 10;
      if (p <= 90) setProgress(p);
    }, 200);

    try {
      const formData = new FormData();
      formData.append('document', file); // API expects 'document' field name

      const response = await fetch(apiUrl('/api/document/upload'), {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || 'user_12345'
        },
        body: formData
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Upload failed');
      }

      setUploaded(true);
      if (onUploadComplete) onUploadComplete(result.data);
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploaded(false);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const getFileIcon = () => {
    if (!file) return null;
    const ext = file.name.split('.').pop().toLowerCase();
    const colors = { pdf: 'text-red-600 dark:text-red-500', docx: 'text-blue-600 dark:text-blue-500', txt: 'text-gray-600 dark:text-gray-400' };
    return colors[ext] || 'text-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer
          ${dragging ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-[1.01]' : 'border-gray-200 dark:border-[#2A3143] bg-gray-50 dark:bg-[#1A1D27] hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5'}
          ${file ? 'cursor-default' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
          id="file-upload-input"
        />

        {!file ? (
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragging ? 'bg-blue-100 dark:bg-blue-500/20 scale-110' : 'bg-white dark:bg-[#151822] shadow-sm dark:shadow-soft'}`}>
              <Upload size={28} className={`transition-colors ${dragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                {dragging ? 'Drop your file here' : 'Drag & drop your document'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                or <span className="text-blue-600 dark:text-blue-500 font-medium hover:underline">browse to upload</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {['PDF', 'DOCX', 'TXT'].map((fmt) => (
                <span key={fmt} className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-[#0F111A] border border-gray-200 dark:border-[#1F2937] text-gray-500 dark:text-gray-400 rounded-full shadow-sm">
                  {fmt}
                </span>
              ))}
              <span className="text-xs text-gray-400 dark:text-gray-500">· Max 10MB</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0F111A] border border-gray-100 dark:border-[#1F2937] shadow-sm dark:shadow-soft flex items-center justify-center flex-shrink-0">
              <FileText size={24} className={getFileIcon()} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-white truncate">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            {uploaded ? (
              <CheckCircle size={22} className="text-green-500 flex-shrink-0" />
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
                aria-label="Remove file"
              >
                <X size={18} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl border border-red-100 dark:border-red-500/20">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Progress Bar */}
      {(uploading || uploaded) && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{uploaded ? 'Upload complete' : 'Uploading...'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-[#1A1D27] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${uploaded ? 'bg-green-500' : 'bg-blue-600 dark:bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && !uploading && !uploaded && (
        <button
          onClick={simulateUpload}
          className="w-full py-3 px-6 bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-[#2C4599] text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          id="upload-submit-btn"
        >
          Upload Document
        </button>
      )}

      {uploaded && (
        <div className="flex items-center gap-2 justify-center text-sm font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 py-3 rounded-xl border border-green-100 dark:border-green-500/20">
          <CheckCircle size={16} />
          Document uploaded successfully!
        </div>
      )}
    </div>
  );
}
