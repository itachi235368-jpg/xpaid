import React from 'react';

interface FartPayLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  variant?: 'badge' | 'mark' | 'white-card';
}

export const FartPayLogo: React.FC<FartPayLogoProps> = ({
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
            ? 'rounded-2xl overflow-hidden shadow-lg border border-cyan-500/30 bg-slate-900' 
            : variant === 'white-card' 
            ? 'rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white' 
            : ''
        } ${className}`}
      >
        <svg 
          viewBox="0 0 512 512" 
          className="w-full h-full select-none p-1.5"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Logo vector exact outline matching uploaded FARTPAY mark */}
          <g transform="translate(10, 0)">
            {/* Top Wind stream 1 with swirl */}
            <path
              d="M 90 205 L 175 205 C 190 205 198 190 198 178 C 198 162 184 150 168 150 C 150 150 142 165 142 178"
              stroke="currentColor"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-400 dark:text-cyan-300"
            />

            {/* Top Wind stream 2 leading into cloud upper curve */}
            <path
              d="M 110 238 L 195 238 C 215 238 238 220 248 185 C 265 130 325 110 365 145 C 385 162 390 185 390 205 C 430 205 465 240 465 285 C 465 330 425 365 385 365 C 380 395 355 435 305 435 C 260 435 225 395 225 350 C 225 320 200 300 170 300 L 110 300"
              stroke="currentColor"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-400 dark:text-cyan-300"
            />

            {/* Middle straight wind nozzle into PAY */}
            <path
              d="M 155 268 L 260 268"
              stroke="currentColor"
              strokeWidth="22"
              strokeLinecap="round"
              className="text-cyan-400 dark:text-cyan-300"
            />

            {/* Bottom wind swirl */}
            <path
              d="M 90 332 L 175 332 C 190 332 198 347 198 359 C 198 375 184 387 168 387 C 150 387 142 372 142 359"
              stroke="currentColor"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-400 dark:text-cyan-300"
            />

            {/* PAY Word inside the puff */}
            <text
              x="332"
              y="288"
              textAnchor="middle"
              className="fill-white dark:fill-white font-black"
              style={{
                fontFamily: "'Outfit', 'Plus Jakarta Sans', -apple-system, sans-serif",
                fontSize: '66px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              PAY
            </text>
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-black tracking-tight ${textColor} font-['Outfit']`}>
              FART<span className="text-cyan-400">PAY</span>
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
