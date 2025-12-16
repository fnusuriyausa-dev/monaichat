import React from 'react';
import { Message, Sender } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessageBubbleProps {
  message: Message;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* Bubble */}
        <div
          className={`relative p-4 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : message.isError 
                ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
          }`}
        >
          {message.isError && (
            <div className="flex items-center gap-2 mb-2 text-red-600 font-bold">
              <AlertCircle size={16} />
              <span>Error</span>
            </div>
          )}
          
          <div className={`text-sm leading-relaxed ${isUser ? 'prose-invert' : ''}`}>
             {isUser ? (
                <p className="whitespace-pre-wrap">{message.text}</p>
             ) : (
                <MarkdownRenderer content={message.text} className={isUser ? 'text-white' : 'text-slate-800'} />
             )}
          </div>
          
          <div className={`text-[10px] mt-2 opacity-70 ${isUser ? 'text-indigo-100 text-right' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;