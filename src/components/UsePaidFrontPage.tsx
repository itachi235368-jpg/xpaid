import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  ArrowRight, 
  Sparkles, 
  Coins, 
  ExternalLink, 
  Flame, 
  Layers, 
  Activity,
  Tv,
  CheckCircle2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { TokenLaunchData, FeeCollectionRecord, XMoneyPayout } from '../types';
import { FamousUsersInfiniteMarquee } from './FamousUsersInfiniteMarquee';

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
  { handle: 'elonmusk', name: 'Elon Musk' },
  { handle: 'matt_furie', name: 'Matt Furie' },
  { handle: 'cz_binance', name: 'CZ Binance' },
  { handle: 'saylor', name: 'Michael Saylor' },
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
  
  // Real-time continuous fee generator ($100/hr = $0.027778/sec)
  const RATE_PER_HOUR = 100;
  const RATE_PER_SECOND = RATE_PER_HOUR / 3600;

  const [recentEvents, setRecentEvents] = useState<LiveStreamEvent[]>(() => {
    if (tokens && tokens.length > 0) {
      return tokens.slice(0, 4).map((t, idx) => ({
        id: `init-${t.id || t.mintAddress}-${idx}`,
        tokenSymbol: t.symbol,
        creatorHandle: (t.beneficiaryXHandle || '').replace(/^@/, ''),
        amountUsd: Number((0.14 + idx * 0.05).toFixed(2)),
        timeAgo: `${(idx + 1) * 3}s ago`,
      }));
    }
    return [];
  });

  useEffect(() => {
    if (tokens.length > 0) {
      // Whenever tokens are loaded or a new one is added, make sure stream events reflect all launched tokens
      setRecentEvents(prev => {
        if (prev.length === 0) {
          return tokens.slice(0, 4).map((t, idx) => ({
            id: `init-${t.id || t.mintAddress}-${idx}`,
            tokenSymbol: t.symbol,
            creatorHandle: (t.beneficiaryXHandle || '').replace(/^@/, ''),
            amountUsd: Number((0.14 + idx * 0.05).toFixed(2)),
            timeAgo: `${(idx + 1) * 3}s ago`,
          }));
        }
        // If the newest token is not represented at the top, prepend it
        const latestToken = tokens[0];
        const hasLatest = prev.slice(0, 2).some(e => e.tokenSymbol === latestToken.symbol);
        if (!hasLatest) {
          return [
            {
              id: `launch-live-${Date.now()}`,
              tokenSymbol: latestToken.symbol,
              creatorHandle: (latestToken.beneficiaryXHandle || '').replace(/^@/, ''),
              amountUsd: 0.18,
              timeAgo: 'just now',
            },
            ...prev.slice(0, 3)
          ];
        }
        return prev;
      });
    }
  }, [tokens]);

  useEffect(() => {
    if (tokens.length === 0) {
      setRecentEvents([]);
      return;
    }

    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;

      if (tickCount % 3 === 0 && tokens.length > 0) {
        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        const microFee = +(RATE_PER_SECOND * 3).toFixed(2);

        setRecentEvents(prev => [
          {
            id: Math.random().toString(),
            tokenSymbol: randomToken.symbol,
            creatorHandle: randomToken.beneficiaryXHandle.replace(/^@/, ''),
            amountUsd: microFee > 0 ? microFee : 0.08,
            timeAgo: 'just now',
          },
          ...prev.slice(0, 3),
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [RATE_PER_SECOND, tokens]);

  const handleQuickLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputHandle.trim().replace(/^@/, '');
    onLaunchClick(clean || undefined);
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-16 space-y-12 sm:space-y-20">
      
      {/* 1. Mobile-Optimized Hero Section */}
      <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto pt-1 sm:pt-4">
        
        {/* Responsive Text Kicker */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 flex-wrap">
          <span>TIPPED Protocol</span>
          <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
          <span>95% Creator Royalties</span>
          <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
          <span>Solana Active</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15] sm:leading-[1.12] font-['Outfit']">
          Monetize any <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400">𝕏 creator & streamer</span> with meme coins.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal px-1 sm:px-0">
          Launch a token for any 𝕏 account or live streamer. <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">We tip the creator, not the deployer.</strong> 95% of Pump.fun trading fees convert directly to USD and stream into the creator's payout balance. 5% buy & burn.
        </p>

        {/* Quiet Live Stream Indicator */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 max-w-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">
            Live: <strong className="text-zinc-900 dark:text-zinc-200">+${recentEvents[0]?.amountUsd.toFixed(2)} USD</strong> to <span className="text-cyan-500 dark:text-cyan-400">@{recentEvents[0]?.creatorHandle}</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700 shrink-0">·</span>
          <span className="font-mono text-[10px] sm:text-[11px] text-zinc-500 shrink-0">$100/hr</span>
        </div>

        {/* Sleek Mobile-First Fast Launcher Bar */}
        <div className="pt-2 max-w-xl mx-auto w-full">
          <form 
            onSubmit={handleQuickLaunch}
            className="p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all"
          >
            <div className="flex items-center gap-2 px-3 py-2 w-full flex-1 min-w-0">
              <span className="text-zinc-400 dark:text-zinc-500 font-bold text-base select-none">@</span>
              <input
                type="text"
                value={inputHandle}
                onChange={(e) => setInputHandle(e.target.value)}
                placeholder="elonmusk, matt_furie, mrbeast..."
                className="w-full bg-transparent border-none text-base font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
              />
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto h-12 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm active:scale-[0.98]"
            >
              <Rocket className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
              <span>Launch Token</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Pick Handle Chips */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-500">Popular:</span>
            {FEATURED_CREATORS.map((c) => (
              <button
                key={c.handle}
                type="button"
                onClick={() => onLaunchClick(c.handle)}
                className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer text-xs"
              >
                @{c.handle}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Mobile Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full pt-2 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => onLaunchClick()}
            className="h-11 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm font-semibold border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Rocket className="w-3.5 h-3.5 text-zinc-500" />
            <span>Open Launch Studio</span>
          </button>

          <button
            type="button"
            onClick={onExploreStreamersClick}
            className="h-11 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm font-semibold border border-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Streamers Hub</span>
          </button>

          <button
            type="button"
            onClick={onExploreFeesClick}
            className="h-11 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-500" />
            <span>Live Fee Flow</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Protocol Metrics Strip (Crisp 1px Grid on all screen widths) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800/80 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 shadow-xs max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900/90 p-3.5 sm:p-5 text-center flex flex-col justify-center space-y-0.5">
          <div className="text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono tracking-tight">
            ${totalDisbursedUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">Auto-Disbursed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 p-3.5 sm:p-5 text-center flex flex-col justify-center space-y-0.5">
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            95% / 5%
          </div>
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            Creator / Burn
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 p-3.5 sm:p-5 text-center flex flex-col justify-center space-y-0.5">
          <div className="text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
            2-Tx Binding
          </div>
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            Solana Treasury
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/90 p-3.5 sm:p-5 text-center flex flex-col justify-center space-y-0.5">
          <div className="text-lg sm:text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
            &lt; 0.05s
          </div>
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            𝕏 Money Speed
          </div>
        </div>
      </div>

      {/* 2.5 Infinite Loop of Famous X Users getting paid */}
      <FamousUsersInfiniteMarquee onLaunchForUser={(handle) => onLaunchClick(handle)} />

      {/* 3. Multi-Chain Platforms & Financial Rails */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>Launchpads & Settlement Rails</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Autonomous bonding curves and creator fiat off-ramps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Pump.fun - LIVE */}
          <div 
            onClick={() => onLaunchClick()}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Pump.fun (Solana)</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Instant token launches on Solana. 95% SOL creator trading fees stream automatically to protocol treasury and convert to USD.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform pt-1">
              <span>Launch on Solana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Four.meme */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Four.meme (BNB)</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                Testing
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Binance Smart Chain meme launchpad integration. 95% BNB creator fees collected via PancakeSwap liquidity curves.
            </p>
            <div className="text-[11px] text-zinc-500 pt-1">
              BNB Chain Q2 Release
            </div>
          </div>

          {/* Robinhood / Pons */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Pons (Robinhood Chain)</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                Planned
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Zero-gas EVM Layer 2 tailored for Robinhood & 𝕏 creator economies. Direct USD deposits into Robinhood accounts and FedNow rails.
            </p>
            <div className="text-[11px] text-zinc-500 pt-1">
              Brokerage Integration
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Tokens Streams */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Live Meme Royalty Streams</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tokens streaming 95% creator trading royalties into 𝕏 accounts.
            </p>
          </div>

          {tokens.length > 0 && (
            <button
              type="button"
              onClick={onExploreFeesClick}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>All ({tokens.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {tokens.length === 0 ? (
          <div className="p-6 sm:p-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
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
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Launch First Token</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {tokens.slice(0, 24).map((token) => (
              <div
                key={token.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/90 hover:border-cyan-500/40 shadow-xs hover:shadow-md transition-all space-y-3.5 group flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={token.logoUrl}
                        alt={token.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm truncate">
                            {token.name}
                          </h3>
                          <span className="font-mono text-[11px] text-zinc-500">
                            ${token.symbol}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium truncate">
                          @{token.beneficiaryXHandle.replace(/^@/, '')}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      95% USD
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {token.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Market Cap:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      ${(token.marketCapUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://pump.fun/coin/${token.mintAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Pump.fun</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onLaunchClick(token.beneficiaryXHandle.replace(/^@/, ''))}
                      className="h-9 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Rocket className="w-3 h-3" />
                      <span>Launch</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Mobile-Clean Editorial "How It Works" Section */}
      <div className="p-5 sm:p-10 rounded-2xl bg-white dark:bg-zinc-900/80 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 space-y-6 sm:space-y-8 shadow-xs">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            Architecture
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-['Outfit']">
            How TIPPED Protocol Works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Autonomous on-chain creator tip rails powered by Pump.fun and 𝕏 Money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">01.</div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Target Any 𝕏 Creator
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Deploy a coin for any 𝕏 handle or streamer. 95% of all bonding curve creator royalties belong strictly to them, not the deployer.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">02.</div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              2-Tx Treasury Binding
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Mint created on Pump.fun with fee collection authority irrevocably bound to the verified Protocol Treasury on Solana.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">03.</div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Instant 𝕏 Money Settlement
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When 0.01 SOL in fees accumulates, it auto-converts to USD and deposits directly into the creator's 𝕏 Money account with zero manual claiming.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
