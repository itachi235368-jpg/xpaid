import React from 'react';

interface CleanAmbientBackgroundProps {
  interactive?: boolean;
}

export const FloatingCoinsBackground: React.FC<CleanAmbientBackgroundProps> = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Ambient Tipped Cyan / Teal Aura */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20 dark:opacity-15 blur-[140px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(5, 194, 214, 0.35) 0%, rgba(2, 141, 159, 0.2) 45%, rgba(16, 62, 72, 0.1) 70%, transparent 90%)'
        }}
      />

      {/* 2. Secondary Emerald / Cyan Ambient Glow on left */}
      <div 
        className="absolute top-1/4 -left-28 w-[500px] h-[500px] rounded-full opacity-15 dark:opacity-10 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 80%)'
        }}
      />

      {/* 3. Subtle bottom-right ambient glow */}
      <div 
        className="absolute bottom-1/3 -right-28 w-[550px] h-[550px] rounded-full opacity-15 dark:opacity-10 blur-[130px]"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 80%)'
        }}
      />

      {/* 4. Architectural dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(rgba(5, 194, 214, 0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};
