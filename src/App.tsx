import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender } from './types';
import ChatMessageBubble from './components/ChatMessageBubble';
import ChatInput from './components/ChatInput';
import { sendMessageStream, resetChat } from './services/geminiService';
import { MessageSquare, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      text: "Hello! I am your bilingual assistant. I can speak English and Mon. How can I help you today?\n\nမင်္ဂလာပါ! အဲကျွန် ဂွံရီုဗင် ဘာသာမန် ကဵု အင်္ဂလိက် ၜါဘာသာရ။ မုဂွံရီုဗင်ကဵုရော?",
      sender: Sender.BOT,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: Sender.USER,
      timestamp: new Date(),
    };

    // Capture current history BEFORE updating state to pass to the API
    const currentHistory = [...messages];

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create a placeholder for the bot response
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      text: '', // Start empty
      sender: Sender.BOT,
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, botMessagePlaceholder]);

    try {
      // Pass text AND history to the service
      await sendMessageStream(text, currentHistory, (streamedText) => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, text: streamedText } 
              : msg
          )
        );
      });
      
      // Finalize the message state
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { 
                ...msg, 
                text: "Sorry, I encountered an error while connecting to the server. Please ensure the server is running and try again.\n\nဂွံအာလောတ်ရ၊ ဒုင်ဂုဏ်ရ။ ဆက်ဆောံကဵုအဲမွဲဝါပၠန်ညိ။",
                isError: true, 
                isStreaming: false 
              } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear the conversation?")) {
      resetChat();
      setMessages([{
        id: Date.now().toString(),
        text: "Conversation cleared. I'm ready to help in English or Mon.\n\nတက်ကျာဂှ် ပလီုထောံယျ။ အဲဂွံရီုဗင် ပ္ဍဲဘာသာအင်္ဂလိက် ကဵု မန် ရ။",
        sender: Sender.BOT,
        timestamp: new Date(),
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shadow-md rounded-xl overflow-hidden shrink-0">
               <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <rect width="100" height="100" fill="#2563EB" />
                  <text 
                    x="50" 
                    y="52" 
                    fontFamily="sans-serif" 
                    fontWeight="bold" 
                    fontSize="52" 
                    fill="white" 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    letterSpacing="-1"
                  >
                    MT
                  </text>
               </svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">Mon-English Chat</h1>
              <p className="text-xs text-slate-500 font-medium">ချက်ပေါတ် မန်-အင်္ဂလိက်</p>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Start New Chat"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col min-h-full">
          {messages.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 mt-20">
                <MessageSquare size={64} strokeWidth={1.5} />
                <p>Start a conversation...</p>
             </div>
          )}
          
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

export default App;