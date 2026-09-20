import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  Filter, 
  Share2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { FeeCollectionRecord, XMoneyPayout, TreasuryConfig } from '../types';
import { getXUserProfile } from '../data/mockData';
import { Zap, ShieldCheck } from 'lucide-react';

interface XMoneyPayoutEngineProps {
  fees: FeeCollectionRecord[];
  payouts: XMoneyPayout[];
  treasuryConfig: TreasuryConfig;
  onExecutePayout: (feeId: string) => void;
  onBatchPayoutAll: () => void;
  onSimulateTradeAndAutoDisburse?: () => void;
}

export const XMoneyPayoutEngine: React.FC<XMoneyPayoutEngineProps> = ({
  fees,
  payouts,
  treasuryConfig,
  onExecutePayout,
  onBatchPayoutAll,
  onSimulateTradeAndAutoDisburse,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingFeeId, setProcessingFeeId] = useState<string | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Fees that are collected in our treasury wallet and ready for X Money payout
  const pendingFees = fees.filter(f => f.status === 'collected_in_treasury');
  const totalPendingUsd = pendingFees.reduce((acc, f) => acc + f.beneficiaryCutUsd, 0);

  const handleCopyProof = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSinglePayout = async (feeId: string) => {
    setProcessingFeeId(feeId);
    await new Promise(r => setTimeout(r, 1200));
    onExecutePayout(feeId);
    setProcessingFeeId(null);
  };

  const handleBatchPayout = async () => {
    setIsBatchProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    onBatchPayoutAll();
    setIsBatchProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-800">
            <span className="font-bold">𝕏</span>
            <span>X Money Autonomous Payout Engine • Zero-Claim Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Automated 𝕏 Money Settlement Queue
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Trading fees gathered in our protocol treasury are automatically converted and deposited straight into creators' 𝕏 accounts. <strong>No manual claiming required.</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {pendingFees.length > 0 && (
            <button
              onClick={handleBatchPayout}
              disabled={isBatchProcessing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isBatchProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running 𝕏 Money Auto-Disburse Daemon...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute Auto-Disburse All (${totalPendingUsd.toFixed(2)} USD)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Zero Claim Explainer Banner */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </div>
          <div>
            <span className="font-bold text-emerald-950 dark:text-emerald-200 block">Autonomous Push Payments (Zero Claim)</span>
            <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
              Unlike traditional crypto platforms where creators must connect web3 wallets and claim tokens manually, our system pushes USD directly into the creator's 𝕏 Money account via 𝕏's automated payment rail.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <div className="bg-white/90 dark:bg-zinc-900/90 text-emerald-800 dark:text-emerald-300 font-semibold px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 select-none shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-Disburse Daemon: <strong>ACTIVE</strong></span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
            Pending X Money Queue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">${totalPendingUsd.toFixed(2)}</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">USD</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {pendingFees.length} creator payouts awaiting X Money distribution
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
            Total Distributed via X Money
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ${payouts.reduce((acc, p) => acc + p.amountUsd, 0).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">USD</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Sent directly to {new Set(payouts.map(p => p.recipientHandle)).size} unique X accounts
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
            Settlement Method
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">𝕏 Money API + Fiat Rail</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Direct account credit or claimable escrow for verified handles
          </p>
        </div>
      </div>

      {/* Section 1: Pending Fees in Treasury Ready for Disbursement */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Queue: Fees Collected in Treasury Ready to Send to 𝕏 Users
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              These fees have arrived in our protocol wallet from Pump.fun trading volume.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {pendingFees.length} Pending Actions
          </span>
        </div>

        {pendingFees.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">All collected treasury fees have been distributed via X Money!</p>
            <p className="mt-1">New fees will appear here as soon as trading activity occurs on launched tokens.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {pendingFees.map((fee) => {
              const profile = getXUserProfile(fee.beneficiaryXHandle);
              return (
                <div key={fee.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-start sm:items-center gap-4">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-11 h-11 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{profile.name}</span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{fee.beneficiaryXHandle}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${profile.badgeColor}`}>
                          {profile.xMoneyFeatureAvailable ? '● 𝕏 Money Active' : '○ Beta Waitlist'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          ${fee.tokenSymbol} ({fee.platform})
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Accrued in Treasury: <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{fee.rawAmount} {fee.currency}</span> (${fee.amountUsd.toFixed(2)} USD) • Settlement: <span className="text-emerald-700 dark:text-emerald-400 font-medium">Auto-Deposit (Zero Claim)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Auto-Payout (95%)</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">${fee.beneficiaryCutUsd.toFixed(2)} USD</span>
                    </div>

                    <button
                      onClick={() => handleSinglePayout(fee.id)}
                      disabled={processingFeeId === fee.id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      {processingFeeId === fee.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Auto-Depositing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Auto-Disburse Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Completed X Money Payouts Feed & Public Receipts */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Completed 𝕏 Money Payouts & Proof Receipts ({payouts.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Verified USD disbursements sent to creators on X with public proof notices.
            </p>
          </div>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            <DollarSign className="w-10 h-10 mx-auto text-zinc-400 mb-2 opacity-50" />
            <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">No Disbursements Yet</p>
            <p className="text-xs mt-1">Real trading fees collected on-chain will queue here and disburse directly to creators' 𝕏 accounts.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {payouts.map((payout) => (
              <div key={payout.id} className="p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={payout.recipientAvatar}
                      alt={payout.recipientName}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(payout.recipientHandle)}`;
                      }}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{payout.recipientName}</span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{payout.recipientHandle}</span>
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                          <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          AUTO-DEPOSITED (ZERO CLAIM)
                        </span>
                        {payout.paymentMethod?.includes('Kraken') && (
                          <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-purple-300 dark:border-purple-800">
                            KRAKEN USD OFF-RAMP
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        Ref ID: <span className="font-mono text-zinc-600 dark:text-zinc-400">{payout.xMoneyReferenceId}</span>
                        {payout.krakenOrderId && (
                          <> • Kraken Order: <span className="font-mono text-purple-600 dark:text-purple-400">{payout.krakenOrderId}</span></>
                        )}
                        {payout.fiatConversionRate && (
                          <> • Rate: <span className="font-mono">${payout.fiatConversionRate}/SOL</span></>
                        )}
                        {' '}• From ${payout.sourceTokenSymbol} ({payout.sourcePlatform})
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">+${payout.amountUsd.toFixed(2)} USD</span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {new Date(payout.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                    </span>
                  </div>
                </div>

                {/* Public Tweet Proof Card */}
                <div className="mt-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between mb-1.5 text-zinc-400 dark:text-zinc-500 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300">
                      <Share2 className="w-3 h-3 text-blue-500" />
                      Public Confirmation Tweet Proof
                    </span>
                    <button
                      onClick={() => handleCopyProof(payout.proofTweetText, payout.id)}
                      className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium"
                    >
                      {copiedId === payout.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Tweet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-zinc-800 dark:text-zinc-200 font-mono text-[11px] bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    {payout.proofTweetText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
