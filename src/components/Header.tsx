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
  TrendingUp
} from 'lucide-react';
import { TreasuryConfig } from '../types';
import { TippedLogo } from './TippedLogo';
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

  const isMoreActive = ['payouts', 'lookup', 'how-it-works'].includes(activeTab);

  const handleMobileNav = (tab: HeaderProps['activeTab']) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* Logo & Brand */}
            <div 
              className="flex items-center gap-2 cursor-pointer select-none group"
              onClick={() => setActiveTab('home')}
            >
              <TippedLogo className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform group-hover:scale-105" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-['Outfit']">
                  TIPPED
                </span>
                <span className="hidden xs:inline-block text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                  Protocol
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800/80 text-xs font-medium">
              <button
                id="tab-home"
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-cyan-500" />
                <span>Explore</span>
              </button>

              <button
                id="tab-launch"
                onClick={() => setActiveTab('launch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'fees'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Fee Flow</span>
              </button>

              <button
                id="tab-streamers"
                onClick={() => setActiveTab('streamers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'streamers'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Streamers</span>
              </button>

              <button
                id="tab-payouts"
                onClick={() => setActiveTab('payouts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'payouts'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span className="font-bold text-[11px]">𝕏</span>
                <span>Payouts</span>
              </button>

              <button
                id="tab-lookup"
                onClick={() => setActiveTab('lookup')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* SOL Live Price Indicator (Desktop) */}
              <div 
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300"
                title="Live SOL Market Price"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-400">SOL:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">${solPrice.toFixed(2)}</span>
              </div>

              {/* Proof Badge Modal Button (Desktop) */}
              {onOpenProofBadge && (
                <button
                  type="button"
                  onClick={onOpenProofBadge}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                  title="View Public Transparency Proofs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Proofs</span>
                </button>
              )}

              {/* Official X / Twitter Link */}
              <a
                href="https://x.com/usetipped?s=11"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-colors"
                title="Follow @usetipped on 𝕏"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>@usetipped</span>
              </a>

              {/* Theme Toggle */}
              {onToggleTheme && (
                <button
                  id="btn-toggle-theme"
                  type="button"
                  onClick={onToggleTheme}
                  className="p-1.5 sm:p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer"
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
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-all cursor-pointer ${
                  connectedWallet
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white/90 shadow-2xs'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[85px] sm:max-w-none">
                  {connectedWallet ? truncate(connectedWallet) : 'Connect'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Mobile Bottom Navigation Bar (5 Balanced Native Tabs) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Tab 1: Explore */}
          <button
            id="mobile-nav-home"
            onClick={() => handleMobileNav('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-cyan-500 font-bold scale-105'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Explore</span>
          </button>

          {/* Tab 2: Fees */}
          <button
            id="mobile-nav-fees"
            onClick={() => handleMobileNav('fees')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'fees'
                ? 'text-cyan-500 font-bold scale-105'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <Coins className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Fee Flow</span>
          </button>

          {/* Tab 3: Launch - Center Hero Button */}
          <button
            id="mobile-nav-launch"
            onClick={() => handleMobileNav('launch')}
            className="flex flex-col items-center justify-center flex-1 -mt-4 cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              activeTab === 'launch'
                ? 'bg-gradient-to-tr from-cyan-500 to-teal-400 text-zinc-950 ring-4 ring-cyan-500/20'
                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 group-hover:scale-105'
            }`}>
              <Rocket className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold mt-1 ${activeTab === 'launch' ? 'text-cyan-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
              Launch
            </span>
          </button>

          {/* Tab 4: Streamers */}
          <button
            id="mobile-nav-streamers"
            onClick={() => handleMobileNav('streamers')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'streamers'
                ? 'text-cyan-500 font-bold scale-105'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <div className="relative">
              <Tv className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse ring-2 ring-white dark:ring-zinc-950" />
            </div>
            <span className="text-[10px] tracking-tight">Streamers</span>
          </button>

          {/* Tab 5: More (Action Sheet) */}
          <button
            id="mobile-nav-more"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              isMoreActive || isMobileMenuOpen
                ? 'text-cyan-500 font-bold scale-105'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Native-Style Action Sheet / Drawer for "More" */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sheet Body */}
          <div className="relative z-10 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <TippedLogo className="w-6 h-6 shrink-0" />
                <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 font-['Outfit']">
                  TIPPED Protocol Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleMobileNav('payouts')}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'payouts'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-500 font-semibold'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs">
                    𝕏
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">𝕏 Money Disbursements</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">View real USD deposits sent to creators</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => handleMobileNav('lookup')}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'lookup'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-500 font-semibold'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Creator Directory & Lookup</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Search any 𝕏 handle to see accrued fees</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => handleMobileNav('how-it-works')}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'how-it-works'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-500 font-semibold'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Architecture & Guide</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">How 95% Pump.fun fees stream to 𝕏 users</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>

              {onOpenProofBadge && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProofBadge();
                  }}
                  className="w-full p-3.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold">Transparency Proofs</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Verified Solana transactions & signatures</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Protocol Status Bar */}
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Solana Mainnet Price</span>
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ${solPrice.toFixed(2)} USD
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                <span>Treasury SOL:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {solBalance !== null ? `${solBalance.toFixed(3)} SOL` : '0.000 SOL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
