import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSend(input);
    setInput('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <div className="border-t border-slate-200 bg-white sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 pb-6 sm:py-6 relative">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type a message in English or Mon (ဘာသာမန်)..."
            className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-[150px] py-3 px-2 text-slate-800 placeholder:text-slate-400 text-sm sm:text-base leading-relaxed"
            rows={1}
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`flex-shrink-0 p-3 rounded-lg mb-1 transition-all duration-200 ${
              !input.trim() || disabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95'
            }`}
          >
            {disabled ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2">
          @ 2025 DEVELOPED BY NSUMON
        </p>
      </div>
    </div>
  );
};

export default ChatInput;