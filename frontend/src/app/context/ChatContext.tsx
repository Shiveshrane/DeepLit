import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, ChatMessage, PaperContent } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentPaper: PaperContent | null;
  setCurrentPaper: (paper: PaperContent | null) => void;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  addMessage: (content: string, type: 'human' | 'ai') => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentPaper, setCurrentPaper] = useState<PaperContent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null;

  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed);
      if (parsed.length > 0) {
        setCurrentConversationId(parsed[0].id);
      }
    } else {
      createNewConversation();
    }
  }, []);

  useEffect(() => {
    // Save conversations to localStorage
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const createNewConversation = () => {
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);

    if (currentPaper) {
      updateConversation(newId, { paperId: currentPaper.id });
    }
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, ...updates, updatedAt: new Date().toISOString() } 
          : conv
      )
    );
  };

  const addMessage = (content: string, type: 'human' | 'ai') => {
    if (!currentConversationId) return;

    const newMessage: ChatMessage = {
      id: uuidv4(),
      type,
      content,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId 
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              title: conv.messages.length === 0 && type === 'human' 
                ? content.slice(0, 30) + (content.length > 30 ? '...' : '') 
                : conv.title,
              updatedAt: new Date().toISOString(),
            } 
          : conv
      )
    );
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      currentPaper,
      setCurrentPaper,
      createNewConversation,
      selectConversation,
      addMessage,
      loading,
      setLoading,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};