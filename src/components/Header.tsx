import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Wallet, 
  Coins, 
  ArrowUpRight, 
  Check, 
  Copy, 
  Sparkles,
  ExternalLink, 
  ShieldCheck, 
  Search, 
  Moon, 
  Sun, 
  HelpCircle, 
  Compass,
  Tv,
  MoreHorizontal,
  X,
  Layers,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  Radio,
  Wind
} from 'lucide-react';
import { TreasuryConfig } from '../types';
import { FartPayLogo } from './FartPayLogo';
import { playFartSound } from '../utils/fartSound';
import { getLiveSolBalance } from '../services/solanaLaunch';
import { fetchLiveSolPrice, subscribeToSolPrice } from '../services/solPriceService';

interface HeaderProps {
  activeTab: 'home' | 'launch' | 'fees' | 'payouts' | 'lookup' | 'how-it-works' | 'streamers';
  setActiveTab: (tab: 'home' | 'launch' | 'fees' | 'payouts' | 'lookup' | 'how-it-works' | 'streamers') => void;
  treasuryConfig: TreasuryConfig;
  totalCollectedUsd: number;
  totalDisbursedUsd: number;
  connectedWallet: string | null;
  onToggleWallet: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenProofBadge?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  treasuryConfig,
  totalCollectedUsd,
  totalDisbursedUsd,
  connectedWallet,
  onToggleWallet,
  isDarkMode = true,
  onToggleTheme,
  onOpenProofBadge,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number>(110.65);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBalance = async () => {
      try {
        const bal = await getLiveSolBalance(
          treasuryConfig.solanaTreasuryAddress,
          treasuryConfig.solanaRpcUrl
        );
        if (isMounted && typeof bal === 'number') {
          setSolBalance(bal);
        }
      } catch {
        // Silently handled
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);

    fetchLiveSolPrice().then(p => {
      if (isMounted && p > 0) setSolPrice(p);
    });
    const unsubPrice = subscribeToSolPrice(p => {
      if (isMounted && p > 0) setSolPrice(p);
    });
    const pricePoll = setInterval(() => {
      fetchLiveSolPrice().then(p => {
        if (isMounted && p > 0) setSolPrice(p);
      });
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(pricePoll);
      unsubPrice();
    };
  }, [treasuryConfig.solanaTreasuryAddress, treasuryConfig.solanaRpcUrl]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(label);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const truncate = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <>
      {/* Top Live Network Telemetry Strip */}
      <div className="border-b border-white/5 bg-[#03060c]/90 text-[11px] font-mono text-slate-400 py-1 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">SOLANA MAINNET:</span>
              <span className="text-emerald-400 font-bold">2,914 TPS</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span>TREASURY:</span>
              <button 
                onClick={() => copyToClipboard(treasuryConfig.solanaTreasuryAddress, 'treasury')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{truncate(treasuryConfig.solanaTreasuryAddress)}</span>
                {copiedAddress === 'treasury' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">SOL/USD:</span>
              <span className="text-white font-bold">${solPrice.toFixed(2)}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span>95% CREATOR SPLIT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Holographic Header */}
      <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#060a12]/80 backdrop-blur-2xl sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo Brand with Hologram Pulse */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => setActiveTab('home')}
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-400 opacity-60 blur-xs group-hover:opacity-100 transition-opacity" />
                <FartPayLogo className="w-10 h-10 sm:w-11 sm:h-11 relative shrink-0" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                    FART<span className="text-cyan-400">PAY</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    PROTOCOL
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 -mt-1 hidden xs:block">
                  Pump.fun ➔ 𝕏 Royalty Rails
                </span>
              </div>
            </div>

            {/* Futuristic Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-xs font-semibold backdrop-blur-md">
              <button
                onClick={() => { playFartSound('random'); setActiveTab('home'); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md shadow-lime-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Explore</span>
              </button>

              <button
                onClick={() => { playFartSound('random'); setActiveTab('launch'); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'launch'
                    ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md shadow-lime-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>Launch Studio</span>
              </button>

              <button
                onClick={() => { playFartSound('random'); setActiveTab('fees'); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'fees'
                    ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md shadow-lime-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Royalty Flow</span>
              </button>

              <button
                onClick={() => { playFartSound('random'); setActiveTab('streamers'); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'streamers'
                    ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md shadow-lime-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>OBS Hub</span>
              </button>

              <button
                onClick={() => { playFartSound('random'); setActiveTab('payouts'); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'payouts'
                    ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md shadow-lime-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span className="font-bold">𝕏</span>
                <span>Payouts</span>
              </button>

              <button
                onClick={() => { playFartSound('random'); setActiveTab('lookup'); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'lookup'
                    ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md shadow-lime-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Directory</span>
              </button>

              <button
                onClick={() => { playFartSound('random'); setActiveTab('how-it-works'); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'how-it-works'
                    ? 'bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md shadow-lime-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Docs</span>
              </button>
            </nav>

            {/* Header Right Action Suite */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Theme Toggle */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="p-1.5 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl transition-colors cursor-pointer"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                </button>
              )}

              {/* Wallet Connect Button */}
              <button
                type="button"
                onClick={onToggleWallet}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-md ${
                  connectedWallet
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 hover:from-lime-300 hover:to-cyan-300 text-slate-950 font-black'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{connectedWallet ? truncate(connectedWallet) : 'Connect'}</span>
              </button>

              {/* Mobile More Options Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"
                aria-label="More navigation options"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Top Horizontal Quick-Tabs Bar */}
        <div className="lg:hidden border-t border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-slate-950/90 px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('home'); }}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-lime-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-white bg-slate-200/60 dark:bg-white/5'
            }`}
          >
            Explore
          </button>

          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('lookup'); }}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'lookup'
                ? 'bg-lime-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-white bg-slate-200/60 dark:bg-white/5'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-lime-400" />
            <span>𝕏 Directory</span>
          </button>

          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('launch'); }}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'launch'
                ? 'bg-lime-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-white bg-slate-200/60 dark:bg-white/5'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-lime-400" />
            <span>Launch</span>
          </button>

          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('fees'); }}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold transition-all ${
              activeTab === 'fees'
                ? 'bg-lime-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-white bg-slate-200/60 dark:bg-white/5'
            }`}
          >
            Royalties
          </button>

          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('payouts'); }}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold transition-all ${
              activeTab === 'payouts'
                ? 'bg-lime-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-white bg-slate-200/60 dark:bg-white/5'
            }`}
          >
            𝕏 Payouts
          </button>

          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('streamers'); }}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold transition-all ${
              activeTab === 'streamers'
                ? 'bg-cyan-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-white bg-slate-200/60 dark:bg-white/5'
            }`}
          >
            OBS
          </button>

          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('how-it-works'); }}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-bold transition-all ${
              activeTab === 'how-it-works'
                ? 'bg-lime-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-white bg-slate-200/60 dark:bg-white/5'
            }`}
          >
            Docs
          </button>
        </div>

        {/* Mobile Dropdown Sheet for extra items like Docs / Streamers */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#060a12]/95 backdrop-blur-2xl p-4 space-y-3 animate-fade-in shadow-2xl">
            {/* Quick Theme Selection Row */}
            {onToggleTheme && (
              <div className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => { onToggleTheme(); }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                  <span>Toggle Theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>
            )}

            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 pb-1">Navigation</div>
            
            <button
              onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-left font-bold text-xs sm:text-sm flex items-center justify-between ${
                activeTab === 'home' ? 'bg-lime-500/15 text-lime-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-lime-400" />
                <span>Explore Showcase</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('launch'); setIsMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-left font-bold text-xs sm:text-sm flex items-center justify-between ${
                activeTab === 'launch' ? 'bg-lime-500/15 text-lime-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Rocket className="w-4 h-4 text-lime-400" />
                <span>Launch Meme Token</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('fees'); setIsMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-left font-bold text-xs sm:text-sm flex items-center justify-between ${
                activeTab === 'fees' ? 'bg-lime-500/15 text-lime-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Coins className="w-4 h-4 text-lime-400" />
                <span>Royalty Fee Flow</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('streamers'); setIsMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-left font-bold text-xs sm:text-sm flex items-center justify-between ${
                activeTab === 'streamers' ? 'bg-lime-500/15 text-lime-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>Streamers OBS Hub</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('payouts'); setIsMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-left font-bold text-xs sm:text-sm flex items-center justify-between ${
                activeTab === 'payouts' ? 'bg-lime-500/15 text-lime-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-lime-400">𝕏</span>
                <span>𝕏 Money Payouts</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('lookup'); setIsMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-left font-bold text-xs sm:text-sm flex items-center justify-between ${
                activeTab === 'lookup' ? 'bg-lime-500/15 text-lime-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-lime-400" />
                <span>𝕏 Creator Directory</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('how-it-works'); setIsMobileMenuOpen(false); }}
              className={`w-full p-2.5 rounded-xl text-left font-bold text-xs sm:text-sm flex items-center justify-between ${
                activeTab === 'how-it-works' ? 'bg-lime-500/15 text-lime-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Documentation & FAQ</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
      </header>

      {/* Ultra-Ergonomic Mobile Bottom App Dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-safe pt-2 bg-[#060a12]/95 backdrop-blur-2xl border-t border-lime-500/20 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center pb-2">
          
          {/* 1. Explore Button */}
          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('home'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-lime-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'home' ? 'text-lime-400 animate-pulse' : ''}`} />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Explore</span>
          </button>

          {/* 2. Creator Directory Button */}
          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('lookup'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'lookup'
                ? 'text-lime-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className={`w-5 h-5 ${activeTab === 'lookup' ? 'text-lime-400 animate-pulse' : ''}`} />
            <span className="text-[10px] font-mono tracking-tight mt-0.5 font-bold">Directory</span>
          </button>

          {/* 3. Center Glowing LAUNCH Button (Exactly in the middle) */}
          <div className="flex justify-center -mt-5">
            <button
              type="button"
              onClick={() => { playFartSound('rip'); setActiveTab('launch'); }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-400 via-emerald-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-lime-500/30 border-2 border-black hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Launch Meme Token"
            >
              <Rocket className="w-6 h-6 text-slate-950 fill-slate-950" />
            </button>
          </div>

          {/* 4. Royalties Flow */}
          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('fees'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'fees'
                ? 'text-lime-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className={`w-5 h-5 ${activeTab === 'fees' ? 'text-lime-400' : ''}`} />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Royalties</span>
          </button>

          {/* 5. Payouts */}
          <button
            type="button"
            onClick={() => { playFartSound('random'); setActiveTab('payouts'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'text-lime-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-base font-extrabold leading-none">𝕏</span>
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Payouts</span>
          </button>

        </div>
      </div>
    </>
  );
};
