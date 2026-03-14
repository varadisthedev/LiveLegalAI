import { Bot } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  // Simple markdown-like rendering for bold (**text**)
  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
          <Bot size={14} className="text-blue-600" />
        </div>
      )}
      {isUser && (
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-white text-xs font-bold">J</span>
        </div>
      )}

      <div className={`max-w-[75%] sm:max-w-[65%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
            }
          `}
        >
          {renderContent(message.content)}
        </div>
        <span className="text-xs text-gray-400 px-1">{message.timestamp}</span>
      </div>
    </div>
  );
}
