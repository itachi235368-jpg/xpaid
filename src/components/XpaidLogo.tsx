import React from 'react';

export interface XpaidLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  variant?: 'square' | 'rounded' | 'flat' | 'badge' | 'mark' | 'white-card';
}

export const XpaidLogo: React.FC<XpaidLogoProps> = ({
  className = 'w-10 h-10',
  showText = false,
  textColor = 'text-slate-900 dark:text-white',
  variant = 'badge',
}) => {
  const getContainerClasses = () => {
    switch (variant) {
      case 'white-card':
        return 'rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white';
      case 'mark':
        return 'overflow-hidden';
      case 'rounded':
        return 'rounded-xl overflow-hidden shadow-md border border-cyan-500/30';
      case 'square':
        return 'rounded-lg overflow-hidden shadow-sm border border-cyan-500/30';
      case 'flat':
        return 'rounded-2xl overflow-hidden';
      case 'badge':
      default:
        return 'rounded-2xl overflow-hidden shadow-lg border border-cyan-500/30';
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      <div 
        className={`relative aspect-square flex items-center justify-center shrink-0 ${getContainerClasses()} ${className}`}
      >
        <img 
          src="/xpaid-logo.svg" 
          alt="xpaid Logo" 
          className="w-full h-full object-cover select-none"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-black tracking-tight ${textColor} font-['Outfit']`}>
              x<span className="text-cyan-400">paid</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30">
              PROTOCOL
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Aliases for backwards compatibility
export const TippedLogo = XpaidLogo;
export const FartPayLogo = XpaidLogo;
export default XpaidLogo;
