
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Send } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">A</div>}
            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
               <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">U</div>}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">A</div>
              <div className="max-w-md p-3 rounded-lg bg-gray-100 text-gray-800">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="추가 질문을 입력하세요..."
          className="flex-grow px-4 py-2 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
