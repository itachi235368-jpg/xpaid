import React from 'react';

interface TippedLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  variant?: 'badge' | 'mark';
}

export const TippedLogo: React.FC<TippedLogoProps> = ({
  className = 'w-9 h-9',
  showText = false,
  textColor = 'text-zinc-900 dark:text-white',
  variant = 'badge',
}) => {
  return (
    <div className="flex items-center gap-2.5">
      <div 
        className={`relative aspect-square flex items-center justify-center shrink-0 ${variant === 'badge' ? 'rounded-xl overflow-hidden shadow-md border border-cyan-500/20' : ''} ${className}`}
      >
        <svg 
          viewBox="0 0 1024 1024" 
          className="w-full h-full select-none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {variant === 'badge' && (
            <defs>
              {/* Cyan / Teal Ambient Glow Background matching uploaded logo */}
              <radialGradient id="tippedBgGradient" cx="82%" cy="86%" r="95%">
                <stop offset="0%" stopColor="#05c2d6" />
                <stop offset="30%" stopColor="#028d9f" />
                <stop offset="60%" stopColor="#103e48" />
                <stop offset="85%" stopColor="#16272e" />
                <stop offset="100%" stopColor="#121b20" />
              </radialGradient>
            </defs>
          )}

          {variant === 'badge' && (
            <rect width="1024" height="1024" fill="url(#tippedBgGradient)" />
          )}

          {/* 3D Isometric Speech Bubble Emblem */}
          <g transform="translate(0, 0)">
            {/* 1. Deep Black 3D Extrusion Shadow (Isometric block on left & bottom with tail) */}
            <path 
              d="
                M 346 172 
                L 835 172 
                L 835 558 
                L 592 801 
                L 346 801 
                L 346 935 
                L 182 795 
                L 182 300 
                Z
              " 
              fill="#000000" 
            />

            {/* 2. Crisp White Inner Speech Bubble with 45° chamfer and tail notch */}
            <path 
              d="
                M 386 226 
                L 783 226 
                L 783 536 
                L 572 746 
                L 468 746 
                L 468 820 
                L 386 746 
                Z
              " 
              fill="#FFFFFF" 
            />

            {/* 3. Heavy Athletic Black Letter 'T' with slab serifs on crossbar */}
            <path 
              d="
                M 424 258 
                L 745 258 
                L 745 376 
                L 662 376 
                L 662 334 
                L 624 334 
                L 624 682 
                L 506 682 
                L 506 334 
                L 468 334 
                L 468 376 
                L 424 376 
                Z
              " 
              fill="#000000" 
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-black tracking-tight font-['Outfit'] ${textColor}`}>
              TIPPED
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Protocol
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
