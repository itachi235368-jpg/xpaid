import React, { useState } from 'react';
import { 
  Tv, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles
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
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-16 space-y-8 sm:space-y-12 animate-in fade-in duration-300">
      {/* Clean Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-12 text-center space-y-5 sm:space-y-6 shadow-xs">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
            <span>Live Streamer Royalty Bridge</span>
            <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
            <span>Coming Q2</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-['Outfit']">
            Streamer Fee Routing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-400 dark:from-cyan-400 dark:to-teal-300">TikTok, Twitch & Kick</span>
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Automatically collect Pump.fun bonding curve creator fees and stream royalties directly to live broadcasters on TikTok, Twitch, and Kick in real-time.
          </p>
        </div>

        {/* Platform Logos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
          {/* TikTok */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="w-14 h-14 rounded-xl bg-zinc-900 dark:bg-black border border-zinc-700/80 flex items-center justify-center shadow-xs">
              <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">TikTok Live</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Route tips from meme token volume</p>
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
              In Development
            </span>
          </div>

          {/* Twitch */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="w-14 h-14 rounded-xl bg-[#9146FF]/15 dark:bg-[#9146FF]/20 border border-[#9146FF]/30 dark:border-[#9146FF]/40 flex items-center justify-center shadow-xs">
              <svg className="w-7 h-7 text-[#9146FF] fill-current" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.714 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.428l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Twitch TV</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Direct sub & bit integration</p>
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
              Coming Q2
            </span>
          </div>

          {/* Kick */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="w-14 h-14 rounded-xl bg-[#53FC18]/15 dark:bg-[#53FC18]/10 border border-[#53FC18]/30 flex items-center justify-center shadow-xs bg-zinc-900 dark:bg-zinc-950">
              <span className="font-black text-[#53FC18] text-base tracking-tighter">KICK</span>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Kick Broadcasts</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Instant USD payouts for streamers</p>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Coming Q2
            </span>
          </div>
        </div>

        {/* Waitlist Box */}
        <div className="max-w-md mx-auto pt-4">
          {!isJoined ? (
            <form onSubmit={handleWaitlist} className="flex gap-2 bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <input
                type="text"
                value={emailOrHandle}
                onChange={(e) => setEmailOrHandle(e.target.value)}
                placeholder="Enter your X handle or email..."
                required
                className="flex-1 bg-transparent px-3 py-2 text-base sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>Notify Me</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>You are on the VIP Streamer Beta list!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
