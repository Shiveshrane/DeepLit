import React, { useState } from 'react';
import { useChatApi } from '../hooks/useChatApi';
import { useChatContext } from '../context/ChatContext';

const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { analyzeWithAI, error } = useChatApi();
  const { loading, currentPaper } = useChatContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const question = input;
    setInput('');
    await analyzeWithAI(question);
  };

  return (
    <div className="border-t border-gray-800 bg-black p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-900 rounded-md text-white">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              currentPaper 
                ? "Ask a question about this paper..." 
                : "Please select a paper first"
            }
            disabled={!currentPaper || loading}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white resize-none focus:outline-none focus:border-neon-green"
            rows={3}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !currentPaper}
            className="absolute bottom-3 right-3 px-4 py-2 bg-neon-green text-black rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;