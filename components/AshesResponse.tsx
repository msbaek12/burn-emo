import React, { useEffect, useState } from 'react';

interface AshesResponseProps {
  text: string;
}

const AshesResponse: React.FC<AshesResponseProps> = ({ text }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500); // Delay slightly to appear after the "burn"
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div 
      className={`
        max-w-md mx-auto mt-6 p-6 rounded-lg border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm
        transition-all duration-1000 ease-out text-center
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className="mb-2 text-orange-500/50 text-2xl">❝</div>
      <p className="text-neutral-300 leading-relaxed whitespace-pre-line font-light">
        {text}
      </p>
      <div className="mt-2 text-orange-500/50 text-2xl">❞</div>
      
      <div className="mt-4 flex justify-center gap-2 opacity-30">
        <span className="w-1 h-1 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0s'}}></span>
        <span className="w-1 h-1 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0.2s'}}></span>
        <span className="w-1 h-1 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0.4s'}}></span>
      </div>
    </div>
  );
};

export default AshesResponse;