
import React, { memo } from 'react';
import SimpleChatContainer from './chat/SimpleChatContainer';

const AIChat: React.FC = () => {
  return (
    <div className="h-full">
      <SimpleChatContainer />
    </div>
  );
};

export default memo(AIChat);
