import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Flame, Wind, Activity, X } from 'lucide-react';
import { playFartSound } from '../utils/fartSound';

export const FartSoundboardWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastFart, setLastFart] = useState<string | null>(null);
  const [fartCount, setFartCount] = useState(0);
  const [pressure, setPressure] = useState(99.4);

  const triggerFart = (type: 'rip' | 'wet' | 'trumpet' | 'deep' | 'random', label: string) => {
    playFartSound(type);
    setLastFart(label);
    setFartCount(prev => prev + 1);
    setPressure(prev => +(Math.min(100, prev + 0.1)).toFixed(1));
    setTimeout(() => setLastFart(null), 1200);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            triggerFart('random', 'Gas Blast');
          }}
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-lime-500/40 hover:border-lime-400 text-white shadow-xl shadow-lime-900/20 backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="FARTPAY Gas Soundboard"
        >
          <div className="relative">
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
            <Wind className="w-4 h-4 text-lime-400 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black tracking-tight text-white font-['Outfit']">
                FART<span className="text-lime-400">BOARD</span>
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-lime-500/20 text-lime-400 font-bold">
                {pressure}%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono -mt-0.5">Click for Gas</span>
          </div>
        </button>
      ) : (
        <div className="w-72 rounded-3xl bg-slate-950/95 border border-lime-500/40 shadow-2xl shadow-lime-950/50 backdrop-blur-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-lime-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center text-lime-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-['Outfit']">
                  FARTPAY <span className="text-lime-400">Gas Lab</span>
                </h4>
                <div className="text-[10px] text-slate-400 font-mono">
                  Total Rips: <span className="text-lime-400 font-bold">{fartCount}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Gas Pressure Live Gauge */}
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-lime-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-lime-400" />
                Gas Chamber Pressure:
              </span>
              <span className="text-lime-400 font-bold">{pressure}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lime-400 via-emerald-400 to-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${pressure}%` }}
              />
            </div>
            {lastFart && (
              <div className="text-[10px] font-mono text-center text-lime-300 font-bold animate-pulse pt-0.5">
                💨 Fired: {lastFart}!
              </div>
            )}
          </div>

          {/* Sound Trigger Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'rip', label: 'Juicy Rip', icon: '💨', color: 'hover:border-lime-400 hover:bg-lime-500/10' },
              { type: 'trumpet', label: 'Trumpet', icon: '🎺', color: 'hover:border-yellow-400 hover:bg-yellow-500/10' },
              { type: 'wet', label: 'Wet Splat', icon: '💦', color: 'hover:border-emerald-400 hover:bg-emerald-500/10' },
              { type: 'deep', label: 'Bass Boom', icon: '🔊', color: 'hover:border-teal-400 hover:bg-teal-500/10' },
            ].map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => triggerFart(item.type as any, item.label)}
                className={`p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-left transition-all active:scale-95 cursor-pointer ${item.color}`}
              >
                <div className="text-base mb-0.5">{item.icon}</div>
                <div className="text-xs font-bold text-white leading-tight">{item.label}</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">Instant Audio</div>
              </button>
            ))}
          </div>

          {/* Mega Fart Button */}
          <button
            type="button"
            onClick={() => triggerFart('random', 'Nuclear Fart')}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-lime-500 via-emerald-400 to-lime-400 hover:from-lime-400 hover:to-emerald-300 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-lime-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <span>☢️ MEGA GAS DETONATION</span>
          </button>
        </div>
      )}
    </div>
  );
};
