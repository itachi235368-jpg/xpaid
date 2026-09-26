import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { connectRealWallet, getLiveSolBalance } from '../services/solanaLaunch';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
  currentConnectedAddress?: string | null;
  onDisconnect?: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  currentConnectedAddress,
  onDisconnect
}) => {
  const [hasPhantom, setHasPhantom] = useState(false);
  const [hasSolflare, setHasSolflare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const phantom = (window as any).phantom?.solana || (window as any).solana;
      setHasPhantom(Boolean(phantom?.isPhantom));
      setHasSolflare(Boolean((window as any).solflare));
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobileCheck);
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentConnectedAddress) {
      getLiveSolBalance(currentConnectedAddress).then(bal => setLiveBalance(bal));
    } else {
      setLiveBalance(null);
    }
  }, [currentConnectedAddress]);

  if (!isOpen) return null;

  const handleConnectPhantom = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const phantom = (window as any).phantom?.solana || (window as any).solana;
      if (!phantom && isMobile) {
        // Use Phantom Universal Connect Link / Browse Link
        const currentUrl = window.location.href;
        const appUrl = window.location.origin;
        const phantomConnectUrl = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(appUrl)}&redirect_link=${encodeURIComponent(currentUrl)}&cluster=mainnet-beta`;
        window.location.href = phantomConnectUrl;
        return;
      }

      const result = await connectRealWallet('phantom');
      onConnect(result.address);
      onClose();
    } catch (err: any) {
      console.error('Phantom connection error:', err);
      // If mobile extension missing, fallback to deep link
      if (isMobile) {
        const currentUrl = window.location.href;
        const appUrl = window.location.origin;
        window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(appUrl)}`;
        return;
      }
      setError(err?.message || 'Could not connect to Phantom.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectSolflare = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await connectRealWallet('solflare');
      onConnect(result.address);
      onClose();
    } catch (err: any) {
      console.error('Solflare connection error:', err);
      setError(err?.message || 'Could not connect to Solflare.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto text-zinc-900 dark:text-zinc-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base font-['Outfit'] tracking-tight">Connect Web3 Wallet</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Select your preferred Solana connection</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Connected Status if already connected */}
          {currentConnectedAddress && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Connected Wallet</span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Session
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-950/60 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span title={currentConnectedAddress} className="truncate max-w-[210px] text-zinc-700 dark:text-zinc-300">
                  {currentConnectedAddress}
                </span>
                {liveBalance !== null && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{liveBalance.toFixed(3)} SOL</span>
                )}
              </div>
              {onDisconnect && (
                <button
                  type="button"
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="w-full py-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-900/50 rounded-xl transition-colors font-semibold cursor-pointer"
                >
                  Disconnect Wallet
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-2xl text-xs text-red-800 dark:text-red-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900 dark:text-red-100">Connection Notice</p>
                  <p className="text-red-700 dark:text-red-300 text-[11px] mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Options */}
          <div className="space-y-3">
            {/* Phantom */}
            <button
              onClick={handleConnectPhantom}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-group cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl shadow-inner">
                  👻
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    Phantom Wallet
                    {hasPhantom ? (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                        Detected
                      </span>
                    ) : isMobile ? (
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-600/60 px-2 py-0.5 rounded-full font-bold">
                        Mobile App
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                        Extension
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {isMobile && !hasPhantom ? 'Open securely in Phantom Mobile Browser' : 'Connect official Solana browser extension'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-purple-500 transition-colors" />
            </button>

            {/* Solflare */}
            <button
              onClick={handleConnectSolflare}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all text-group cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
                  ☀️
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                    Solflare Wallet
                    {hasSolflare && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                        Detected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Secure Solana web & mobile wallet</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Verified Helius RPC Node
          </span>
          <a
            href="https://phantom.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Get Phantom <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
