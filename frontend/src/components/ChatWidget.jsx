import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Paperclip, ChevronDown, RefreshCw } from 'lucide-react';

export default function ChatWidget({ documentName = "Document" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I've analyzed "${documentName}". What would you like to know? You can ask me to summarize it, find specific clauses, or identify risks.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "I'm analyzing that query for you...";
      
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('summar') || lowerInput.includes('summary')) {
        aiResponse = "Here's a quick summary: This document is a standard agreement that sets out the terms of engagement. It includes clauses on confidentiality, payment terms, and termination rights. I noted that the non-compete clause seems unusually long (24 months).";
      } else if (lowerInput.includes('doubt') || lowerInput.includes('risk') || lowerInput.includes('issue')) {
        aiResponse = "Based on my analysis, the main risks are:\n1. Non-compete duration is 24 months.\n2. Broad Intellectual Property assignment clause.\n3. Automatic renewal without prior notice.";
      } else {
        aiResponse = "Based on the document context, I found relevant information regarding your query. The terms specify that all modifications must be made in writing.";
      }

      setMessages((prev) => [...prev, { id: Date.now(), sender: 'ai', text: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 z-50 group"
        aria-label="Open AI Assistant"
      >
        <MessageSquare size={24} />
        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask AI Assistant
          <div className="absolute top-1/2 left-full -translate-y-1/2 -translate-x-1 border-4 border-transparent border-l-gray-900 dark:border-l-white" />
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 w-[calc(100vw-32px)] sm:w-[380px] bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-2xl shadow-xl dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isMinimized ? 'h-[60px]' : 'h-[550px] max-h-[80vh]'}`}>
      
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#1F2937] cursor-pointer bg-gray-50 dark:bg-[#1A1D27] rounded-t-2xl hover:bg-gray-100 dark:hover:bg-[#1F2432] transition-colors"
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
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">LegalDoc AI</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Analyzing: {documentName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-[#2A3143] transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
          >
            <ChevronDown size={18} className={`transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
          <button 
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-white dark:bg-[#0F111A]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
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
                <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 dark:bg-[#1C36A4] text-white rounded-tr-sm' 
                    : 'bg-gray-50 dark:bg-[#151822] border border-gray-100 dark:border-[#1F2937] text-gray-800 dark:text-gray-200 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 max-w-[90%]">
                 <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center border border-gray-200 dark:border-gray-700 mt-1">
                    <Bot size={12} />
                 </div>
                 <div className="bg-gray-50 dark:bg-[#151822] border border-gray-100 dark:border-[#1F2937] p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10 w-16 justify-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Buttons */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none bg-white dark:bg-[#0F111A]">
              <button 
                onClick={() => { setInput("Can you summarize this document for me?"); }}
                className="flex-shrink-0 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 rounded-full text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap"
              >
                Summarize Document
              </button>
              <button 
                onClick={() => { setInput("What are the key risks or doubts in this document?"); }}
                className="flex-shrink-0 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-500/20 rounded-full text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors whitespace-nowrap"
              >
                Identify Risks
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-[#151822] border-t border-gray-100 dark:border-[#1F2937] rounded-b-2xl">
            <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-[#0F111A] border border-gray-200 dark:border-[#1F2937] p-1.5 rounded-xl focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-inner">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors self-end mb-0.5">
                <Paperclip size={18} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask AI anything about this document..."
                className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-0 py-2.5 px-1 resize-none placeholder-gray-400 dark:placeholder-gray-500 scrollbar-thin"
                rows={1}
              />
              <button 
                onClick={handleSend}
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
