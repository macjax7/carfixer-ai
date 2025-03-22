
import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AIChat from '../components/AIChat';

const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header title="CarFix AI" showBackButton={true} />
      
      <main className="flex-1 overflow-hidden">
        <AIChat />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Chat;
