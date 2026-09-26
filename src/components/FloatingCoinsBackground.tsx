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
      {/* 1. Toxic Lime-Green Top Fart Gas Cloud */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[950px] h-[550px] rounded-full opacity-35 dark:opacity-25 blur-[140px] animate-gas-float"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(163, 230, 53, 0.45) 0%, rgba(34, 197, 94, 0.25) 45%, rgba(6, 182, 212, 0.1) 70%, transparent 90%)'
        }}
      />

      {/* 2. Secondary Toxic Emerald/Sulfur Puffs on left and right */}
      <div 
        className="absolute top-1/4 -left-28 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-15 blur-[120px] animate-puff-ripple"
        style={{
          background: 'radial-gradient(circle, rgba(132, 204, 22, 0.35) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 80%)'
        }}
      />

      <div 
        className="absolute bottom-1/3 -right-28 w-[550px] h-[550px] rounded-full opacity-25 dark:opacity-18 blur-[130px] animate-gas-float"
        style={{
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 80%)'
        }}
      />

      {/* 3. Subtle bottom-right ambient glow */}
      <div 
        className="absolute -bottom-40 right-[-10%] w-[650px] h-[450px] rounded-full opacity-25 dark:opacity-15 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(132, 204, 22, 0.2) 40%, rgba(15, 23, 42, 0) 75%)'
        }}
      />

      {/* 4. Rising Toxic Gas Bubble Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-30">
        {[
          { left: '12%', size: 'w-8 h-8', delay: '0s', duration: '14s' },
          { left: '28%', size: 'w-12 h-12', delay: '3s', duration: '18s' },
          { left: '46%', size: 'w-6 h-6', delay: '7s', duration: '12s' },
          { left: '68%', size: 'w-10 h-10', delay: '2s', duration: '16s' },
          { left: '84%', size: 'w-14 h-14', delay: '5s', duration: '20s' },
          { left: '92%', size: 'w-7 h-7', delay: '9s', duration: '13s' },
        ].map((bubble, i) => (
          <div
            key={i}
            className={`absolute bottom-[-50px] rounded-full bg-gradient-to-t from-lime-400/20 to-emerald-400/40 border border-lime-400/30 blur-[1px] ${bubble.size}`}
            style={{
              left: bubble.left,
              animation: `bubbleRise ${bubble.duration} linear infinite`,
              animationDelay: bubble.delay,
            }}
          />
        ))}
      </div>

      {/* 5. Ultra-faint architectural dot grid for cyber structure */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(rgba(163, 230, 53, 0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};
