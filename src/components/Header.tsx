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
  BookOpen,
  HelpCircle,
  Search,
  Moon,
  Sun
} from 'lucide-react';
import { TreasuryConfig } from '../types';
import { XpaidLogo } from './XpaidLogo';
import { getLiveSolBalance } from '../services/solanaLaunch';

interface HeaderProps {
  activeTab: 'launch' | 'fees' | 'payouts' | 'lookup' | 'how-it-works';
  setActiveTab: (tab: 'launch' | 'fees' | 'payouts' | 'lookup' | 'how-it-works') => void;
  treasuryConfig: TreasuryConfig;
  totalCollectedUsd: number;
  totalDisbursedUsd: number;
  connectedWallet: string | null;
  onToggleWallet: () => void;
  onOpenSettings?: () => void;
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
  onOpenSettings,
  isDarkMode = true,
  onToggleTheme,
  onOpenProofBadge,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

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
        // Handled silently with fallback in getLiveSolBalance
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
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
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-30 shadow-xs transition-colors">
        {/* Top Banner with Platform Status & Treasury Addresses - Swipeable on mobile */}
        <div className="bg-zinc-950 text-zinc-300 text-xs py-1.5 px-3 sm:px-4 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none whitespace-nowrap">
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-zinc-100 text-[11px] sm:text-xs">Live Fee Bridge</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded text-[10px] sm:text-[11px] border border-emerald-800/60">● Pump.fun (Solana) Active</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-400 text-[10px] sm:text-[11px] hidden sm:inline">Zero-Claim 𝕏 Money Settlement</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Solana Treasury Pill with live balance */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-zinc-300 border border-zinc-800 text-[11px]">
                <span className="text-purple-400 font-bold text-[10px] sm:text-[11px]">SOL:</span>
                <span className="font-mono text-zinc-200 text-[10px] sm:text-[11px]">{truncate(treasuryConfig.solanaTreasuryAddress)}</span>

                {solBalance !== null && (
                  <span 
                    className="text-[9px] sm:text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold flex items-center gap-1"
                    title="Live Solana Mainnet Balance from Helius RPC"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {solBalance.toFixed(2)} SOL
                  </span>
                )}

                <button 
                  onClick={() => copyToClipboard(treasuryConfig.solanaTreasuryAddress, 'sol')}
                  className="hover:text-white transition-colors ml-0.5"
                  title="Copy Solana Treasury Address"
                >
                  {copiedAddress === 'sol' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                </button>
                
                <a
                  href={`https://solscan.io/account/${treasuryConfig.solanaTreasuryAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-300 transition-colors text-zinc-400"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Helius RPC Status Pill */}
              <div 
                className="hidden md:flex items-center gap-1.5 bg-emerald-950/70 px-2 py-0.5 rounded text-emerald-300 border border-emerald-700/50 text-[10px]"
                title="Helius Solana Mainnet RPC Live"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold">Helius RPC Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Nav Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo & App Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => setActiveTab('launch')}>
              <XpaidLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Xpaid</h1>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    X Money
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Pump.fun Creator Fees → 𝕏 Money Automatic Payouts
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm">
              <button
                id="tab-launch"
                onClick={() => setActiveTab('launch')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'launch'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Launch Token</span>
              </button>

              <button
                id="tab-fees"
                onClick={() => setActiveTab('fees')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'fees'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Fee Collector</span>
              </button>

              <button
                id="tab-payouts"
                onClick={() => setActiveTab('payouts')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'payouts'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-700 w-4 h-4 rounded-full inline-flex items-center justify-center">𝕏</span>
                <span>Auto-Disburse Queue</span>
              </button>

              <button
                id="tab-lookup"
                onClick={() => setActiveTab('lookup')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'lookup'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>𝕏 Directory</span>
              </button>

              <button
                id="tab-how-it-works"
                onClick={() => setActiveTab('how-it-works')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'how-it-works'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>How It Works</span>
              </button>
            </nav>

            {/* Wallet, Theme and Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Payouts: <strong className="font-bold">LIVE</strong></span>
              </div>

              {onOpenProofBadge && (
                <button
                  type="button"
                  onClick={onOpenProofBadge}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer"
                  title="Open Public Proof Badge for 𝕏"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>𝕏 Proof Badge</span>
                </button>
              )}

              {onToggleTheme && (
                <button
                  id="btn-toggle-theme"
                  type="button"
                  onClick={onToggleTheme}
                  className="p-1.5 sm:p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all shrink-0"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
                </button>
              )}

              <button
                id="btn-connect-wallet"
                onClick={onToggleWallet}
                className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all ${
                  connectedWallet
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xs'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>{connectedWallet ? truncate(connectedWallet) : 'Connect'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Quick Bar - Streamlined on mobile */}
        <div className="bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 py-1.5 sm:py-2 px-3 sm:px-8 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar touch-scroll">
            <div className="flex items-center gap-3 sm:gap-6 min-w-max">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 uppercase text-[9px] sm:text-[10px] tracking-wider font-medium">In Treasury:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm font-mono">${totalCollectedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 uppercase text-[9px] sm:text-[10px] tracking-wider font-medium">To 𝕏 Money:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-mono">${totalDisbursedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="hidden sm:block h-3.5 w-px bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-zinc-400 uppercase text-[10px] tracking-wider font-medium">Pending:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-mono">
                  ${Math.max(0, totalCollectedUsd * (treasuryConfig.defaultFeeSplitToXUser / 100) - totalDisbursedUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                <span>80% Auto-Disburse</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (App Experience) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 px-2 pt-1.5 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-colors"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Launch Tab */}
          <button
            id="mobile-nav-launch"
            onClick={() => setActiveTab('launch')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'launch'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === 'launch' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400' : ''}`}>
              <Rocket className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Launch</span>
          </button>

          {/* Fees Tab */}
          <button
            id="mobile-nav-fees"
            onClick={() => setActiveTab('fees')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'fees'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === 'fees' ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400' : ''}`}>
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Fees</span>
          </button>

          {/* Payouts Tab */}
          <button
            id="mobile-nav-payouts"
            onClick={() => setActiveTab('payouts')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === 'payouts' ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400' : ''}`}>
              <span className="w-4 h-4 flex items-center justify-center font-black text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded">𝕏</span>
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Payouts</span>
          </button>

          {/* Directory Tab */}
          <button
            id="mobile-nav-lookup"
            onClick={() => setActiveTab('lookup')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'lookup'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === 'lookup' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400' : ''}`}>
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Directory</span>
          </button>

          {/* How-To Tab */}
          <button
            id="mobile-nav-how-it-works"
            onClick={() => setActiveTab('how-it-works')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'how-it-works'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${activeTab === 'how-it-works' ? 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400' : ''}`}>
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Guide</span>
          </button>
        </div>
      </nav>
    </>
  );
};
