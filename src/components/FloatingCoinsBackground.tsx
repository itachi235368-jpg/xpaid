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
      {/* Top subtle radial gradient glow matching TIPPED teal/cyan brand */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-35 dark:opacity-20 blur-[130px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.4) 0%, rgba(13, 148, 136, 0.2) 40%, rgba(15, 23, 42, 0) 70%)'
        }}
      />

      {/* Subtle bottom-right ambient glow */}
      <div 
        className="absolute -bottom-40 right-[-10%] w-[600px] h-[400px] rounded-full opacity-20 dark:opacity-10 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(15, 23, 42, 0) 70%)'
        }}
      />

      {/* Ultra-faint architectural dot grid for depth & structure */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};
