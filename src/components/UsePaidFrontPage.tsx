import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  DollarSign,
  Zap,
  Sliders,
  Wallet,
  Globe,
  Radio,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Cpu,
  Terminal,
  Lock,
  Share2
} from 'lucide-react';
import { TokenLaunchData, FeeCollectionRecord, XMoneyPayout } from '../types';
import { FamousUsersInfiniteMarquee } from './FamousUsersInfiniteMarquee';
import { playFartSound } from '../utils/fartSound';

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
  { handle: 'elonmusk', name: 'Elon Musk', ticker: 'ELON', avatar: '/assets/elon-crypto.svg' },
  { handle: 'matt_furie', name: 'Matt Furie', ticker: 'PEPE', avatar: '/assets/pepe-thinking.svg' },
  { handle: 'vitalikbuterin', name: 'Vitalik', ticker: 'VITALIK', avatar: 'https://unavatar.io/x/vitalikbuterin' },
  { handle: 'cz_binance', name: 'CZ Binance', ticker: 'CZBNB', avatar: 'https://unavatar.io/x/cz_binance' },
  { handle: 'mrbeast', name: 'MrBeast', ticker: 'BEAST', avatar: 'https://unavatar.io/x/mrbeast' },
  { handle: 'saylor', name: 'Michael Saylor', ticker: 'SAYLOR', avatar: 'https://unavatar.io/x/saylor' },
];

interface LiveStreamEvent {
  id: string;
  tokenSymbol: string;
  creatorHandle: string;
  amountUsd: number;
  timeAgo: string;
  txHash: string;
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
  const [inputHandle, setInputHandle] = useState('elonmusk');
  const [activeTabSection, setActiveTabSection] = useState<'tokens' | 'simulator' | 'architecture'>('tokens');
  
  // Interactive Revenue Simulator
  const [simulatedVolume, setSimulatedVolume] = useState<number>(75000);
  const feeRatePct = 1.0;
  const creatorCutPct = 0.95;

  const dailyCreatorUsd = useMemo(() => {
    return (simulatedVolume * (feeRatePct / 100)) * creatorCutPct;
  }, [simulatedVolume]);

  const monthlyCreatorUsd = useMemo(() => dailyCreatorUsd * 30, [dailyCreatorUsd]);
  const burnDailyUsd = useMemo(() => (simulatedVolume * (feeRatePct / 100)) * 0.05, [simulatedVolume]);

  // Real-time continuous fee generator
  const RATE_PER_HOUR = 120;
  const RATE_PER_SECOND = RATE_PER_HOUR / 3600;

  const [recentEvents, setRecentEvents] = useState<LiveStreamEvent[]>(() => {
    if (tokens && tokens.length > 0) {
      return tokens.slice(0, 5).map((t, idx) => ({
        id: `init-${t.id || t.mintAddress}-${idx}`,
        tokenSymbol: t.symbol,
        creatorHandle: (t.beneficiaryXHandle || '').replace(/^@/, ''),
        amountUsd: Number((0.22 + idx * 0.08).toFixed(2)),
        timeAgo: `${(idx + 1) * 2}s ago`,
        txHash: (t.mintAddress ? t.mintAddress.slice(0, 8) : '5kL8...9xZq')
      }));
    }
    return [];
  });

  useEffect(() => {
    if (tokens.length > 0) {
      setRecentEvents(prev => {
        if (prev.length === 0) {
          return tokens.slice(0, 5).map((t, idx) => ({
            id: `init-${t.id || t.mintAddress}-${idx}`,
            tokenSymbol: t.symbol,
            creatorHandle: (t.beneficiaryXHandle || '').replace(/^@/, ''),
            amountUsd: Number((0.22 + idx * 0.08).toFixed(2)),
            timeAgo: `${(idx + 1) * 2}s ago`,
            txHash: t.mintAddress ? t.mintAddress.slice(0, 8) : '5kL8...9xZq'
          }));
        }
        const latestToken = tokens[0];
        const hasLatest = prev.slice(0, 2).some(e => e.tokenSymbol === latestToken.symbol);
        if (!hasLatest) {
          return [
            {
              id: `launch-live-${Date.now()}`,
              tokenSymbol: latestToken.symbol,
              creatorHandle: (latestToken.beneficiaryXHandle || '').replace(/^@/, ''),
              amountUsd: 0.35,
              timeAgo: 'just now',
              txHash: latestToken.mintAddress ? latestToken.mintAddress.slice(0, 8) : '8Lm7...Bk3A'
            },
            ...prev.slice(0, 4)
          ];
        }
        return prev;
      });
    }
  }, [tokens]);

  useEffect(() => {
    if (tokens.length === 0) return;

    const interval = setInterval(() => {
      const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
      const microFee = +(RATE_PER_SECOND * 3).toFixed(2);

      setRecentEvents(prev => [
        {
          id: Math.random().toString(),
          tokenSymbol: randomToken.symbol,
          creatorHandle: randomToken.beneficiaryXHandle.replace(/^@/, ''),
          amountUsd: microFee > 0 ? microFee : 0.12,
          timeAgo: 'just now',
          txHash: (randomToken.mintAddress ? randomToken.mintAddress.slice(0, 6) : '4xK9') + '...'
        },
        ...prev.slice(0, 4),
      ]);
    }, 2800);

    return () => clearInterval(interval);
  }, [RATE_PER_SECOND, tokens]);

  const activeCreatorData = useMemo(() => {
    const clean = inputHandle.trim().replace(/^@/, '').toLowerCase();
    const found = FEATURED_CREATORS.find(c => c.handle.toLowerCase() === clean);
    return found || {
      handle: clean || 'creator',
      name: clean ? `@${clean}` : 'Creator',
      ticker: (clean ? clean.slice(0, 5).toUpperCase() : 'TOKEN'),
      avatar: `https://unavatar.io/x/${clean || 'twitter'}`
    };
  }, [inputHandle]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-16">
      
      {/* 1. Radical Dual-Pane Command Deck (Futuristic Launch Terminal + Live Holographic Card) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2 sm:pt-4">
        
        {/* Left Column: Command Launch Terminal */}
        <div className="lg:col-span-7 holo-card p-6 sm:p-10 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden border border-lime-500/30 shadow-2xl">
          <div className="space-y-4">
            
            {/* Live Holographic Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-xs font-mono font-bold text-lime-400">
              <Radio className="w-3.5 h-3.5 animate-pulse text-lime-400" />
              <span>FARTPAY CREATOR ROYALTY PROTOCOL</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] font-['Outfit']">
              Launch a meme coin for any <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-cyan-400">𝕏 creator</span>. We tip them 95%.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              100% permissionless. Deploy on Pump.fun and all trading royalties stream directly to the target creator's 𝕏 handle in USD. <strong className="text-slate-900 dark:text-white font-semibold">Zero manual claims needed.</strong>
            </p>

            {/* Interactive Handle Command Input */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-lime-400" />
                <span>Target Beneficiary 𝕏 Handle:</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-lime-400 font-bold font-mono">
                    @
                  </div>
                  <input
                    type="text"
                    value={inputHandle}
                    onChange={(e) => setInputHandle(e.target.value)}
                    placeholder="elonmusk, matt_furie, mrbeast..."
                    className="w-full pl-8 pr-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-lime-400 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playFartSound('rip');
                    onLaunchClick(inputHandle.trim().replace(/^@/, ''));
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/25 active:scale-95 shrink-0"
                >
                  <Rocket className="w-4 h-4 text-slate-950" />
                  <span>Launch ${activeCreatorData.ticker}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>

              {/* Quick Pick Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Popular:</span>
                {FEATURED_CREATORS.map(c => (
                  <button
                    key={c.handle}
                    type="button"
                    onClick={() => setInputHandle(c.handle)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      inputHandle.toLowerCase() === c.handle.toLowerCase()
                        ? 'bg-lime-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10'
                    }`}
                  >
                    @{c.handle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Metrics Matrix */}
          <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-center">
              <div className="text-[10px] text-slate-400 font-mono">CREATOR SHARE</div>
              <div className="text-lg font-black text-lime-400 font-mono">95% USD</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-center">
              <div className="text-[10px] text-slate-400 font-mono">BUY & BURN</div>
              <div className="text-lg font-black text-amber-400 font-mono">5% SOL</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-center">
              <div className="text-[10px] text-slate-400 font-mono">SETTLEMENT</div>
              <div className="text-lg font-black text-cyan-400 font-mono">&lt; 0.05s</div>
            </div>
          </div>
        </div>

        {/* Right Column: Holographic 3D Live Perspective Card Preview & Real-Time Stream */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* Holographic Interactive Card Preview */}
          <div className="holo-card p-6 rounded-3xl border border-lime-500/30 relative overflow-hidden space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Live Token Blueprint</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-lime-500/15 text-lime-400 border border-lime-500/30">
                95% TIP ACTIVE
              </span>
            </div>

            {/* Creator Identity Showcase */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
              <img
                src={activeCreatorData.avatar}
                alt={activeCreatorData.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-lime-400 shadow-md shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/elon-crypto.svg';
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                    {activeCreatorData.name} COIN
                  </h3>
                  <span className="font-mono text-xs font-bold text-lime-400 px-1.5 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
                    ${activeCreatorData.ticker}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                  Beneficiary: <span className="text-lime-400 font-bold">@{activeCreatorData.handle}</span>
                </p>
                <div className="text-[11px] text-lime-400 font-mono mt-0.5">
                  Est. 24h Royalties: <span className="font-bold">${(simulatedVolume * 0.0095).toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            {/* Bonding Curve Telemetry Bar */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Pump.fun Curve:</span>
                <span className="font-bold text-slate-900 dark:text-white">0.00 ◎ / 85.0 ◎ Target</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-[12%] rounded-full animate-pulse" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => onLaunchClick(activeCreatorData.handle)}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Zap className="w-4 h-4" />
              <span>Deploy ${activeCreatorData.ticker} to Solana</span>
            </button>
          </div>

          {/* Live Micro-Royalty Stream Telemetry */}
          <div className="holo-card p-4 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-900 dark:text-white font-mono">Live On-Chain Payout Stream</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">$120/hr Real-Time</span>
            </div>

            <div className="space-y-1.5">
              {recentEvents.slice(0, 3).map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-xs font-mono animate-fade-in"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-bold">+${event.amountUsd.toFixed(2)}</span>
                    <span className="text-slate-500">➔</span>
                    <span className="text-cyan-400 font-semibold truncate">@{event.creatorHandle}</span>
                    <span className="text-slate-400 font-normal">(${event.tokenSymbol})</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{event.timeAgo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Unified Master Metrics Matrix */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="holo-card p-5 rounded-2xl text-center space-y-1 border border-white/10">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            ${totalDisbursedUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>DISBURSED TO CREATORS</span>
          </div>
        </div>

        <div className="holo-card p-5 rounded-2xl text-center space-y-1 border border-white/10">
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            95.0%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            DIRECT TO 𝕏 PAYOUTS
          </div>
        </div>

        <div className="holo-card p-5 rounded-2xl text-center space-y-1 border border-white/10">
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            0-CLAIM
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            AUTONOMOUS SETTLEMENT
          </div>
        </div>

        <div className="holo-card p-5 rounded-2xl text-center space-y-1 border border-white/10">
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            5.0%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            AUTOMATIC BUY & BURN
          </div>
        </div>
      </section>

      {/* 3. Interactive Section Switcher (Tokens Grid / Revenue Simulator / Architecture) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTabSection('tokens')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTabSection === 'tokens'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              🔥 Live Meme Tokens ({tokens.length})
            </button>

            <button
              onClick={() => setActiveTabSection('simulator')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTabSection === 'simulator'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              ⚡ Creator Earnings Simulator
            </button>

            <button
              onClick={() => setActiveTabSection('architecture')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer hidden md:block ${
                activeTabSection === 'architecture'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              🛡️ Protocol Architecture
            </button>
          </div>

          <button
            type="button"
            onClick={() => onLaunchClick()}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            <span>Launch New Coin</span>
          </button>
        </div>

        {/* Tab 1: Live Meme Tokens Grid */}
        {activeTabSection === 'tokens' && (
          <>
            {tokens.length === 0 ? (
              <div className="holo-card p-10 sm:p-14 rounded-3xl border border-lime-500/30 text-center space-y-4 shadow-xl backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <Rocket className="w-8 h-8 text-lime-400 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                    No Tokens Launched Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                    Deploy your first token on Pump.fun and all trading royalties will stream directly to the beneficiary's 𝕏 handle in USD!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchClick()}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 hover:from-lime-300 hover:to-cyan-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-lime-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Rocket className="w-4 h-4 text-slate-950" />
                  <span>Launch First Meme Coin</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tokens.slice(0, 24).map((token) => (
                  <div
                    key={token.id}
                    className="holo-card p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-lime-500/30 group transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={token.logoUrl || '/assets/elon-crypto.svg'}
                            alt={token.name}
                            className="w-13 h-13 rounded-2xl object-cover border-2 border-lime-400/40 shrink-0 shadow-md"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
                                {token.name}
                              </h3>
                              <span className="font-mono text-xs font-bold text-lime-400">
                                ${token.symbol}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                              Creator: <span className="text-lime-400 font-semibold">@{token.beneficiaryXHandle.replace(/^@/, '')}</span>
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-lime-500/15 text-lime-400 border border-lime-500/30 shrink-0">
                          95% TIP
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {token.description}
                      </p>

                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Bonding Curve:</span>
                          <span className="font-bold text-slate-200">
                            {token.bondingCurveProgress ? `${token.bondingCurveProgress}%` : '5.2%'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-lime-400 to-cyan-400 rounded-full"
                            style={{ width: `${Math.min(100, token.bondingCurveProgress || 5.2)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Market Cap:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          ${(token.marketCapUsd || 3359.85).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://pump.fun/coin/${token.mintAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 px-3 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Pump.fun</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            playFartSound('wet');
                            onLaunchClick(token.beneficiaryXHandle.replace(/^@/, ''));
                          }}
                          className="h-10 px-3 rounded-xl bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 hover:from-lime-300 hover:to-cyan-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <Zap className="w-3.5 h-3.5 text-slate-950" />
                          <span>Launch Tip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab 2: Interactive Revenue Simulator */}
        {activeTabSection === 'simulator' && (
          <div className="holo-card p-6 sm:p-10 rounded-3xl border border-white/10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-300 font-mono">24H TRADING VOLUME:</span>
                    <span className="font-mono font-black text-2xl text-cyan-400">
                      ${simulatedVolume.toLocaleString()} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="1000000"
                    step="5000"
                    value={simulatedVolume}
                    onChange={(e) => setSimulatedVolume(Number(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>$2,000</span>
                    <span>$250,000</span>
                    <span>$1,000,000+</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-slate-400">PUMP.FUN FEE:</div>
                    <div className="font-bold text-white text-base">1.0% on Trades</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="text-slate-400">CREATOR ROYALTY:</div>
                    <div className="font-bold text-emerald-400 text-base">95% to 𝕏 Handle</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-950 to-slate-900 border border-cyan-500/30 space-y-5">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  ESTIMATED CREATOR USD FLOW
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono">Daily Direct Payout:</div>
                  <div className="text-4xl font-black text-emerald-400 font-mono">
                    ${dailyCreatorUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="text-slate-400">30-Day Run Rate:</div>
                    <div className="text-lg font-bold text-white">
                      ${monthlyCreatorUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400">5% Burn:</div>
                    <div className="text-amber-400 font-bold">${burnDailyUsd.toFixed(2)}/d</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchClick()}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-lg"
                >
                  Launch Meme Coin for Creator
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Architecture Section */}
        {activeTabSection === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="holo-card p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-black text-base">
                01
              </div>
              <h3 className="text-base font-bold text-white">Deploy on Pump.fun</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Tokens deploy on Solana with 100% fair bonding curve liquidity. Creator address is locked to the FARTPAY Treasury Router.
              </p>
            </div>

            <div className="holo-card p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-black text-base">
                02
              </div>
              <h3 className="text-base font-bold text-white">Autonomous Treasury Router</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                95% of creator fees are claimed on-chain and auto-converted to USD via institutional spot off-ramps (Kraken & FedNow).
              </p>
            </div>

            <div className="holo-card p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-black text-base">
                03
              </div>
              <h3 className="text-base font-bold text-white">Direct 𝕏 Money Settlement</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                USD deposits directly into the creator's 𝕏 handle balance in &lt;0.05s. Zero manual wallet signing or gas needed.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 4. Infinite Loop of Famous Creators */}
      <FamousUsersInfiniteMarquee onLaunchForUser={(handle) => onLaunchClick(handle)} />

    </div>
  );
};
