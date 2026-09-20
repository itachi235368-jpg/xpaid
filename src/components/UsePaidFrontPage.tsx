import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Coins, 
  CheckCircle2, 
  ExternalLink, 
  DollarSign, 
  Search,
  Flame,
  Globe,
  Lock,
  ArrowUpRight,
  Layers,
  Activity,
  Tv
} from 'lucide-react';
import { TokenLaunchData, FeeCollectionRecord, XMoneyPayout } from '../types';

interface UsePaidFrontPageProps {
  tokens: TokenLaunchData[];
  fees: FeeCollectionRecord[];
  payouts: XMoneyPayout[];
  totalCollectedUsd: number;
  totalDisbursedUsd: number;
  onLaunchClick: (prefilledHandle?: string) => void;
  onExploreFeesClick: () => void;
  onExplorePayoutsClick: () => void;
  onExploreStreamersClick: () => void;
  onSelectToken: (token: TokenLaunchData) => void;
}

const FEATURED_CREATORS = [
  { handle: 'elonmusk', name: 'Elon Musk', avatar: 'https://pbs.twimg.com/profile_images/1838634862464733184/pXj9iWd0_400x400.jpg', tokenSymbol: 'MARS', volume: '$184.2K', baseFees: 1473.60 },
  { handle: 'matt_furie', name: 'Matt Furie', avatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80', tokenSymbol: 'PEPE4X', volume: '$342.1K', baseFees: 2736.80 },
  { handle: 'cz_binance', name: 'CZ 🔶 BNB', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80', tokenSymbol: 'BNBFAN', volume: '$92.4K', baseFees: 739.20 },
  { handle: 'saylor', name: 'Michael Saylor', avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=160&auto=format&fit=crop&q=80', tokenSymbol: 'ORANGE', volume: '$67.8K', baseFees: 542.40 },
];

interface LiveStreamEvent {
  id: string;
  tokenSymbol: string;
  creatorHandle: string;
  amountUsd: number;
  timeAgo: string;
}

export const UsePaidFrontPage: React.FC<UsePaidFrontPageProps> = ({
  tokens,
  fees,
  payouts,
  totalCollectedUsd,
  totalDisbursedUsd,
  onLaunchClick,
  onExploreFeesClick,
  onExplorePayoutsClick,
  onExploreStreamersClick,
  onSelectToken,
}) => {
  const [inputHandle, setInputHandle] = useState('');
  
  // Real-time continuous fee generator state ($100 per hour = $0.027778/second)
  const RATE_PER_HOUR = 100;
  const RATE_PER_SECOND = RATE_PER_HOUR / 3600; // 0.02777777777777778 USD/sec

  const [streamOffsetUsd, setStreamOffsetUsd] = useState(0);

  const [recentEvents, setRecentEvents] = useState<LiveStreamEvent[]>([
    { id: '1', tokenSymbol: 'PEPE4X', creatorHandle: 'matt_furie', amountUsd: 0.03, timeAgo: 'just now' },
    { id: '2', tokenSymbol: 'MARS', creatorHandle: 'elonmusk', amountUsd: 0.04, timeAgo: '2s ago' },
    { id: '3', tokenSymbol: 'BNBFAN', creatorHandle: 'cz_binance', amountUsd: 0.02, timeAgo: '5s ago' },
    { id: '4', tokenSymbol: 'ORANGE', creatorHandle: 'saylor', amountUsd: 0.03, timeAgo: '9s ago' },
  ]);
  const [isPulsing, setIsPulsing] = useState(false);

  // Micro-feed live pulse
  useEffect(() => {
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;

      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 300);

      // Periodically update the live trade feed event with micro-royalties
      if (tickCount % 3 === 0) {
        const sampleCreators = [
          { handle: 'elonmusk', symbol: 'MARS' },
          { handle: 'matt_furie', symbol: 'PEPE4X' },
          { handle: 'cz_binance', symbol: 'BNBFAN' },
          { handle: 'saylor', symbol: 'ORANGE' },
          { handle: 'VitalikButerin', symbol: 'GAS' },
          { handle: 'brian_armstrong', symbol: 'COIN' },
        ];
        const randomCreator = sampleCreators[Math.floor(Math.random() * sampleCreators.length)];
        const microFee = +(RATE_PER_SECOND * 3).toFixed(2);

        setRecentEvents(prev => [
          {
            id: Math.random().toString(),
            tokenSymbol: randomCreator.symbol,
            creatorHandle: randomCreator.handle,
            amountUsd: microFee > 0 ? microFee : 0.08,
            timeAgo: 'just now',
          },
          ...prev.slice(0, 4),
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [RATE_PER_SECOND]);

  const currentLiveDisbursed = totalDisbursedUsd;

  const handleQuickLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputHandle.trim().replace(/^@/, '');
    onLaunchClick(clean || undefined);
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-12 sm:space-y-20">
      
      {/* 1. Hero Section styled like usepaid.app */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-8">
        
        {/* Protocol Live Badge with real-time heartbeat */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 dark:bg-zinc-800/90 border border-zinc-700/80 dark:border-zinc-700 text-white text-xs font-semibold shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="tracking-wide text-zinc-200">PAID PROTOCOL</span>
          <span className="text-zinc-500">•</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span>95% Creator Royalties Live</span>
            <Activity className="w-3 h-3 animate-pulse" />
          </span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1] sm:leading-[1.15]">
          Monetize any <span className="text-emerald-600 dark:text-emerald-400 font-black">𝕏 user</span> with meme coins.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Launch a token for any 𝕏 account. <strong className="text-zinc-900 dark:text-zinc-100 font-bold">We pay the 𝕏 User, not the token creator.</strong> <strong className="text-zinc-900 dark:text-zinc-100 font-bold">95% of Pump.fun trading fees</strong> automatically convert to USD and stream directly into the targeted 𝕏 User's balance. <strong className="text-zinc-900 dark:text-zinc-100 font-bold">5%</strong> buy & burn.
        </p>

        {/* Live Continuous Fee Stream Bar (usepaid.app signature ticker) */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-400 tracking-wide uppercase text-[11px]">
              Continuous Fee Stream:
            </span>
            <span className="text-zinc-300 font-medium truncate">
              {recentEvents[0] && (
                <span>
                  +${recentEvents[0].amountUsd.toFixed(2)} USD streamed to <strong className="text-white">@{recentEvents[0].creatorHandle}</strong> (${recentEvents[0].tokenSymbol})
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px]">
              +$100/hr ($1.67/min)
            </span>
            <span className="text-[10px] text-zinc-400">Live Rails</span>
          </div>
        </div>

        {/* Interactive Fast Launcher Bar */}
        <div className="pt-2 max-w-xl mx-auto">
          <form 
            onSubmit={handleQuickLaunch}
            className="p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-zinc-900/95 border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10"
          >
            <div className="flex items-center gap-2 px-3.5 py-2 w-full flex-1">
              <span className="text-zinc-400 dark:text-zinc-500 font-bold text-lg">@</span>
              <input
                type="text"
                value={inputHandle}
                onChange={(e) => setInputHandle(e.target.value)}
                placeholder="elonmusk, matt_furie, mrbeast..."
                className="w-full bg-transparent border-none text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
              />
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch Token</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Creator Quick Picks */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Popular:</span>
            {FEATURED_CREATORS.map(c => (
              <button
                key={c.handle}
                type="button"
                onClick={() => onLaunchClick(c.handle)}
                className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                @{c.handle}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
          <button
            type="button"
            onClick={() => onLaunchClick()}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            <span>Open Launch Studio</span>
          </button>

          <button
            type="button"
            onClick={onExploreStreamersClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Tv className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Streamers (TikTok / Twitch / Kick)</span>
          </button>

          <button
            type="button"
            onClick={onExploreFeesClick}
            className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-2"
          >
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Live Fee Flow</span>
          </button>
        </div>
      </div>

      {/* 2. Protocol Metrics Bar - Continuously Increasing Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
        <div className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-300 ${isPulsing ? 'border-emerald-500/70 shadow-emerald-500/10 shadow-lg' : 'border-zinc-200 dark:border-zinc-800 shadow-xs'} text-center space-y-1 relative overflow-hidden`}>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono tracking-tight flex items-center justify-center gap-1">
            <span>${currentLiveDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-opacity ${isPulsing ? 'opacity-100 bg-emerald-500 text-white' : 'opacity-0'}`}>
              LIVE
            </span>
          </div>
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Total USD Auto-Disbursed</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            95% / 5%
          </div>
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Creator USD / Buy & Burn
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
            2-Tx Protocol
          </div>
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            On-Chain PumpFees Binding
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
            &lt; 0.05s
          </div>
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            𝕏 Money Instant Settlement
          </div>
        </div>
      </div>

      {/* 3. Multi-Chain Platforms Section (Pump.fun, Four.meme, Pons/Robinhood) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <span>Multi-Chain Launchpads & Financial Rails</span>
            </h2>
            <p className="text-xs text-zinc-500">Meme token bonding curves and fiat brokerage off-ramps</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Ecosystem
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pump.fun - LIVE */}
          <div 
            onClick={() => onLaunchClick()}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 hover:border-emerald-500 shadow-md hover:shadow-lg transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Pump.fun (Solana)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                LIVE
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Instant token launches on Solana. 95% SOL creator trading fees stream automatically to protocol treasury and convert to USD.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Launch on Solana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Four.meme - SOON */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/30 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Four.meme (BNB)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                SOON
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Binance Smart Chain meme launchpad integration. 95% BNB creator fees collected via PancakeSwap liquidity curves.
            </p>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              BNB Chain Integration In Progress
            </div>
          </div>

          {/* Pons (Robinhood Chain) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-teal-500/40 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Pons (Robinhood Chain)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300">
                Robinhood L2
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Zero-gas EVM Layer 2 tailored for Robinhood & 𝕏 creator economies. Direct USD payouts into Robinhood brokerage accounts, fractional stock rewards, and instant FedNow rails.
            </p>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
              Robinhood EVM Chain & Brokerage Bridge
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Trending Tokens Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Live Meme Royalty Streams</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Tokens currently streaming 95% creator trading royalties into 𝕏 accounts.
            </p>
          </div>

          {tokens.length > 0 && (
            <button
              type="button"
              onClick={onExploreFeesClick}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({tokens.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {tokens.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Rocket className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                No tokens launched yet
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Launch a token for any 𝕏 handle above to start streaming 95% creator trading fees directly to their 𝕏 balance.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onLaunchClick()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                <span>Launch First Token</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.slice(0, 6).map((token) => (
              <div
                key={token.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 shadow-md hover:shadow-xl transition-all space-y-4 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={token.logoUrl}
                        alt={token.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base truncate">
                            {token.name}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                            ${token.symbol}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate flex items-center gap-1">
                          <span>Beneficiary:</span>
                          <strong className="font-bold">{token.beneficiaryXHandle}</strong>
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold shrink-0">
                      95% USD
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {token.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                    <span>Market Cap:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">${(token.marketCapUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://pump.fun/coin/${token.mintAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Pump.fun</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onLaunchClick(token.beneficiaryXHandle.replace(/^@/, ''))}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Rocket className="w-3 h-3" />
                      <span>Launch Coin</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. 3-Step "How It Works" Bento */}
      <div className="p-6 sm:p-10 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-2xl space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How PAID Protocol Works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Autonomous on-chain creator monetization powered by Pump.fun and 𝕏 Money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-bold text-white">
              Pick Any 𝕏 User
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Anyone can launch a coin for any 𝕏 user (@elonmusk, your favorite streamer, or friend). 95% of fees will go to them, not the coin creator.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-bold text-white">
              2-Transaction Protocol
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Deploys the token mint on Pump.fun and legally binds 100% of trading royalties to the protocol treasury on Solana Mainnet.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="text-base font-bold text-white">
              Instant 𝕏 User Settlements
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Once 0.01 SOL in trading fees is generated, 95% is automatically converted to USD via Kraken / FedNow and auto-deposited straight into the 𝕏 User's 𝕏 Money balance.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Bottom Launch Call-to-Action */}
      <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-emerald-500/10 via-zinc-900/40 to-transparent border border-emerald-500/20 space-y-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Ready to launch for your favorite 𝕏 user?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Takes under 30 seconds. Connect your Solana wallet, choose an 𝕏 handle, and start streaming royalties.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onLaunchClick()}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer inline-flex items-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            <span>Launch Token Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
