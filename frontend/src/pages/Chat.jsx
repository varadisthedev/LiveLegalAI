import { useState } from 'react';
import { Search, Share, Download, Paperclip, Image as ImageIcon, Mic, Send, Bot } from 'lucide-react';
import AppLayout from '../components/AppLayout';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I've completed the initial scan of the uploaded employment contract. I've identified several key areas that require your attention, specifically regarding the intellectual property assignment and the non-compete duration.\n\nWould you like me to generate a summary of the liability clauses first?"
    },
    {
      id: 2,
      sender: 'user',
      text: "Yes, please. Also, check if there are any non-compete sections that seem overly broad for the California jurisdiction.",
      attachment: { name: 'employment_contract_v2.pdf', size: '1.2 MB' }
    },
    {
      id: 3,
      sender: 'ai',
      text: "Searching database for California labor law precedents...",
      issue: {
        title: "POTENTIAL ISSUE FOUND",
        subtitle: "Section 4.2: Post-Employment Restriction",
        desc: "The 24-month duration and the broad geographical scope (Global) defined in this clause are likely unenforceable under CA Bus. & Prof. Code § 16600."
      }
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'user', text: input }]);
    setInput('');
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] sm:h-full relative">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-[#1F2937] gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-orange-200 border-2 border-gray-50 dark:border-[#0F111A]" />
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-gray-50 dark:border-[#0F111A] flex items-center justify-center text-white z-10">
                <Bot size={14} />
              </div>
            </div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
              Active Case: <span className="text-blue-600 dark:text-blue-500 hover:underline cursor-pointer">Employment_Contract_v2.pdf</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <Search size={18} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
            <Share size={18} className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
            <div className="w-px h-6 bg-gray-300 dark:bg-[#1F2937] mx-1" />
            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-white dark:hover:bg-gray-100 text-gray-900 dark:text-[#0F111A] font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-32 space-y-8 pr-2 sm:pr-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                {msg.sender === 'user' ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-200" />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] flex items-center justify-center text-blue-600 dark:text-blue-500 shadow-sm dark:shadow-soft">
                    <Bot size={14} className="sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.sender === 'ai' && <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1 ml-1">LegalDoc AI</div>}
                {msg.sender === 'user' && <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1 mr-1">You</div>}
                
                <div className={`rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-soft text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 dark:bg-[#1C36A4] text-white rounded-tr-none' 
                    : 'bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] text-gray-700 dark:text-gray-300 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Issue Box for AI */}
                  {msg.issue && (
                    <div className="mt-4 bg-amber-50 dark:bg-[#0F111A] border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span className="text-[10px] font-bold tracking-widest uppercase">{msg.issue.title}</span>
                      </div>
                      <h4 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-wide mb-1.5">{msg.issue.subtitle}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{msg.issue.desc}</p>
                    </div>
                  )}
                </div>

                {/* Attachment Badge */}
                {msg.attachment && (
                  <div className="mt-2 flex items-center gap-2 bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] px-3 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 font-medium shadow-sm">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    {msg.attachment.name} <span className="text-gray-400 dark:text-gray-600 font-bold ml-1">{msg.attachment.size}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 left-0 right-0 pt-4 pb-2 bg-gradient-to-t from-gray-50 via-gray-50 dark:from-[#0F111A] dark:via-[#0F111A] to-transparent">
          <div className="bg-white dark:bg-[#151822] border border-gray-200 dark:border-[#1F2937] rounded-xl flex items-center p-2 shadow-lg dark:shadow-[0_-10px_40px_rgba(15,17,26,0.9)] relative pr-2 sm:pr-3 mx-2 sm:mx-0">
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
              <Paperclip size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button className="hidden sm:block p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
              <ImageIcon size={20} />
            </button>
            
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-0 px-2 placeholder-gray-400 dark:placeholder-gray-600"
            />
            
            <button className="hidden sm:block p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
              <Mic size={18} />
            </button>
            <button 
              onClick={handleSend}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 dark:bg-[#1C36A4] hover:bg-blue-700 dark:hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-md ml-1"
            >
              <Send size={14} className="sm:w-4 sm:h-4 ml-0.5" />
            </button>
          </div>
          
          <div className="text-center mt-3 px-4">
            <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">AI-generated legal advice should be reviewed by a professional. © 2024 LegalDoc Advisor.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
