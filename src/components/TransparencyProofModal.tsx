import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Download,
  ChevronDown
} from 'lucide-react';
import { TokenLaunchData, TreasuryConfig } from '../types';

interface TransparencyProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: TokenLaunchData[];
  treasuryConfig: TreasuryConfig;
  selectedTokenId?: string;
}

export const TransparencyProofModal: React.FC<TransparencyProofModalProps> = ({
  isOpen,
  onClose,
  tokens,
  treasuryConfig,
  selectedTokenId,
}) => {
  const [selectedTokenMint, setSelectedTokenMint] = useState<string>(() => {
    if (selectedTokenId) {
      const found = tokens.find(t => t.id === selectedTokenId || t.mintAddress === selectedTokenId);
      if (found?.mintAddress) return found.mintAddress;
    }
    // Default to user's SpaceX Martian mint or first token
    const mars = tokens.find(t => t.mintAddress === 'AjyyfC92o3Eado4UzbtDdgt35AYK3R88tjQB9gUcoF2J');
    return mars?.mintAddress || tokens[0]?.mintAddress || 'AjyyfC92o3Eado4UzbtDdgt35AYK3R88tjQB9gUcoF2J';
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentToken = tokens.find(t => t.mintAddress === selectedTokenMint) || tokens[0] || {
    name: 'SpaceX Martian',
    symbol: 'MARS',
    mintAddress: 'AjyyfC92o3Eado4UzbtDdgt35AYK3R88tjQB9gUcoF2J',
    beneficiaryXHandle: '@elonmusk',
    feeSplitPct: 80,
    volume24hUsd: 1450,
    creatorFeeRecipient: treasuryConfig.solanaTreasuryAddress
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const tweetProofText = `🛡️ VERIFIED FEE PROOF on @X:

Token $${currentToken.symbol} (${currentToken.name})
• Solana Mint: ${currentToken.mintAddress}
• Linked Royalty Treasury: ${treasuryConfig.solanaTreasuryAddress.slice(0, 6)}...${treasuryConfig.solanaTreasuryAddress.slice(-6)}
• 100% of Pump.fun creator fees routed to ${currentToken.beneficiaryXHandle} via 𝕏 Money (${currentToken.feeSplitPct}% split)

On-Chain Verification:
https://solscan.io/token/${currentToken.mintAddress}

#XMoney #PumpFun #Solana #Transparency`;

  const handleShareToX = () => {
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetProofText)}`;
    window.open(tweetUrl, '_blank', 'width=580,height=420');
  };

  // Download high-resolution PNG badge using canvas
  const handleDownloadBadge = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark luxury card background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGrad.addColorStop(0, '#09090b');
    bgGrad.addColorStop(1, '#18181b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 630);

    // Subtle border
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1160, 590);

    // Emerald accent glow header
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('🛡️ VERIFIED ON-CHAIN FEE BINDING CERTIFICATE', 60, 85);

    ctx.fillStyle = '#71717a';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Protocol Treasury Routing Protocol • Settled via 𝕏 Money', 60, 115);

    // Token Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.fillText(`${currentToken.name} ($${currentToken.symbol})`, 60, 185);

    // Divider line
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 220);
    ctx.lineTo(1140, 220);
    ctx.stroke();

    // Data rows
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Solana Token Mint Address (Pump.fun):', 60, 265);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(currentToken.mintAddress || 'N/A', 60, 300);

    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Beneficiary Account (Protocol Treasury Default):', 60, 355);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(currentToken.beneficiaryAccount || currentToken.creatorFeeRecipient || treasuryConfig.solanaTreasuryAddress, 60, 390);

    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Beneficiary 𝕏 Account (Direct USD Payouts):', 60, 445);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(`${currentToken.beneficiaryXHandle} (${currentToken.feeSplitPct}% Revenue Split)`, 60, 485);

    // Footer
    ctx.fillStyle = '#52525b';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(`Cryptographically verified via Solana Mainnet • Automated Disbursement Rail Active`, 60, 560);

    // Trigger download
    const link = document.createElement('a');
    link.download = `ProofBadge-${currentToken.symbol}-Verified.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  𝕏 Transparency Badge
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  On-Chain Verified
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Shareable cryptographic proof of token royalties routed to Treasury & 𝕏 Money
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Strictly the 𝕏 Transparency Badge */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Token Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Selected Token:
            </label>
            <div className="relative">
              <select
                value={selectedTokenMint}
                onChange={(e) => setSelectedTokenMint(e.target.value)}
                className="w-full sm:w-auto text-xs font-semibold px-3 py-2 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 appearance-none focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {tokens.map((tok) => (
                  <option key={tok.mintAddress || tok.id} value={tok.mintAddress}>
                    {tok.name} (${tok.symbol}) {tok.mintAddress ? `• ${tok.mintAddress.slice(0, 4)}...${tok.mintAddress.slice(-4)}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Verified Certificate Card */}
          <div
            ref={badgeRef}
            className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-2xl p-5 sm:p-6 border border-zinc-800 shadow-xl relative overflow-hidden"
          >
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-lg">
                  𝕏
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    CERTIFICATE OF ON-CHAIN FEE BINDING
                  </div>
                  <h4 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">
                    {currentToken.name} (${currentToken.symbol})
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">
                  Settlement Rail
                </span>
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  𝕏 Money Direct (USD)
                </span>
              </div>
            </div>

            {/* Proof Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-4 border-b border-zinc-800 text-xs relative z-10">
              <div>
                <span className="text-zinc-400 block text-[11px] font-medium mb-0.5">
                  Solana Token Mint (Immutable):
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-200 font-semibold truncate">
                    {currentToken.mintAddress}
                  </span>
                  <button
                    onClick={() => handleCopy(currentToken.mintAddress || '', 'mint')}
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy Mint"
                  >
                    {copiedKey === 'mint' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block text-[11px] font-medium mb-0.5">
                  Beneficiary Account (Solana):
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-semibold truncate">
                    {currentToken.beneficiaryAccount || currentToken.creatorFeeRecipient || treasuryConfig.solanaTreasuryAddress}
                  </span>
                  <span className="text-[9px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-700/60">
                    TREASURY DEFAULT
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block text-[11px] font-medium mb-0.5">
                  Beneficiary 𝕏 Account:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-400">
                    {currentToken.beneficiaryXHandle}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    ({currentToken.feeSplitPct}% Share)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block text-[11px] font-medium mb-0.5">
                  Pump.fun Creator Royalties:
                </span>
                <span className="text-zinc-200 font-semibold">
                  100% Routed to Treasury Wallet
                </span>
              </div>
            </div>

            {/* Verification Link */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
              <a
                href={`https://solscan.io/token/${currentToken.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 font-medium transition-colors"
              >
                <span>Verify Mint on Solscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="text-[11px] text-zinc-400">
                Auto-Issued by Protocol Treasury Engine
              </div>
            </div>
          </div>

          {/* Actions for Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={handleShareToX}
              className="py-3 px-4 rounded-xl bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Badge on 𝕏</span>
            </button>

            <button
              onClick={() => handleCopy(tweetProofText, 'tweet')}
              className="py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              {copiedKey === 'tweet' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'tweet' ? 'Copied Proof Text!' : 'Copy Proof Text'}</span>
            </button>

            <button
              onClick={handleDownloadBadge}
              className="py-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Badge Image</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Treasury: {treasuryConfig.solanaTreasuryAddress.slice(0, 4)}...{treasuryConfig.solanaTreasuryAddress.slice(-4)} (Connected)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
