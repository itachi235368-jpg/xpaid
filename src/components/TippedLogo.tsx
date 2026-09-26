import React from 'react';

interface TippedLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  variant?: 'badge' | 'mark' | 'white-card';
}

export const TippedLogo: React.FC<TippedLogoProps> = ({
  className = 'w-10 h-10',
  showText = false,
  textColor = 'text-slate-900 dark:text-white',
  variant = 'badge',
}) => {
  return (
    <div className="flex items-center gap-2.5">
      <div 
        className={`relative aspect-square flex items-center justify-center shrink-0 ${
          variant === 'badge' 
            ? 'rounded-2xl overflow-hidden shadow-lg border border-cyan-500/30' 
            : variant === 'white-card' 
            ? 'rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white' 
            : ''
        } ${className}`}
      >
        <img 
          src="/tipped-logo.svg" 
          alt="Tipped Logo" 
          className="w-full h-full object-cover select-none"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-black tracking-tight ${textColor} font-['Outfit']`}>
              TIP<span className="text-cyan-400">PED</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              PROTOCOL
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const FartPayLogo = TippedLogo;
