import React from 'react';

interface XpaidLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  variant?: 'square' | 'rounded' | 'flat';
}

export const XpaidLogo: React.FC<XpaidLogoProps> = ({
  className = 'w-9 h-9',
  showText = false,
  textColor = 'text-zinc-900',
  variant = 'rounded',
}) => {
  const roundedClass = 
    variant === 'rounded' ? 'rounded-xl' :
    variant === 'square' ? 'rounded-none' : 'rounded-lg';

  return (
    <div className={`flex items-center gap-2.5 ${className ? '' : ''}`}>
      {/* Black badge containing the iconic white geometric XP glyph */}
      <div 
        className={`relative aspect-square flex items-center justify-center bg-black text-white p-1 overflow-hidden shadow-sm border border-zinc-800 ${roundedClass} ${className}`}
        style={{ minWidth: typeof className === 'string' && className.includes('w-') ? undefined : 36 }}
      >
        <svg 
          viewBox="0 0 500 500" 
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Black background */}
          <rect width="500" height="500" fill="#000000" />
          
          <g stroke="#FFFFFF" strokeWidth="18" strokeLinecap="square" strokeLinejoin="miter">
            {/* Left glyph: Stylized hollow 'X' */}
            {/* Top-left to bottom-right band */}
            <polygon 
              points="55,165 110,165 220,335 165,335" 
              fill="#000000" 
              stroke="#FFFFFF" 
              strokeWidth="18" 
            />
            {/* Top-right to bottom-left band */}
            <polygon 
              points="215,165 160,165 50,335 105,335" 
              fill="#000000" 
              stroke="#FFFFFF" 
              strokeWidth="18" 
            />

            {/* Right glyph: Stylized financial 'P' with top vertical tab, rounded upper arch, inner slot, and slanted stem */}
            <path 
              d="
                M 305 92 
                L 390 92 
                L 360 142 
                L 390 142 
                C 450 142 458 190 458 226 
                C 458 290 412 328 348 328 
                L 288 328 
                L 248 408 
                L 292 408 
                L 322 342 
                L 348 342 
                C 438 342 492 296 492 226 
                C 492 128 420 92 348 92 
                Z
              " 
              fill="#000000" 
              stroke="#FFFFFF" 
              strokeWidth="18" 
            />
            
            {/* Inner loop of P */}
            <path 
              d="
                M 300 240 
                L 360 240 
                C 395 240 405 225 405 210 
                C 405 195 395 180 360 180 
                L 315 180 
                Z
              " 
              fill="#000000" 
              stroke="#FFFFFF" 
              strokeWidth="14" 
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-black tracking-tight ${textColor}`}>
              Xpaid
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Protocol
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
