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
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Explore</span>
              </button>

              <button
                onClick={() => setActiveTab('launch')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'launch'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>Launch Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('fees')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'fees'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Royalty Flow</span>
              </button>

              <button
                onClick={() => setActiveTab('streamers')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'streamers'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>OBS Hub</span>
              </button>

              <button
                onClick={() => setActiveTab('payouts')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'payouts'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span className="font-bold">𝕏</span>
                <span>Payouts</span>
              </button>

              <button
                onClick={() => setActiveTab('how-it-works')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'how-it-works'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Docs</span>
              </button>
            </nav>

            {/* Header Right Action Suite */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Live Gas Pressure Interactive Pill */}
              <button
                type="button"
                onClick={() => playFartSound('random')}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 text-lime-600 dark:text-lime-400 text-xs font-mono font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                title="Click to release test gas puff!"
              >
                <Wind className="w-3.5 h-3.5 animate-pulse" />
                <span>GAS: 99.8%</span>
              </button>

              {/* Wallet Connect Button */}
              <button
                type="button"
                onClick={onToggleWallet}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  connectedWallet
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>{connectedWallet ? truncate(connectedWallet) : 'Connect'}</span>
              </button>

              {/* Theme Toggle */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl transition-colors cursor-pointer"
                  title={isDarkMode ? 'Light mode' : 'Dark mode'}
                  aria-label="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                </button>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#060a12]/95 backdrop-blur-2xl p-4 space-y-2 animate-fade-in">
            <button
              onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-left font-bold text-sm flex items-center justify-between ${
                activeTab === 'home' ? 'bg-cyan-500/10 text-cyan-500' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4" />
                <span>Explore Showcase</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('launch'); setIsMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-left font-bold text-sm flex items-center justify-between ${
                activeTab === 'launch' ? 'bg-cyan-500/10 text-cyan-500' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-4 h-4" />
                <span>Launch Meme Token</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('fees'); setIsMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-left font-bold text-sm flex items-center justify-between ${
                activeTab === 'fees' ? 'bg-cyan-500/10 text-cyan-500' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Coins className="w-4 h-4" />
                <span>Royalty Fee Flow</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('streamers'); setIsMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-left font-bold text-sm flex items-center justify-between ${
                activeTab === 'streamers' ? 'bg-cyan-500/10 text-cyan-500' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>Streamers OBS Hub</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setActiveTab('payouts'); setIsMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-left font-bold text-sm flex items-center justify-between ${
                activeTab === 'payouts' ? 'bg-cyan-500/10 text-cyan-500' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold">𝕏</span>
                <span>𝕏 Money Payouts</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}
      </header>
    </>
  );
};
