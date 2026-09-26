import React from 'react';
import { 
  Rocket, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface FamousXUser {
  handle: string;
  name: string;
  avatar: string;
  category: string;
  followers: string;
  verified: boolean;
}

const FAMOUS_X_USERS_ROW_1: FamousXUser[] = [
  {
    handle: 'elonmusk',
    name: 'Elon Musk',
    avatar: '/assets/elon-crypto.svg',
    category: 'Tech & Vision',
    followers: '215M',
    verified: true,
  },
  {
    handle: 'matt_furie',
    name: 'Matt Furie',
    avatar: '/assets/pepe-thinking.svg',
    category: 'Pepe Creator',
    followers: '145K',
    verified: true,
  },
  {
    handle: 'vitalikbuterin',
    name: 'Vitalik Buterin',
    avatar: 'https://unavatar.io/x/vitalikbuterin',
    category: 'Ethereum',
    followers: '5.6M',
    verified: true,
  },
  {
    handle: 'cz_binance',
    name: 'CZ 🔶 BNB',
    avatar: 'https://unavatar.io/x/cz_binance',
    category: 'BNB Founder',
    followers: '9.2M',
    verified: true,
  },
  {
    handle: 'mrbeast',
    name: 'MrBeast',
    avatar: 'https://unavatar.io/x/mrbeast',
    category: 'Top Creator',
    followers: '31.4M',
    verified: true,
  },
  {
    handle: 'saylor',
    name: 'Michael Saylor',
    avatar: 'https://unavatar.io/x/saylor',
    category: 'Bitcoin Pioneer',
    followers: '3.8M',
    verified: true,
  },
  {
    handle: 'sama',
    name: 'Sam Altman',
    avatar: 'https://unavatar.io/x/sama',
    category: 'OpenAI CEO',
    followers: '3.4M',
    verified: true,
  },
];

const FAMOUS_X_USERS_ROW_2: FamousXUser[] = [
  {
    handle: 'naval',
    name: 'Naval',
    avatar: 'https://unavatar.io/x/naval',
    category: 'Angel Philosopher',
    followers: '2.4M',
    verified: true,
  },
  {
    handle: 'aeyakovenko',
    name: 'Toly (Anatoly)',
    avatar: 'https://unavatar.io/x/aeyakovenko',
    category: 'Solana Founder',
    followers: '460K',
    verified: true,
  },
  {
    handle: 'brian_armstrong',
    name: 'Brian Armstrong',
    avatar: 'https://unavatar.io/x/brian_armstrong',
    category: 'Coinbase CEO',
    followers: '1.4M',
    verified: true,
  },
  {
    handle: 'kaicenat',
    name: 'Kai Cenat',
    avatar: 'https://unavatar.io/x/kaicenat',
    category: 'Live Streamer',
    followers: '4.2M',
    verified: true,
  },
  {
    handle: 'balajis',
    name: 'Balaji Srinivasan',
    avatar: 'https://unavatar.io/x/balajis',
    category: 'Network State',
    followers: '1.1M',
    verified: true,
  },
  {
    handle: 'paulg',
    name: 'Paul Graham',
    avatar: 'https://unavatar.io/x/paulg',
    category: 'Y Combinator',
    followers: '1.9M',
    verified: true,
  },
  {
    handle: 'cobie',
    name: 'Cobie',
    avatar: 'https://unavatar.io/x/cobie',
    category: 'Crypto OG',
    followers: '785K',
    verified: true,
  },
];

interface FamousUsersInfiniteMarqueeProps {
  onLaunchForUser: (handle: string) => void;
}

export const FamousUsersInfiniteMarquee: React.FC<FamousUsersInfiniteMarqueeProps> = ({
  onLaunchForUser
}) => {
  const row1Double = [...FAMOUS_X_USERS_ROW_1, ...FAMOUS_X_USERS_ROW_1];
  const row2Double = [...FAMOUS_X_USERS_ROW_2, ...FAMOUS_X_USERS_ROW_2];

  return (
    <div className="space-y-4 pt-4 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trending Beneficiaries</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-['Outfit']">
            Autonomous Meme Coins for Any 𝕏 Creator
          </h2>
        </div>

        <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
          Click to launch & tip
        </span>
      </div>

      {/* Marquee Wrapper with left/right fade masks */}
      <div className="relative -mx-4 sm:-mx-8 overflow-hidden py-2">
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#03060c] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#03060c] to-transparent z-10 pointer-events-none" />

        {/* Row 1 - Scrolling Left */}
        <div className="animate-marquee flex gap-4 py-1">
          {row1Double.map((user, idx) => (
            <div
              key={`row1-${user.handle}-${idx}`}
              onClick={() => onLaunchForUser(user.handle)}
              className="w-[260px] sm:w-[280px] shrink-0 holo-card p-3.5 rounded-2xl border border-white/10 hover:border-cyan-400 shadow-lg transition-all group cursor-pointer flex items-center justify-between gap-3 select-none"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-xl object-cover border-2 border-cyan-500/50 shadow-md group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://unavatar.io/x/${user.handle}`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center border border-white/20">
                    𝕏
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-cyan-400 transition-colors">
                      {user.name}
                    </span>
                    {user.verified && (
                      <span className="text-cyan-400 text-[11px] font-bold shrink-0">✓</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block truncate">
                    @{user.handle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchForUser(user.handle);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md transition-all shrink-0 cursor-pointer group-hover:scale-105"
              >
                <Zap className="w-3 h-3 text-slate-950" />
                <span>Tip</span>
              </button>
            </div>
          ))}
        </div>

        {/* Row 2 - Scrolling Right / Reverse */}
        <div className="animate-marquee-reverse flex gap-4 py-1 mt-3">
          {row2Double.map((user, idx) => (
            <div
              key={`row2-${user.handle}-${idx}`}
              onClick={() => onLaunchForUser(user.handle)}
              className="w-[260px] sm:w-[280px] shrink-0 holo-card p-3.5 rounded-2xl border border-white/10 hover:border-teal-400 shadow-lg transition-all group cursor-pointer flex items-center justify-between gap-3 select-none"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-xl object-cover border-2 border-teal-500/50 shadow-md group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://unavatar.io/x/${user.handle}`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center border border-white/20">
                    𝕏
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-teal-400 transition-colors">
                      {user.name}
                    </span>
                    {user.verified && (
                      <span className="text-cyan-400 text-[11px] font-bold shrink-0">✓</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block truncate">
                    @{user.handle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchForUser(user.handle);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md transition-all shrink-0 cursor-pointer group-hover:scale-105"
              >
                <Zap className="w-3 h-3 text-slate-950" />
                <span>Tip</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
