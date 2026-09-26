import React, { useState } from 'react';
import { 
  Rocket, 
  Sparkles, 
  ArrowRight, 
  Coins, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Zap, 
  TrendingUp, 
  Flame, 
  Search,
  Globe,
  Layers,
  DollarSign
} from 'lucide-react';
import { TokenLaunchData, TreasuryConfig } from '../types';
import { KNOWN_X_USERS } from '../data/mockData';
import { TippedLogo } from './TippedLogo';

interface FrontLandingPageProps {
  tokens: TokenLaunchData[];
  treasuryConfig: TreasuryConfig;
  totalCollectedUsd: number;
  totalDisbursedUsd: number;
  onLaunchClick: (handle?: string) => void;
  onNavigateToFees: () => void;
  onNavigateToPayouts: () => void;
  onNavigateToLookup: () => void;
  onNavigateToHowItWorks: () => void;
}

const FEATURED_ACCOUNTS = [
  {
    handle: '@elonmusk',
    name: 'Elon Musk',
    avatar: 'https://pbs.twimg.com/profile_images/1838634862464733184/pXj9iWd0_400x400.jpg',
    tagline: 'CTO of 𝕏 & SpaceX',
    followers: '198M',
    badge: 'gold',
    status: 'Ready for Launch'
  },
  {
    handle: '@matt_furie',
    name: 'Matt Furie',
    avatar: 'https://pbs.twimg.com/profile_images/1535359740523499520/oU3K66_B_400x400.jpg',
    tagline: 'Creator of Pepe the Frog',
    followers: '240K',
    badge: 'blue',
    status: 'Token Active'
  },
  {
    handle: '@cz_binance',
    name: 'CZ 🔶',
    avatar: 'https://pbs.twimg.com/profile_images/1601053427840139265/oQf7_Rsp_400x400.jpg',
    tagline: 'Binance Founder',
    followers: '8.9M',
    badge: 'gold',
    status: 'Four.meme BNB Soon'
  },
  {
    handle: '@solana',
    name: 'Solana',
    avatar: 'https://pbs.twimg.com/profile_images/1792646274477015040/V5x7o7aK_400x400.jpg',
    tagline: 'Solana Foundation',
    followers: '2.8M',
    badge: 'gold',
    status: 'Ready for Launch'
  }
];

export const FrontLandingPage: React.FC<FrontLandingPageProps> = ({
  tokens,
  treasuryConfig,
  totalCollectedUsd,
  totalDisbursedUsd,
  onLaunchClick,
  onNavigateToFees,
  onNavigateToPayouts,
  onNavigateToLookup,
  onNavigateToHowItWorks,
}) => {
  const [searchHandle, setSearchHandle] = useState('');

  const handleQuickLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchHandle.trim().replace(/^@/, '');
    onLaunchClick(clean ? `@${clean}` : undefined);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-16 sm:space-y-24 relative z-10">
      
      {/* 1. Hero Section for Tipped Protocol */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        
        {/* Tipped Brand Emblem */}
        <div className="flex justify-center -mb-1">
          <TippedLogo className="w-16 h-16 sm:w-20 sm:h-20 shadow-2xl rounded-3xl border border-cyan-500/40" />
        </div>

        {/* Top Status Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-xs font-semibold text-cyan-800 dark:text-cyan-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Tipped Protocol • Pump.fun Automated 𝕏 Royalty Rails</span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">95% to 𝕏 User</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1] font-['Outfit']">
          Create a memecoin for <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            any 𝕏 user.
          </span>
        </h1>

        {/* Value Proposition Subtitle */}
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">We pay the 𝕏 User, not the creator.</strong> <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">95% of all trading fees</strong> are collected and automatically converted to USD deposited straight into the targeted 𝕏 user&apos;s account. <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">5%</strong> is bought & burned.
        </p>

        {/* Core Interactive Action Bar (Search & Launch) */}
        <div className="pt-2 max-w-xl mx-auto">
          <form onSubmit={handleQuickLaunch} className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl sm:rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-xl focus-within:border-cyan-500 transition-all">
            <div className="flex items-center gap-2 flex-1 w-full px-4 py-2 sm:py-0">
              <span className="text-cyan-500 font-bold text-base">@</span>
              <input
                type="text"
                value={searchHandle}
                onChange={(e) => setSearchHandle(e.target.value)}
                placeholder="elonmusk, matt_furie, creator..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl sm:rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:scale-95 text-slate-950 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Rocket className="w-4 h-4 text-slate-950" />
              <span>Launch Coin</span>
              <ArrowRight className="w-4 h-4 ml-0.5 text-slate-950" />
            </button>
          </form>

          {/* Quick Click Popular Creators */}
          <div className="flex items-center justify-center gap-2 pt-3 flex-wrap text-xs text-zinc-500">
            <span>Popular:</span>
            {['@elonmusk', '@matt_furie', '@cz_binance', '@solana'].map((handle) => (
              <button
                key={handle}
                type="button"
                onClick={() => onLaunchClick(handle)}
                className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono text-[11px] cursor-pointer"
              >
                {handle}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Navigation Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onNavigateToFees}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Live Fee Flow</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToPayouts}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="font-bold text-[11px] text-cyan-400">𝕏</span>
            <span>Check 𝕏 Disbursements</span>
          </button>
        </div>

      </div>

      {/* 2. Live Protocol Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Creator Cut</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            95%
          </div>
          <p className="text-[11px] text-zinc-500">Direct USD conversion to 𝕏 balance</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Buy & Burn</span>
            <span className="p-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            5%
          </div>
          <p className="text-[11px] text-zinc-500">Auto buy & burn on every trade</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Total Disbursed</span>
            <span className="p-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            ${totalDisbursedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-500">FedNow & 𝕏 Money Instant Rails</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Security Model</span>
            <span className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            2-Tx
          </div>
          <p className="text-[11px] text-zinc-500">On-chain legally bound royalties</p>
        </div>

      </div>

      {/* 3. Multi-Chain Ecosystem Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Supported Launchpads & Off-Ramps
            </h2>
            <p className="text-xs text-zinc-500">Multi-chain meme bonding curves and direct fiat settlement</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Multi-Chain
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Pump.fun (Solana) - LIVE */}
          <div 
            onClick={() => onLaunchClick()}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 hover:border-emerald-500 shadow-md hover:shadow-lg transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Pump.fun</span>
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

          {/* Four.meme (BNB Chain) - SOON */}
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

      {/* 4. Featured 𝕏 Accounts Ready for Token Launch */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Featured 𝕏 Accounts
            </h2>
            <p className="text-xs text-zinc-500">Click any account to launch a token for them</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToLookup}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Search all 𝕏 users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_ACCOUNTS.map((acc) => (
            <div
              key={acc.handle}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {acc.name}
                    </span>
                    {acc.badge === 'gold' && <span className="text-[11px]">🔶</span>}
                    {acc.badge === 'blue' && <span className="text-sky-500 text-[11px]">✓</span>}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono truncate">
                    {acc.handle}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                    {acc.tagline}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400">
                  {acc.followers} followers
                </span>
                <button
                  type="button"
                  onClick={() => onLaunchClick(acc.handle)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Rocket className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                  <span>Launch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Live Launched Tokens Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Live Token Fee Streams
            </h2>
            <p className="text-xs text-zinc-500">Active bonding curves routing 95% royalties on Solana</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToFees}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Fee Flow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <Rocket className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">No tokens launched yet</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Launch a meme coin for any 𝕏 creator to start collecting and streaming 95% trading royalties.
            </p>
            <button
              type="button"
              onClick={() => onLaunchClick()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Launch First Token</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.slice(0, 3).map((tok) => (
              <div
                key={tok.id || tok.mintAddress}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={tok.logoUrl}
                    alt={tok.name}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {tok.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
                        ${tok.symbol}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-0.5">
                      Beneficiary: {tok.beneficiaryXHandle} (95%)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Market Cap</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      ${(tok.marketCapUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Curve Progress</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {(tok.bondingCurveProgress ?? 0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://pump.fun/coin/${tok.mintAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Trade on Pump.fun</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onLaunchClick(tok.beneficiaryXHandle)}
                    className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                    title="Launch Another Coin for this Handle"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. How It Works - 3 Step Cards */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Automated, non-custodial, and legally bound to the target 𝕏 creator
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Launch with 2-Tx Protocol
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Enter any 𝕏 handle, upload artwork to IPFS, and sign the token deployment on Pump.fun with verified fee-sharing royalty binding.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Automatic Fee Harvesting
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              100% of Pump.fun creator fees accrue directly to the protocol treasury on every trade through the on-chain PumpFees program.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Instant 𝕏 Money Settlement
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Once 0.01 SOL in trading royalties is generated, 95% is automatically converted from SOL to USD and deposited directly into the creator&apos;s 𝕏 Money balance with zero gas or claiming required.
            </p>
          </div>

        </div>
      </div>

      {/* 7. Bottom Call to Action */}
      <div className="text-center p-8 sm:p-12 rounded-3xl bg-zinc-900 dark:bg-zinc-800 text-white space-y-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to monetize any 𝕏 account?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Join the automated meme royalty revolution. Deploy in 30 seconds with 2-transaction security.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onLaunchClick()}
              className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 mx-auto shadow-xl transition-all cursor-pointer active:scale-95"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch a Token Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
