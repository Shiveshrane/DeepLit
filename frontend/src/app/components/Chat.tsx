import React, { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import PaperSearch from './PaperSearch';
import PaperInfo from './PaperInfo';
import { Paper, PaperContent } from '../types';
import { fetchPaperContent } from '../utils/api';

const Chat: React.FC = () => {
  const { currentConversation, currentPaper, setCurrentPaper, setLoading } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleSelectPaper = async (paper: Paper) => {
    try {
      setLoading(true);
      const paperContent = await fetchPaperContent(paper.id);
      setCurrentPaper(paperContent);
    } catch (error) {
      console.error('Error fetching paper content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-4 px-4">
          <PaperSearch onSelectPaper={handleSelectPaper} />
          
          {currentPaper && <PaperInfo paper={currentPaper} />}
          
          {currentConversation?.messages.length === 0 ? (
            <div className="py-8 text-center">
              <h2 className="text-2xl font-bold text-neon-green mb-2">AI Research Assistant</h2>
              <p className="text-gray-400">
                Search for a paper and start asking questions about it.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentConversation?.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      <ChatInput />
    </div>
  );
};

export default Chat;