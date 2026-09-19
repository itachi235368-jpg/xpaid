import React, { useState } from 'react';
import { X, ShieldCheck, Save, Wallet, RefreshCw, ExternalLink, CheckCircle2 } from 'lucide-react';
import { TreasuryConfig } from '../types';

interface TreasurySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TreasuryConfig;
  onSaveConfig: (newConfig: TreasuryConfig) => void;
}

export const TreasurySettingsModal: React.FC<TreasurySettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [solAddr, setSolAddr] = useState(config.solanaTreasuryAddress);
  const [solRpcUrl, setSolRpcUrl] = useState(config.solanaRpcUrl || 'https://mainnet.helius-rpc.com/?api-key=ebaaace9-5065-4a49-b33a-c29aa04ac6a4');
  const [webhookId, setWebhookId] = useState(config.heliusWebhookId || 'f6949cec-0fc4-4734-b6d0-ae74f6cbf96c');
  const [pinataJwt, setPinataJwt] = useState(config.pinataJwt || '');
  const [bnbAddr, setBnbAddr] = useState(config.bnbTreasuryAddress);
  const [rhAddr, setRhAddr] = useState(config.robinhoodTreasuryAddress);
  const [splitPct, setSplitPct] = useState(config.defaultFeeSplitToXUser);
  const [network, setNetwork] = useState(config.activeNetwork);
  const [autoDisburse, setAutoDisburse] = useState(config.autoDisburseEnabled);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      solanaTreasuryAddress: solAddr.trim(),
      solanaRpcUrl: solRpcUrl.trim(),
      heliusWebhookId: webhookId.trim(),
      pinataJwt: pinataJwt.trim(),
      bnbTreasuryAddress: bnbAddr.trim(),
      robinhoodTreasuryAddress: rhAddr.trim(),
      defaultFeeSplitToXUser: splitPct,
      protocolBuybackBurnPct: 100 - splitPct,
      activeNetwork: network,
      autoDisburseEnabled: autoDisburse,
    });
    onClose();
  };

  const handleResetDefaults = () => {
    setSolAddr('ChKVce7smxzqrtFGxbdBA1d4ZSazfDwWNZbJUcU6EMy8');
    setSolRpcUrl('https://mainnet.helius-rpc.com/?api-key=ebaaace9-5065-4a49-b33a-c29aa04ac6a4');
    setWebhookId('f6949cec-0fc4-4734-b6d0-ae74f6cbf96c');
    setPinataJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmYjVjZDAzZi1kYTFhLTQ3YzctODFhOC1hMzQ4MzIxZjg5MjgiLCJlbWFpbCI6Iml0YWNoaTIzNTM2OEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYzBjYWE2YWQwMWMzNWE5NTIxYmEiLCJzY29wZWRLZXlTZWNyZXQiOiI3ODhhZDA3NjY5YzJlOGQ1MTcyMjQzMDFiZjUzMDZlMGEzMDYzNTA3NTY2MWU1ZGVhZDNjODcyZjYzODg2YzVmIiwiZXhwIjoxODIxMjQ1MTQzfQ.EP68R_zNSt3CUcgAkWnnu9uVvKwKo1o41wDwEEARBFk');
    setBnbAddr('0x94A720C92f69D67f57f68c783B095aB3C3973eB1');
    setRhAddr('0x2B9c89280F33DbE1A616B88981e4b47B58BdB241');
    setSplitPct(80);
    setNetwork('mainnet');
    setAutoDisburse(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Treasury Wallet & Fee Configuration</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Destination addresses for Pump.fun creator fee routing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Solana Treasury Wallet Address (Pump.fun)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  0.10 SOL FUNDED
                </span>
                <a
                  href={`https://solscan.io/account/${solAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-0.5"
                  title="View on Solscan"
                >
                  <span>Solscan</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
            <input
              type="text"
              value={solAddr}
              onChange={(e) => setSolAddr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500"
              required
            />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-between">
              <span>Tokens created on Pump.fun route SOL creator fees to this address.</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">On-Chain Balance: 0.10 SOL</span>
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Solana Mainnet RPC Endpoint (Helius)
              </label>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                RPC CONNECTED
              </span>
            </div>
            <input
              type="text"
              value={solRpcUrl}
              onChange={(e) => setSolRpcUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/30 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-600"
              placeholder="https://mainnet.helius-rpc.com/?api-key=..."
              required
            />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Active Helius Mainnet RPC node configured for instant transaction broadcasting & fee sweepers.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Helius Enhanced Webhook ID
              </label>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LISTENER ACTIVE
              </span>
            </div>
            <input
              type="text"
              value={webhookId}
              onChange={(e) => setWebhookId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/30 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-600"
              placeholder="f6949cec-0fc4-4734-b6d0-ae74f6cbf96c"
            />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Active webhook ID monitoring inbound transfers to treasury address for instant automated 𝕏 Money conversion.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Pinata IPFS Storage JWT (Metadata & Logos)
              </label>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                IPFS CONNECTED
              </span>
            </div>
            <input
              type="password"
              value={pinataJwt}
              onChange={(e) => setPinataJwt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
            />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Decentralized IPFS pinning authorization used to host Pump.fun token logos and Metaplex JSON metadata.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-500 dark:text-zinc-400">
                BNB Chain Treasury Wallet Address (Four.meme)
              </label>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">SOON</span>
            </div>
            <input
              type="text"
              value={bnbAddr}
              onChange={(e) => setBnbAddr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 font-mono text-xs focus:ring-2 focus:ring-zinc-900"
              required
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Coming soon: Tokens created on Four.meme will route BSC BNB royalties once factory contract is audited.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-500 dark:text-zinc-400">
                Robinhood Chain Treasury Wallet Address (Pons)
              </label>
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-300 dark:border-teal-800">SOON</span>
            </div>
            <input
              type="text"
              value={rhAddr}
              onChange={(e) => setRhAddr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 font-mono text-xs focus:ring-2 focus:ring-zinc-900"
              required
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Coming soon: Tokens created on Pons will route Robinhood Chain (ETH) royalties once bridge is live.</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Default Payout to 𝕏 User (%):</label>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">{splitPct}% to 𝕏 User</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={splitPct}
              onChange={(e) => setSplitPct(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Remaining {100 - splitPct}% is retained in treasury for protocol buyback and burns.</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80">
            <div>
              <span className="font-semibold text-emerald-950 dark:text-emerald-200 block">Automatic 𝕏 Money Disbursal</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Permanent on-chain protocol daemon (100% automated payouts)</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-1 rounded-full border border-emerald-300 dark:border-emerald-700 select-none">
              PERMANENTLY ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
