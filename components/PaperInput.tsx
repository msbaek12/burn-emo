import React, { useState, useRef, useEffect } from 'react';
import { IncineratorState } from '../types';

interface PaperInputProps {
  onBurn: (text: string) => void;
  state: IncineratorState;
}

const PaperInput: React.FC<PaperInputProps> = ({ onBurn, state }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onBurn(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Focus back when idle
  useEffect(() => {
    if (state === IncineratorState.IDLE) {
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 100); // Slight delay for animation to finish
    }
  }, [state]);

  const isDisabled = state !== IncineratorState.IDLE;

  return (
    <div className="relative w-full max-w-md mx-auto z-20">
      <div 
        className={`
            relative bg-neutral-200 text-neutral-800 p-1 shadow-lg transform transition-all duration-700
            ${isDisabled ? 'translate-y-24 opacity-0 scale-75 rotate-3 grayscale' : 'translate-y-0 opacity-100 scale-100 rotate-0'}
        `}
        style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)', // Slight dog-ear
            minHeight: '140px'
        }}
      >
        <div className="h-full border-2 border-dashed border-neutral-400 p-4 flex flex-col">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="여기에 태워버리고 싶은 생각이나 감정을 적어주세요..."
                className="w-full flex-grow bg-transparent resize-none outline-none placeholder-neutral-500 font-medium text-lg leading-relaxed"
                disabled={isDisabled}
                rows={3}
            />
            <div className="flex justify-end mt-2">
                <button
                    onClick={handleSubmit}
                    disabled={isDisabled || !text.trim()}
                    className={`
                        px-4 py-1.5 rounded-full text-sm font-bold tracking-wide transition-colors
                        ${!text.trim() ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-500 hover:shadow-[0_0_10px_rgba(234,88,12,0.5)]'}
                    `}
                >
                    소각하기 🔥
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaperInput;