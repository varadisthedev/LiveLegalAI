import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Paperclip,
  ChevronDown,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  Mic,
  Type,
  Languages,
  Image as ImageIcon,
} from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTTS } from '../hooks/useTTS';
import { useSTT } from '../hooks/useSTT';
import { apiUrl } from '../services/api';

const FORMAT_OPTIONS = [
  {
    label: '1. In Brief',
    value: 'brief',
    desc: 'A quick 1–2 sentence answer',
    color: 'blue',
  },
  {
    label: '2. Summarized Form',
    value: 'summarized',
    desc: 'A concise paragraph summary',
    color: 'purple',
  },
  {
    label: '3. 5 Pointers Explanation',
    value: 'pointers',
    desc: 'Five clear bullet-point takeaways',
    color: 'emerald',
  },
];

const COLOR_MAP = {
  blue: {
    btn: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    dot: 'bg-blue-500',
  },
  purple: {
    btn: 'bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
    dot: 'bg-purple-500',
  },
  emerald: {
    btn: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
};
async function fetchAIResponse(
  documentId,
  question,
  formatValue,
  languageCode,
  sessionId,
  userId,
) {
  try {
    const response = await fetch(apiUrl('/api/chat/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId || 'user_12345',
      },
      body: JSON.stringify({
        document_id: documentId || 'general_query',
        question: question,
        format: formatValue,
        language: languageCode === 'hi-IN' ? 'hi' : 'en',
        session_id: sessionId,
      }),
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get answer');
    }
  } catch (err) {
    return {
      answer:
        "I'm sorry, I'm having trouble connecting to the legal assistant. Please try again later.",
      session_id: sessionId,
    };
  }
}

export default function ChatWidget() {
  const { id: urlDocId } = useParams();
  const location = useLocation();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const [pendingQuery, setPendingQuery] = useState(null);
  const [language, setLanguage] = useState('en-US');
  const [sessionId, setSessionId] = useState(null);
  const [documentName, setDocumentName] = useState('Document');

  const messagesEndRef = useRef(null);
  const { speak, isSpeaking, isMuted, toggleMute, usingFallback, ttsError } =
    useTTS(language);
  const { isListening, transcript, startListening, stopListening, hasSupport } =
    useSTT(language);

  // Sync transcription to input when active
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  // Extract documentId from URL since useParams might not catch it if we're not inside the specific route
  const documentId = urlDocId || location.pathname.split('/').pop();

  useEffect(() => {
    const fetchDocName = async () => {
      if (
        !documentId ||
        documentId === 'dashboard' ||
        documentId === 'history' ||
        documentId === 'settings'
      )
        return;
      try {
        const res = await fetch(apiUrl('/api/document/history'), {
          headers: { 'x-user-id': user?.id || 'user_12345' },
        });
        const data = await res.json();
        if (data.success) {
          const doc = data.data.find((d) => d.documentId === documentId);
          if (doc) setDocumentName(doc.originalName);
        }
      } catch {}
    };
    if (user && documentId) fetchDocName();
  }, [user, documentId, location.pathname]);

  // Handle Enter to send automatically on listening end
  const handleMicToggle = () => {
    if (!hasSupport) {
      alert('Microphone access is not supported or permitted in this browser.');
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  /** Adds an AI message AND speaks it */
  const addAIMessage = (text, extra = {}) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'ai', text, ...extra },
    ]);
    speak(text);
  };

  /**
   * handleFormatPick — called when user taps one of the 3 format cards.
   */
  const handleFormatPick = async (formatValue, formatLabel) => {
    // Show user's choice as a message
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: formatLabel },
    ]);
    setIsTyping(true);

    const query = pendingQuery || 'Please overview this document.';
    setPendingQuery(null);

    const result = await fetchAIResponse(
      documentId,
      query,
      formatValue,
      language,
      sessionId,
      user?.id,
    );

    if (result.session_id) setSessionId(result.session_id);

    addAIMessage(result.answer, { snippets: result.context_snippets });
    setIsTyping(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * handleSend — called when user types a custom question.
   * Always presents the 3 format options before answering.
   */
  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;
    const query = input.trim();
    setInput('');

    // Prepend a little marker if a file was attached. (In a real backend, payload.file = selectedFile)
    const displayQuery = selectedFile
      ? `[Attached: ${selectedFile.name}]\n${query}`
      : query;

    removeFile(); // clear draft

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: displayQuery },
    ]);
    setIsTyping(true);
    setPendingQuery(query);

    setTimeout(() => {
      addAIMessage('How would you like the answer?', {
        showFormatPicker: true,
      });
      setIsTyping(false);
    }, 800);
  };

  const isEmpty = messages.length === 0;

  /* ─── Closed: floating bubble ─── */
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 z-50 group"
        aria-label="Open AI Assistant"
      >
        <MessageSquare size={24} />
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask AI Assistant
          <div className="absolute top-1/2 left-full -translate-y-1/2 -translate-x-1 border-4 border-transparent border-l-gray-900 dark:border-l-white" />
        </div>
      </button>
    );
  }

  /* ─── Open: chat panel ─── */
  return (
    <div
      className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 w-[calc(100vw-32px)] sm:w-[390px] bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-2xl shadow-xl dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isMinimized ? 'h-[60px]' : 'h-[560px] max-h-[82vh]'}`}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-[#1F2937] cursor-pointer bg-gray-50 dark:bg-[#1A1D27] rounded-t-2xl hover:bg-gray-100 dark:hover:bg-[#1F2432] transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 border border-blue-200 dark:border-blue-500/20 shadow-sm">
              <Bot size={16} />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#1A1D27] rounded-full" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-0.5">
              LegalDoc AI
            </h3>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Analyzing: {documentName}
              </p>
              {usingFallback && (
                <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30 whitespace-nowrap">
                  Browser Voice
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <div className="relative group mr-1">
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 transition-colors"
              title="Change Language"
            >
              <Languages size={15} />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] py-1">
              <button
                onClick={() => setLanguage('en-US')}
                className={`w-full px-4 py-2 text-xs font-semibold text-left whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#1A1D27] ${language === 'en-US' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi-IN')}
                className={`w-full px-4 py-2 text-xs font-semibold text-left whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#1A1D27] ${language === 'hi-IN' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Voice toggle */}
          <button
            id="chat-widget-voice-toggle"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            title={
              isMuted
                ? 'Voice muted — click to enable'
                : 'Voice on — click to mute'
            }
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              isMuted
                ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10'
            }`}
          >
            {isSpeaking && !isMuted ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isMuted ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>

          <button
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-[#2A3143] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* ── TTS error banner ── */}
          {ttsError && (
            <div className="mx-3 mt-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-[11px] text-red-600 dark:text-red-400 font-medium">
              ⚠ Voice error: {ttsError}
            </div>
          )}

          {/* ── Muted notice ── */}
          {isMuted && (
            <div className="mx-3 mt-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg flex items-center gap-2">
              <VolumeX size={12} className="text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Voice muted — speech is still generated. Tap{' '}
                <Volume2 size={10} className="inline mx-0.5" /> to hear it.
              </p>
            </div>
          )}

          {/* ── Message area ── */}
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-white dark:bg-[#0F111A]">
            {/* ── Empty state: 3 format cards ── */}
            {isEmpty && (
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-blue-500" />
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    How would you like your answer?
                  </p>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-500 -mt-1 mb-1">
                  Choose a format — the AI will respond and speak it aloud.
                </p>

                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFormatPick(opt.value, opt.label)}
                    className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm ${COLOR_MAP[opt.color].btn}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${COLOR_MAP[opt.color].dot}`}
                    />
                    <div>
                      <p className="text-sm font-bold leading-tight">
                        {opt.label}
                      </p>
                      <p className="text-[11px] opacity-70 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Chat messages ── */}
            {!isEmpty && (
              <div className="p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[92%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      {msg.sender === 'user' ? (
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-500/30">
                          <User size={12} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <Bot size={12} />
                        </div>
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 dark:bg-[#1C36A4] text-white rounded-tr-sm'
                          : 'bg-gray-50 dark:bg-[#151822] border border-gray-100 dark:border-[#1F2937] text-gray-800 dark:text-gray-200 rounded-tl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Inline format picker (for follow-up typed queries) */}
                      {msg.showFormatPicker && (
                        <div className="flex flex-col gap-2 mt-3">
                          {FORMAT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() =>
                                handleFormatPick(opt.value, opt.label)
                              }
                              className="text-left px-3 py-2 bg-white dark:bg-[#0F111A] hover:bg-blue-50 dark:hover:bg-[#1F2432] text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-100 dark:border-blue-500/20 transition-colors shadow-sm"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center border border-gray-200 dark:border-gray-700 mt-1 flex-shrink-0">
                      <Bot size={12} />
                    </div>
                    <div className="bg-gray-50 dark:bg-[#151822] border border-gray-100 dark:border-[#1F2937] p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10 w-16 justify-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input area ── */}
          <div className="p-3 bg-white dark:bg-[#151822] border-t border-gray-100 dark:border-[#1F2937] rounded-b-2xl">
            {filePreview && (
              <div className="mb-2 relative inline-block">
                <img
                  src={filePreview}
                  alt="upload preview"
                  className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div
              className={`relative flex items-end gap-2 bg-gray-50 dark:bg-[#0F111A] border ${isListening ? 'border-red-400 dark:border-red-500/50 ring-1 ring-red-400/30' : 'border-gray-200 dark:border-[#1F2937] focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'} p-1.5 rounded-xl transition-all shadow-inner`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors self-end mb-0.5"
                title="Attach Photo or Document"
              >
                <Paperclip size={18} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (isListening) stopListening();
                    handleSend();
                  }
                }}
                placeholder={
                  isListening
                    ? language === 'hi-IN'
                      ? 'सुन रहा हूँ...'
                      : 'Listening...'
                    : language === 'hi-IN'
                      ? 'हिंदी में पूछें...'
                      : 'Type or speak your question...'
                }
                className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-0 py-2.5 px-1 resize-none placeholder-gray-400 dark:placeholder-gray-500 scrollbar-thin"
                rows={1}
              />

              <button
                onClick={handleMicToggle}
                className={`p-2 rounded-lg transition-colors self-end mb-0.5 ${isListening ? 'text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
                title="Use Microphone"
              >
                {isListening ? (
                  <div className="relative flex items-center justify-center w-[18px] h-[18px]">
                    <span className="w-1.5 h-1.5 bg-red-600 dark:bg-red-500 rounded-full"></span>
                  </div>
                ) : (
                  <Mic size={18} />
                )}
              </button>

              <button
                onClick={() => {
                  if (isListening) stopListening();
                  handleSend();
                }}
                disabled={!input.trim()}
                className={`p-2 rounded-lg flex items-center justify-center transition-all self-end mb-0.5 ${
                  input.trim()
                    ? 'bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 text-white shadow-md transform hover:scale-105'
                    : 'bg-gray-100 dark:bg-[#1F2937] text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send size={16} className={input.trim() ? 'ml-0.5' : ''} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
