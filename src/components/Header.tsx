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
  SlidersHorizontal,
  HelpCircle
} from 'lucide-react';
import { TreasuryConfig } from '../types';
import { XpaidLogo } from './XpaidLogo';
import { getLiveSolBalance } from '../services/solanaLaunch';
import { fetchLiveSolPrice, subscribeToSolPrice } from '../services/solPriceService';

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
  const [solPrice, setSolPrice] = useState<number>(110.65);

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
        // Handled silently
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
      <header className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Brand */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => setActiveTab('launch')}
            >
              <XpaidLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 transition-transform group-hover:scale-105" />
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Xpaid
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                  𝕏 Money Bridge
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs - Sleek Apple/Linear style pills */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800/80 text-xs font-medium">
              <button
                id="tab-launch"
                onClick={() => setActiveTab('launch')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'launch'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Launch</span>
              </button>

              <button
                id="tab-fees"
                onClick={() => setActiveTab('fees')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'fees'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Fee Flow</span>
              </button>

              <button
                id="tab-payouts"
                onClick={() => setActiveTab('payouts')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'payouts'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span className="font-bold text-[11px]">𝕏</span>
                <span>Disbursements</span>
              </button>

              <button
                id="tab-lookup"
                onClick={() => setActiveTab('lookup')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'lookup'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Directory</span>
              </button>

              <button
                id="tab-how-it-works"
                onClick={() => setActiveTab('how-it-works')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'how-it-works'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Guide</span>
              </button>
            </nav>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* SOL Live Price Indicator */}
              <div 
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300"
                title="Live SOL Market Price"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-zinc-400">SOL:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">${solPrice.toFixed(2)}</span>
              </div>

              {/* Proof Badge Modal Button */}
              {onOpenProofBadge && (
                <button
                  type="button"
                  onClick={onOpenProofBadge}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
                  title="View Public Transparency Proofs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Proofs</span>
                </button>
              )}

              {/* Settings Button */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors"
                  title="Treasury & Off-Ramp Settings"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              )}

              {/* Theme Toggle */}
              {onToggleTheme && (
                <button
                  id="btn-toggle-theme"
                  type="button"
                  onClick={onToggleTheme}
                  className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors"
                  title={isDarkMode ? 'Light mode' : 'Dark mode'}
                  aria-label="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              {/* Wallet Button */}
              <button
                id="btn-connect-wallet"
                onClick={onToggleWallet}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all ${
                  connectedWallet
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span>{connectedWallet ? truncate(connectedWallet) : 'Connect Wallet'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 shadow-lg"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            id="mobile-nav-launch"
            onClick={() => setActiveTab('launch')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'launch'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <Rocket className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Launch</span>
          </button>

          <button
            id="mobile-nav-fees"
            onClick={() => setActiveTab('fees')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'fees'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <Coins className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Fee Flow</span>
          </button>

          <button
            id="mobile-nav-payouts"
            onClick={() => setActiveTab('payouts')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'payouts'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <span className="font-bold text-xs mb-0.5">𝕏</span>
            <span className="text-[10px]">Payouts</span>
          </button>

          <button
            id="mobile-nav-lookup"
            onClick={() => setActiveTab('lookup')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'lookup'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <Search className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Directory</span>
          </button>

          <button
            id="mobile-nav-how-it-works"
            onClick={() => setActiveTab('how-it-works')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
              activeTab === 'how-it-works'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <HelpCircle className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Guide</span>
          </button>
        </div>
      </nav>
    </>
  );
};
