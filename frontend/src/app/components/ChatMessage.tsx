import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`py-4 ${message.type === 'ai' ? 'bg-gray-900' : 'bg-black'}`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex space-x-3">
          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            message.type === 'ai' ? 'bg-neon-green text-black' : 'bg-gray-700 text-white'
          }`}>
            {message.type === 'ai' ? 'AI' : 'U'}
          </div>
          <div className="flex-1">
            <div className="text-gray-300 whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;