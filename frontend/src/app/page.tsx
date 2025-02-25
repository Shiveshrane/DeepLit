'use client';

import React from 'react';
import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';

export default function Home() {
  return (
    <ChatProvider>
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Chat />
        </main>
      </div>
    </ChatProvider>
  );
}