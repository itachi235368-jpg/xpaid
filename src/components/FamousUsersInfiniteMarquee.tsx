import React from 'react';
import { 
  Rocket, 
  ArrowRight,
  Flame,
  CheckCircle2
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
  // Duplicate arrays to produce infinite seamless looping
  const row1Double = [...FAMOUS_X_USERS_ROW_1, ...FAMOUS_X_USERS_ROW_1];
  const row2Double = [...FAMOUS_X_USERS_ROW_2, ...FAMOUS_X_USERS_ROW_2];

  return (
    <div className="space-y-4 sm:space-y-5 pt-2 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 mb-1 uppercase tracking-wider">
            <Flame className="w-3 h-3 text-cyan-500" />
            <span>Famous 𝕏 Accounts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight font-['Outfit']">
            Launch a Token for Any 𝕏 User
          </h2>
        </div>

        <span className="hidden sm:inline-block text-xs text-zinc-500 dark:text-zinc-400">
          Click any creator to launch
        </span>
      </div>

      {/* Marquee Wrapper with left/right fade masks */}
      <div className="relative -mx-3 sm:-mx-6 overflow-hidden py-1">
        
        {/* Left & Right gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

        {/* Row 1 - Scrolling Left */}
        <div className="animate-marquee flex gap-3 sm:gap-3.5 py-1">
          {row1Double.map((user, idx) => (
            <div
              key={`row1-${user.handle}-${idx}`}
              onClick={() => onLaunchForUser(user.handle)}
              className="w-[240px] sm:w-[260px] shrink-0 bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all group cursor-pointer flex items-center justify-between gap-3 select-none"
            >
              {/* Avatar + Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-2xs group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://unavatar.io/x/${user.handle}`;
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[8px] font-black flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    𝕏
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {user.name}
                    </span>
                    {user.verified && (
                      <span className="text-blue-500 text-[11px] font-bold shrink-0">✓</span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono block truncate">
                    @{user.handle}
                  </span>
                </div>
              </div>

              {/* Launch Action */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchForUser(user.handle);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center gap-1 shadow-xs transition-all shrink-0 cursor-pointer group-hover:scale-105"
              >
                <Rocket className="w-3 h-3 text-cyan-400 dark:text-cyan-600" />
                <span>Launch</span>
              </button>
            </div>
          ))}
        </div>

        {/* Row 2 - Scrolling Right / Reverse */}
        <div className="animate-marquee-reverse flex gap-3 sm:gap-3.5 py-1 mt-2">
          {row2Double.map((user, idx) => (
            <div
              key={`row2-${user.handle}-${idx}`}
              onClick={() => onLaunchForUser(user.handle)}
              className="w-[240px] sm:w-[260px] shrink-0 bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all group cursor-pointer flex items-center justify-between gap-3 select-none"
            >
              {/* Avatar + Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-2xs group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://unavatar.io/x/${user.handle}`;
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[8px] font-black flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    𝕏
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {user.name}
                    </span>
                    {user.verified && (
                      <span className="text-blue-500 text-[11px] font-bold shrink-0">✓</span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono block truncate">
                    @{user.handle}
                  </span>
                </div>
              </div>

              {/* Launch Action */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchForUser(user.handle);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center gap-1 shadow-xs transition-all shrink-0 cursor-pointer group-hover:scale-105"
              >
                <Rocket className="w-3 h-3 text-teal-400 dark:text-teal-600" />
                <span>Launch</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
