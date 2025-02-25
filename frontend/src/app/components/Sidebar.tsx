import React from 'react';
import { useChatContext } from '../context/ChatContext';
import ConversationList from './ConversationList';

const Sidebar: React.FC = () => {
  const { createNewConversation } = useChatContext();

  return (
    <div className="flex flex-col h-full w-64 bg-black border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <button 
          onClick={createNewConversation}
          className="w-full py-2 px-4 bg-gray-900 hover:bg-gray-800 text-neon-green rounded-md flex items-center justify-center"
        >
          <span className="mr-2">+</span> New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ConversationList />
      </div>
    </div>
  );
};

export default Sidebar;