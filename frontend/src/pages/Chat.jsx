import { useState, useEffect, useRef } from 'react';
import { Search, Share, Download, Paperclip, Image as ImageIcon, Mic, Send, Bot, Volume2, VolumeX, Loader2, Sparkles, User, Languages, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import AppLayout from '../components/AppLayout';
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
  blue:    { card: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  purple:  { card: 'bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  emerald: { card: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
};async function fetchAIResponse(documentId, question, formatValue, languageCode, sessionId, userId) {
  try {
    const response = await fetch(apiUrl('/api/chat/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId || 'user_12345'
      },
      body: JSON.stringify({
        document_id: documentId,
        question: question,
        format: formatValue,
        language: languageCode === 'hi-IN' ? 'hi' : 'en',
        session_id: sessionId
      })
    });

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get answer');
    }
  } catch (err) {
    console.error('Chat API Error:', err);
    return {
      answer: "I'm sorry, I'm having trouble connecting to the legal analysis engine. Please try again later.",
      session_id: sessionId
    };
  }
}

export default function Chat() {
  const { id: documentId } = useParams();
  const { user } = useUser();
  const [messages,     setMessages]     = useState([]);  
  const [input,        setInput]        = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview,  setFilePreview]  = useState(null);
  const [isTyping,     setIsTyping]     = useState(false);
  const [pendingQuery, setPendingQuery] = useState(null);
  const [language,     setLanguage]     = useState('en-US');
  const [sessionId,    setSessionId]    = useState(null);
  const [documentName, setDocumentName] = useState('Active Document');
  const fileInputRef   = useRef(null);

  const { speak, isSpeaking, isMuted, toggleMute, usingFallback, ttsError } = useTTS(language);
  const { isListening, transcript, startListening, stopListening, hasSupport } = useSTT(language);

  const isEmpty = messages.length === 0;

  // Sync transcription to input when active
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  // Fetch document details on mount
  useEffect(() => {
    const fetchDocDetails = async () => {
      if (!documentId) return;
      try {
        const res = await fetch(apiUrl('/api/document/history'), {
           headers: { 'x-user-id': user?.id || 'user_12345' }
        });
        const data = await res.json();
        if (data.success) {
          const doc = data.data.find(d => d.documentId === documentId);
          if (doc) setDocumentName(doc.originalName);
        }
      } catch (err) {
        console.error('Failed to fetch doc details:', err);
      }
    };
    if (user) fetchDocDetails();
  }, [user, documentId]);

  // Handle Mic toggle
  const handleMicToggle = () => {
    if (!hasSupport) {
      alert("Microphone access is not supported or permitted in this browser.");
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /** Adds an AI message and speaks it */
  const addAIMessage = (text, extra = {}) => {
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'ai', text, ...extra }]);
    speak(text);
  };

  /** User taps one of the 3 format cards */
  const handleFormatPick = async (formatValue, formatLabel) => {
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: formatLabel }]);
    setIsTyping(true);

    const query = pendingQuery || 'Please overview this document.';
    setPendingQuery(null);

    const result = await fetchAIResponse(documentId, query, formatValue, language, sessionId, user?.id);
    
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
    if(filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  /** User types a custom question → show format picker first */
  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;
    const query = input.trim();
    setInput('');

    // Prepend a little marker if a file was attached. (In a real backend, payload.file = selectedFile)
    const displayQuery = selectedFile ? `[Attached: ${selectedFile.name}]\n${query}` : query;
    removeFile(); 

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: displayQuery }]);
    setIsTyping(true);
    setPendingQuery(query);

    setTimeout(() => {
      addAIMessage('How would you like the answer?', { showFormatPicker: true });
      setIsTyping(false);
    }, 800);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] sm:h-full relative">

        {/* ── Top Bar ── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-[#1F2937] gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-orange-200 border-2 border-gray-50 dark:border-[#0F111A]" />
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-gray-50 dark:border-[#0F111A] flex items-center justify-center text-white z-10">
                <Bot size={14} />
              </div>
            </div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
              Active Case: <span className="text-blue-600 dark:text-blue-500 hover:underline cursor-pointer">{documentName}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            {/* Language toggle */}
            <div className="relative group mr-1">
              <button
                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors bg-gray-100 dark:bg-[#1A1D27] border-gray-200 dark:border-[#1F2937] text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400"
                 title="Change Language"
              >
                <Languages size={14} />
                {language === 'hi-IN' ? 'हिन्दी' : 'English'}
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

            {/* Browser fallback badge */}
            {usingFallback && (
              <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-500/30 whitespace-nowrap">
                🔊 Browser Voice
              </span>
            )}
            {/* Voice toggle pill */}
            <button
              id="chat-page-voice-toggle"
              onClick={toggleMute}
              title={isMuted ? 'Voice muted — click to enable' : 'Voice on — click to mute'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isMuted
                  ? 'bg-gray-100 dark:bg-[#1A1D27] border-gray-200 dark:border-[#1F2937] text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500'
                  : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
              }`}
            >
              {isSpeaking && !isMuted
                ? <Loader2 size={14} className="animate-spin" />
                : isMuted
                  ? <VolumeX size={14} />
                  : <Volume2 size={14} />
              }
              {isMuted ? 'Voice Off' : 'Voice On'}
            </button>

            <Search size={18} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
            <Share  size={18} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
            <div className="w-px h-6 bg-gray-300 dark:bg-[#1F2937] mx-1" />
            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-white dark:hover:bg-gray-100 text-gray-900 dark:text-[#0F111A] font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* ── TTS error banner ── */}
        {ttsError && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
            ⚠ Voice error: {ttsError}
          </div>
        )}

        {/* ── Muted notice ── */}
        {isMuted && (
          <div className="mb-4 px-4 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-center gap-2">
            <VolumeX size={14} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              Voice is muted. Speech is still generated — click <strong>Voice Off</strong> to hear it.
            </p>
          </div>
        )}

        {/* ── Chat / Welcome area ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-32 pr-2 sm:pr-4">

          {/* Empty state — 3 format option cards */}
          {isEmpty && (
            <div className="flex flex-col items-center pt-8 px-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mb-4 shadow-sm">
                <Sparkles size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">How would you like your answer?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 max-w-sm">
                Choose a response format below. The AI will reply and read it aloud using ElevenLabs voice.
              </p>

              <div className="w-full max-w-lg space-y-3">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFormatPick(opt.value, opt.label)}
                    className={`w-full flex items-start gap-4 px-5 py-4 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm ${COLOR_MAP[opt.color].card}`}
                  >
                    <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${COLOR_MAP[opt.color].dot}`} />
                    <div>
                      <p className="text-[15px] font-bold leading-tight">{opt.label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {!isEmpty && (
            <div className="space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {msg.sender === 'user' ? (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-200" />
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] flex items-center justify-center text-blue-600 dark:text-blue-500 shadow-sm">
                        <Bot size={14} />
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.sender === 'ai'   && <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1 ml-1">LegalDoc AI</div>}
                    {msg.sender === 'user' && <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1 mr-1">You</div>}

                    <div className={`rounded-2xl p-4 sm:p-5 shadow-sm text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 dark:bg-[#1C36A4] text-white rounded-tr-none'
                        : 'bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] text-gray-700 dark:text-gray-300 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Inline format picker for typed follow-up */}
                      {msg.showFormatPicker && (
                        <div className="flex flex-col gap-2 mt-4">
                          {FORMAT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleFormatPick(opt.value, opt.label)}
                              className="text-left px-4 py-2.5 bg-gray-50 dark:bg-[#0F111A] hover:bg-blue-50 dark:hover:bg-[#1F2432] text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-xl border border-blue-100 dark:border-blue-500/20 transition-colors shadow-sm"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] flex items-center justify-center text-blue-600 dark:text-blue-500 shadow-sm mt-1 flex-shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom input ── */}
        <div className="absolute bottom-0 left-0 right-0 pt-4 pb-2 bg-gradient-to-t from-gray-50 via-gray-50 dark:from-[#0F111A] dark:via-[#0F111A] to-transparent">
          {filePreview && (
            <div className="mb-2 ml-4 sm:ml-2 relative inline-block">
              <img src={filePreview} alt="upload preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
              <button onClick={removeFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm">
                <X size={12} />
              </button>
            </div>
          )}
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl flex items-center p-2 shadow-lg dark:shadow-[0_-10px_40px_rgba(15,17,26,0.9)] relative pr-2 sm:pr-3 mx-2 sm:mx-0">
            <div className={`flex flex-1 items-end gap-2 bg-gray-50 dark:bg-[#0F111A] border ${isListening ? 'border-red-400 dark:border-red-500/50 ring-1 ring-red-400/30' : 'border-transparent focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'} p-1.5 rounded-xl transition-all shadow-inner w-full`}>
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
                <Paperclip size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="hidden sm:block p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                title="Attach Photo"
              >
                <ImageIcon size={20} />
              </button>

              <input
                type="text"
                placeholder={isListening ? (language === 'hi-IN' ? "सुन रहा हूँ..." : "Listening...") : (language === 'hi-IN' ? "हिंदी में पूछें..." : "Or type your own question…")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(isListening) stopListening();
                    handleSend();
                  }
                }}
                className="flex-1 bg-transparent border-none text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-0 px-2 placeholder-gray-400 dark:placeholder-gray-600 w-full"
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
                  if(isListening) stopListening();
                  handleSend();
                }}
                disabled={!input.trim()}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors shadow-md ml-1 self-end mb-0.5 ${
                  input.trim()
                  ? 'bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white transform hover:scale-105'
                  : 'bg-gray-100 dark:bg-[#1F2937] text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send size={14} className="sm:w-4 sm:h-4 ml-0.5" />
              </button>
            </div>
          </div>

          <div className="text-center mt-3 px-4">
            <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">AI-generated legal advice should be reviewed by a professional. © 2024 LegalDoc Advisor.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
