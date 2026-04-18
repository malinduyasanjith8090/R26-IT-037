// components/TracingCanvas.tsx (Wrapper that chooses between English and Sinhala)
import React from 'react';
import TracingCanvasEnglish from './TracingCanvasEnglish';
import TracingCanvasSinhala from './TracingCanvasSinhala';

interface TracingGameProps {
  type: 'letters' | 'numbers' | 'sinhala';
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export default function TracingGame({ type, onComplete, onProgress }: TracingGameProps) {
  // For Sinhala letters
  if (type === 'sinhala') {
    return (
      <TracingCanvasSinhala 
        type={'letters'} 
        onComplete={onComplete} 
        onProgress={onProgress} 
      />
    );
  }
  
  // For English letters and numbers
  return (
    <TracingCanvasEnglish 
      type={type} 
      onComplete={onComplete} 
      onProgress={onProgress} 
    />
  );
}