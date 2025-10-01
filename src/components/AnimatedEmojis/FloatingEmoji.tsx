import React from 'react';
import './FloatingEmoji.css';

interface FloatingEmojiProps {
  emoji: string;
  size?: number;
  delay?: number;
  duration?: number;
  left?: string;
  top?: string;
}

const FloatingEmoji: React.FC<FloatingEmojiProps> = ({ 
  emoji, 
  size = 60, 
  delay = 0, 
  duration = 20,
  left = '10%',
  top = '20%'
}) => {
  return (
    <div 
      className="floating-emoji"
      style={{
        fontSize: `${size}px`,
        left,
        top,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {emoji}
    </div>
  );
};

export default FloatingEmoji;
