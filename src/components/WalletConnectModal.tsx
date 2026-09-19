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
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const phantom = (window as any).phantom?.solana || (window as any).solana;
      setHasPhantom(Boolean(phantom?.isPhantom));
      setHasSolflare(Boolean((window as any).solflare));
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
      const result = await connectRealWallet('phantom');
      onConnect(result.address);
      onClose();
    } catch (err: any) {
      console.error('Phantom connection error:', err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-zinc-100 text-base">Connect Solana Wallet</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Connected Status if already connected */}
          {currentConnectedAddress && (
            <div className="p-3.5 bg-zinc-800/80 rounded-xl border border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Currently Connected</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-200">
                <span title={currentConnectedAddress} className="truncate max-w-[200px]">
                  {currentConnectedAddress}
                </span>
                {liveBalance !== null && (
                  <span className="text-emerald-400 font-semibold">{liveBalance.toFixed(2)} SOL</span>
                )}
              </div>
              {onDisconnect && (
                <button
                  type="button"
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-800/50 rounded-lg transition-colors font-medium"
                >
                  Disconnect Wallet
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-200">Notice</p>
                  <p>{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.open(window.location.href, '_blank')}
                className="w-full mt-1.5 py-1.5 px-3 bg-red-900/50 hover:bg-red-900 border border-red-700/60 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open App in New Tab (Direct Browser Window)
              </button>
            </div>
          )}

          {/* Wallet Options */}
          <div className="space-y-2.5">
            {/* Phantom */}
            <button
              onClick={handleConnectPhantom}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xl">
                  👻
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                    Phantom Wallet
                    {hasPhantom ? (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-1.5 py-0.2 rounded font-bold">
                        DETECTED
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                        EXTENSION
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">Connect real browser wallet to sign launches</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
            </button>

            {/* Solflare */}
            <button
              onClick={handleConnectSolflare}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-xl">
                  ☀️
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                    Solflare Wallet
                    {hasSolflare && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-1.5 py-0.2 rounded font-bold">
                        DETECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">Solana web & mobile wallet</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-950/60 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Verified Helius RPC Node
          </span>
          <a
            href="https://phantom.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline flex items-center gap-0.5"
          >
            Get Phantom <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
