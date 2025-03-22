
import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AIChat from '../components/AIChat';

const Chat: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="AI Assistant" showBackButton={true} />
      
      <main className="container max-w-md mx-auto px-4 py-2 pb-20">
        <AIChat />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Chat;
