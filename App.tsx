import React, { useState, useEffect } from 'react';
import { getGeminiResponse } from './services/geminiService';
import FirePit from './components/FirePit';
import PaperInput from './components/PaperInput';
import AshesResponse from './components/AshesResponse';
import { IncineratorState, Message } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<IncineratorState>(IncineratorState.IDLE);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  
  // We keep a minimal history just for user context if needed, but visually we focus on the "now"
  // To truly follow the concept, we might not even show history, just the current burning process.
  // The prompt asks for an "Emotion Incinerator", implying the inputs are destroyed.
  
  const handleBurn = async (text: string) => {
    setState(IncineratorState.BURNING);
    setLastResponse(null); // Clear previous response visually

    // Simulate burning time + API call overlap
    // Minimum 2 seconds of burning animation for effect
    const minBurnTime = new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      const [aiResponse] = await Promise.all([
        getGeminiResponse(text),
        minBurnTime
      ]);
      
      setLastResponse(aiResponse);
      setState(IncineratorState.COOLING);
      
      // After reading, user can burn again. 
      // We don't auto-reset immediately, let them read the comfort message.
    } catch (error) {
      console.error(error);
      setLastResponse("재가 너무 많이 날려서 잠시 앞이 안 보이네요. 다시 시도해 주세요.");
      setState(IncineratorState.COOLING);
    }
  };

  const handleReset = () => {
    setState(IncineratorState.IDLE);
    setLastResponse(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-between py-6 px-4 relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 opacity-80"></div>
        {/* Subtle noise texture could go here if using images, but skipping for CSS only */}
      </div>

      {/* Header */}
      <header className="z-10 mt-4 text-center">
        <h1 className="text-3xl font-bold text-neutral-200 tracking-widest drop-shadow-md">
          <span className="text-orange-700 mr-2">🔥</span>
          감정 소각장
        </h1>
        <p className="text-neutral-500 text-sm mt-2 font-light">
          당신의 무거운 마음을 이곳에 태워 보내세요.
        </p>
      </header>

      {/* Main Interaction Area */}
      <main className="w-full max-w-lg z-10 flex-grow flex flex-col justify-center">
        
        {/* The Fire */}
        <div className="mb-4">
           <FirePit state={state} />
        </div>

        {/* The Input (Paper) or Response (Ash) */}
        <div className="relative min-h-[200px]">
           {state === IncineratorState.IDLE && (
              <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
                 <PaperInput onBurn={handleBurn} state={state} />
              </div>
           )}

           {state === IncineratorState.BURNING && (
             <div className="text-center mt-8 animate-pulse text-orange-400 font-light tracking-widest">
               나쁜 감정을 태우는 중...
             </div>
           )}

           {state === IncineratorState.COOLING && lastResponse && (
             <div className="flex flex-col items-center">
               <AshesResponse text={lastResponse} />
               
               <button 
                 onClick={handleReset}
                 className="mt-8 text-neutral-500 hover:text-neutral-300 text-sm border-b border-transparent hover:border-neutral-500 transition-all pb-0.5"
               >
                 다른 고민도 태우기
               </button>
             </div>
           )}
        </div>

      </main>

      {/* Footer */}
      <footer className="z-10 text-neutral-700 text-xs mt-6 text-center">
        <p>기록되지 않고 모두 사라집니다.</p>
        <p className="mt-1 opacity-50">Emotion Incinerator</p>
      </footer>
    </div>
  );
};

export default App;