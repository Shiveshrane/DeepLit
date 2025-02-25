import React from 'react';
import { useChatContext } from '../context/ChatContext';

const ConversationList: React.FC = () => {
  const { conversations, currentConversation, selectConversation } = useChatContext();

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => selectConversation(conversation.id)}
          className={`w-full text-left p-3 rounded-md transition-colors ${
            currentConversation?.id === conversation.id
              ? 'bg-gray-800 text-neon-green'
              : 'hover:bg-gray-800 text-gray-300'
          }`}
        >
          <div className="truncate text-sm font-medium">
            {conversation.title || 'New Conversation'}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {new Date(conversation.updatedAt).toLocaleString()}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConversationList;