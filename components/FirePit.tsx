import React from 'react';
import { IncineratorState } from '../types';

interface FirePitProps {
  state: IncineratorState;
}

const FirePit: React.FC<FirePitProps> = ({ state }) => {
  const isBurning = state === IncineratorState.BURNING;

  return (
    <div className="relative w-full h-64 flex justify-center items-end overflow-hidden pointer-events-none select-none">
      {/* Glow effect */}
      <div className={`absolute bottom-0 w-full h-32 bg-gradient-to-t from-orange-900/40 to-transparent transition-opacity duration-1000 ${isBurning ? 'opacity-100' : 'opacity-40'}`} />
      
      {/* Central Fire SVG */}
      <div className={`transition-all duration-700 transform origin-bottom ${isBurning ? 'scale-125 brightness-125' : 'scale-100 brightness-75 opacity-80'}`}>
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 drop-shadow-[0_0_15px_rgba(255,100,0,0.6)]"
        >
          {/* Back flames */}
          <path
            d="M60 180 Q80 100 70 80 Q90 120 100 60 Q120 120 130 90 Q120 160 140 180 Z"
            fill="#c2410c"
            className="flame-anim"
            style={{ animationDelay: '0s', opacity: 0.8 }}
          />
          {/* Middle flames */}
          <path
            d="M70 180 Q90 110 85 90 Q100 130 110 80 Q120 140 130 180 Z"
            fill="#ea580c"
            className="flame-anim"
            style={{ animationDelay: '0.3s', opacity: 0.9 }}
          />
          {/* Front flames */}
          <path
            d="M80 180 Q100 120 95 100 Q105 140 115 110 Q115 150 120 180 Z"
            fill="#fb923c"
            className="flame-anim"
            style={{ animationDelay: '0.6s' }}
          />
        </svg>
      </div>

      {/* Embers particles - purely decorative CSS */}
      {isBurning && (
        <div className="absolute inset-0 w-full h-full">
          {[...Array(10)].map((_, i) => (
             <div 
               key={i} 
               className="ember" 
               style={{ 
                 left: `${40 + Math.random() * 20}%`, 
                 bottom: '20px',
                 animationDuration: `${2 + Math.random()}s`,
                 animationDelay: `${Math.random()}s`
               }} 
             />
          ))}
        </div>
      )}
      
      {/* Furnace Grid/Door outline */}
      <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-black to-transparent z-10"></div>
    </div>
  );
};

export default FirePit;