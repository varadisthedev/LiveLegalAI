import { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

export default function InputBar({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your document..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 resize-none outline-none py-1.5 max-h-32 scrollbar-thin disabled:opacity-60"
          id="chat-input"
          aria-label="Chat input"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 flex items-center justify-center transition-all duration-200 active:scale-95 disabled:cursor-not-allowed flex-shrink-0 mb-0.5"
          aria-label="Send message"
          id="send-message-btn"
        >
          <Send size={14} className={`${value.trim() && !disabled ? 'text-white' : 'text-gray-400'}`} />
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center mt-2">
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
