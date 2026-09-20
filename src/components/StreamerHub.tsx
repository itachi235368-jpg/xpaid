import React, { useState } from 'react';
import { 
  Radio, 
  Video, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Bell, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Play,
  Tv,
  Smartphone,
  Globe
} from 'lucide-react';

interface StreamerHubProps {
  tokens: any[];
  solPrice: number;
  onSuccessMessage: (msg: string) => void;
  onErrorMessage: (err: string) => void;
}

export const StreamerHub: React.FC<StreamerHubProps> = ({
  onSuccessMessage
}) => {
  const [emailOrHandle, setEmailOrHandle] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrHandle.trim()) return;
    setIsJoined(true);
    onSuccessMessage('Successfully joined the Streamer Beta Waitlist! We will notify you when TikTok, Twitch & Kick auto-fee routing launches.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-300">
      {/* Coming Soon Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/90 p-8 sm:p-12 shadow-2xl text-center space-y-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-purple-600/15 via-pink-600/15 to-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide uppercase">
            <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
            Coming Soon • Live Streamer Royalty Bridge
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-['Outfit']">
            Streamer Fee Routing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400">TikTok, Twitch & Kick</span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Automatically collect Pump.fun bonding curve creator fees and stream royalties directly to live broadcasters on TikTok, Twitch, and Kick in real-time.
          </p>
        </div>

        {/* Platform Logos Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-6">
          {/* TikTok */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 group hover:border-cyan-500/50 transition-all shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white text-base">TikTok Live</h3>
              <p className="text-xs text-zinc-400 mt-1">Auto-route tips & gifts from Pump.fun trading volume</p>
            </div>
            <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-3 py-1 rounded-full border border-cyan-700/60 font-bold">
              In Development
            </span>
          </div>

          {/* Twitch */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 group hover:border-purple-500/50 transition-all shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#9146FF]/20 border border-[#9146FF]/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-[#9146FF] fill-current" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.714 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.428l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white text-base">Twitch TV</h3>
              <p className="text-xs text-zinc-400 mt-1">Direct sub & bit integration with on-chain bonding curves</p>
            </div>
            <span className="text-[10px] bg-purple-950/80 text-purple-300 px-3 py-1 rounded-full border border-purple-700/60 font-bold">
              Coming Q2
            </span>
          </div>

          {/* Kick */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 group hover:border-[#53FC18]/50 transition-all shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#53FC18]/10 border border-[#53FC18]/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-[#53FC18] text-xl tracking-tighter">KICK</span>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white text-base">Kick Broadcasts</h3>
              <p className="text-xs text-zinc-400 mt-1">Instant SOL & USD payouts for top Kick streamers</p>
            </div>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700/60 font-bold">
              Coming Q2
            </span>
          </div>
        </div>

        {/* Waitlist / Notification Box */}
        <div className="relative z-10 max-w-md mx-auto pt-6">
          {!isJoined ? (
            <form onSubmit={handleWaitlist} className="flex gap-2 bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
              <input
                type="text"
                value={emailOrHandle}
                onChange={(e) => setEmailOrHandle(e.target.value)}
                placeholder="Enter your X handle or email..."
                required
                className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>Notify Me</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              You are on the VIP Streamer Beta list!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
