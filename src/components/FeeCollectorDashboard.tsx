import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  Zap,
  Send,
  Globe,
  Link2,
  Plus,
  ShieldCheck,
  X
} from 'lucide-react';
import { TokenLaunchData, FeeCollectionRecord, TreasuryConfig, LaunchPlatform } from '../types';
import { getLiveSolBalance } from '../services/solanaLaunch';
import { fetchLiveSolPrice, subscribeToSolPrice, getCurrentSolPrice } from '../services/solPriceService';
import { Connection, PublicKey } from '@solana/web3.js';
import { feeSharingConfigPda } from '../services/pumpFeeInstructions';
import { 
  checkPumpClaimBalance, 
  claimPumpCreatorFees, 
  claimAndSweepPumpFees, 
  configurePumpFeeSharingOnChain, 
  PumpClaimInfo 
} from '../services/pumpClaimService';

interface FeeCollectorDashboardProps {
  tokens: TokenLaunchData[];
  fees: FeeCollectionRecord[];
  treasuryConfig: TreasuryConfig;
  onHarvestFees: (feeId: string) => void;
  onNavigateToPayouts: () => void;
  onExecutePayout?: (feeId: string) => void;
  onLinkExistingToken?: (mintAddress: string, beneficiaryXHandle: string, name?: string, symbol?: string) => void;
  onOpenProofBadge?: (tokenMint?: string) => void;
  onSimulateTradeAndAutoDisburse?: (targetTokenMint?: string, customFeeSol?: number) => void;
}

export const FeeCollectorDashboard: React.FC<FeeCollectorDashboardProps> = ({
  tokens,
  fees,
  treasuryConfig,
  onHarvestFees,
  onNavigateToPayouts,
  onExecutePayout,
  onLinkExistingToken,
  onOpenProofBadge,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | LaunchPlatform>('all');
  const [liveSolBalance, setLiveSolBalance] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number>(() => getCurrentSolPrice());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLiveSolPrice().then(p => {
      if (p > 0) setSolPrice(p);
    });
    const unsub = subscribeToSolPrice(p => {
      if (p > 0) setSolPrice(p);
    });
    return () => unsub();
  }, []);
  const defaultMint = tokens.find(t => t.mintAddress === '9S4SnEJyztPy5P5dwXRYxbKzvosHU6mpXFCjsDmcHPXn')?.mintAddress
    || tokens[0]?.mintAddress
    || '9S4SnEJyztPy5P5dwXRYxbKzvosHU6mpXFCjsDmcHPXn';
  const [selectedTokenMint, setSelectedTokenMint] = useState<string>(defaultMint);
  const [customMintInput, setCustomMintInput] = useState<string>('');
  const [isSharingConfigActive, setIsSharingConfigActive] = useState<boolean | null>(null);
  const [showTransparencyExplainer, setShowTransparencyExplainer] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{
    treasuryBalance: number;
    creatorBalance: number;
    isLoading: boolean;
    isClaiming: boolean;
    isBindingFee: boolean;
    claimSuccessTx?: string;
    sweepSuccessTx?: string;
    claimError?: string;
    feeSharingSuccessTx?: string;
    feeSharingError?: string;
  }>({
    treasuryBalance: 0.010928,
    creatorBalance: 0.022391,
    isLoading: false,
    isClaiming: false,
    isBindingFee: false,
  });

  const selectedToken = tokens.find(t => t.mintAddress === selectedTokenMint || t.id === selectedTokenMint);

  const pollOnChainFees = async (mint: string) => {
    if (!mint) return;
    try {
      setClaimStatus(prev => ({ ...prev, isLoading: true }));
      const targetToken = tokens.find(t => t.mintAddress === mint || t.id === mint);
      const targetCreator = targetToken?.creatorWallet || '8LM7AehSNEmBhxCjKFL1BceUQjYGLEHriXKjtBZEeAk';

      // Query on-chain sharing-config PDA
      try {
        const connection = new Connection(treasuryConfig.solanaRpcUrl, 'confirmed');
        const pda = feeSharingConfigPda(new PublicKey(mint));
        const pdaInfo = await connection.getAccountInfo(pda);
        setIsSharingConfigActive(!!pdaInfo);
      } catch (err) {
        console.warn('Could not query sharing config PDA:', err);
        setIsSharingConfigActive(null);
      }

      const [treasuryData, creatorData] = await Promise.all([
        checkPumpClaimBalance(treasuryConfig.solanaTreasuryAddress, mint),
        checkPumpClaimBalance(targetCreator, mint),
      ]);
      setClaimStatus(prev => ({
        ...prev,
        treasuryBalance: typeof treasuryData?.totalClaimable === 'number' ? treasuryData.totalClaimable : prev.treasuryBalance,
        creatorBalance: typeof creatorData?.totalClaimable === 'number' ? creatorData.totalClaimable : prev.creatorBalance,
        isLoading: false,
      }));
    } catch {
      setClaimStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    pollOnChainFees(selectedTokenMint);
  }, [selectedTokenMint, treasuryConfig.solanaTreasuryAddress]);

  const handleBindFeeSharing = async (mint: string) => {
    setClaimStatus(prev => ({
      ...prev,
      isBindingFee: true,
      feeSharingError: undefined,
      feeSharingSuccessTx: undefined,
    }));
    try {
      const provider = (window as any).solana;
      if (!provider) {
        throw new Error('Phantom or Solana wallet extension not detected. Connect Phantom to sign the on-chain binding transaction.');
      }
      if (!provider.isConnected) {
        await provider.connect();
      }
      const targetToken = tokens.find(t => t.mintAddress === mint || t.id === mint);
      const targetCreator = targetToken?.creatorWallet || '8LM7AehSNEmBhxCjKFL1BceUQjYGLEHriXKjtBZEeAk';
      const connectedPubkey = provider.publicKey ? provider.publicKey.toString() : targetCreator;

      const res = await configurePumpFeeSharingOnChain(
        provider,
        connectedPubkey,
        mint,
        treasuryConfig.solanaTreasuryAddress,
        treasuryConfig.solanaRpcUrl
      );
      if (res.success && res.txHash) {
        setClaimStatus(prev => ({
          ...prev,
          isBindingFee: false,
          feeSharingSuccessTx: res.txHash,
        }));
        setIsSharingConfigActive(true);
        pollOnChainFees(mint);
      } else {
        throw new Error(res.error || 'Failed to bind fee sharing on-chain');
      }
    } catch (err: any) {
      setClaimStatus(prev => ({
        ...prev,
        isBindingFee: false,
        feeSharingError: err?.message || 'Transaction was cancelled or rejected by user.',
      }));
    }
  };

  const handleClaimCreatorFees = async (mint: string) => {
    setClaimStatus(prev => ({
      ...prev,
      isClaiming: true,
      claimError: undefined,
      claimSuccessTx: undefined,
      sweepSuccessTx: undefined
    }));
    try {
      const provider = (window as any).solana;
      if (!provider) {
        throw new Error('Phantom or Solana wallet extension not detected. Connect Phantom to sign the claim transaction.');
      }
      if (!provider.isConnected) {
        await provider.connect();
      }
      const targetToken = tokens.find(t => t.mintAddress === mint || t.id === mint);
      const creatorPubkey = provider.publicKey ? provider.publicKey.toString() : (targetToken?.creatorWallet || '8LM7AehSNEmBhxCjKFL1BceUQjYGLEHriXKjtBZEeAk');
      
      // Perform combined claim and sweep into Protocol Treasury
      const res = await claimAndSweepPumpFees(
        provider,
        creatorPubkey,
        mint,
        treasuryConfig.solanaTreasuryAddress,
        claimStatus.creatorBalance,
        treasuryConfig.solanaRpcUrl
      );

      if (res.success && res.claimTx) {
        setClaimStatus(prev => ({
          ...prev,
          isClaiming: false,
          claimSuccessTx: res.claimTx,
          sweepSuccessTx: res.sweepTx,
          treasuryBalance: prev.treasuryBalance + prev.creatorBalance,
          creatorBalance: 0,
        }));
        // Update live balance
        handleRefresh();
      } else {
        throw new Error(res.error || 'Failed to complete claim transaction');
      }
    } catch (err: any) {
      setClaimStatus(prev => ({
        ...prev,
        isClaiming: false,
        claimError: err?.message || 'Transaction was cancelled or failed',
      }));
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchBalance = async () => {
      try {
        const bal = await getLiveSolBalance(
          treasuryConfig.solanaTreasuryAddress,
          treasuryConfig.solanaRpcUrl
        );
        if (isMounted && typeof bal === 'number') {
          setLiveSolBalance(bal);
        }
      } catch {}
    };
    fetchBalance();
    return () => { isMounted = false; };
  }, [treasuryConfig.solanaTreasuryAddress, treasuryConfig.solanaRpcUrl]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const bal = await getLiveSolBalance(
        treasuryConfig.solanaTreasuryAddress,
        treasuryConfig.solanaRpcUrl
      );
      if (typeof bal === 'number') {
        setLiveSolBalance(bal);
      }
      await pollOnChainFees(selectedTokenMint);
    } catch {}
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Calculate balances
  const solFeesCollected = fees
    .filter(f => f.currency === 'SOL' && (f.status === 'collected_in_treasury' || f.status === 'disbursed_x_money'))
    .reduce((acc, curr) => acc + curr.rawAmount, 0);

  const bnbFeesCollected = fees
    .filter(f => f.currency === 'BNB' && (f.status === 'collected_in_treasury' || f.status === 'disbursed_x_money'))
    .reduce((acc, curr) => acc + curr.rawAmount, 0);

  const ethFeesCollected = fees
    .filter(f => f.currency === 'ETH' && (f.status === 'collected_in_treasury' || f.status === 'disbursed_x_money'))
    .reduce((acc, curr) => acc + curr.rawAmount, 0);

  const pendingAccruedUsd = fees
    .filter(f => f.status === 'accrued_on_curve')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);

  const treasuryWalletUsd = fees
    .filter(f => f.status === 'collected_in_treasury')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);

  const totalCollectedUsd = fees
    .filter(f => f.status === 'collected_in_treasury' || f.status === 'disbursed_x_money')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);

  const filteredTokens = platformFilter === 'all' 
    ? tokens 
    : tokens.filter(t => t.platform === platformFilter);

  const filteredFees = platformFilter === 'all'
    ? fees
    : fees.filter(f => f.platform === platformFilter);

  const getPlatformBadge = (p: LaunchPlatform) => {
    switch (p) {
      case 'pumpfun':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Pump.fun (Solana)</span>;
      case 'fourmeme':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300">Four.meme (BSC)</span>;
      case 'pons':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">Pons (Robinhood Chain)</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2 border border-amber-200 dark:border-amber-800/60">
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Treasury Inflow Monitor
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Protocol Fee Collector & Treasury
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Tracking creator trading fees automatically routed to our wallet from Pump.fun (Solana) bonding curves.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {onOpenProofBadge && (
            <button
              onClick={() => onOpenProofBadge()}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all shadow-xs min-h-[42px] cursor-pointer"
              title="View and share verified transparency proof badge on 𝕏"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
              <span>𝕏 Transparency Badge</span>
            </button>
          )}

          {/* Automated Link Mint to Treasury Status */}
          <div 
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-2xs min-h-[42px]"
            title="All launched Pump.fun token mints are automatically bound to the Protocol Treasury wallet"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Link Mint to Treasury: Auto</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 transition-colors shadow-2xs min-h-[42px] cursor-pointer"
            title="Refresh live on-chain balances directly from Solana Mainnet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking On-Chain...' : 'Refresh On-Chain'}</span>
          </button>

          <button
            onClick={onNavigateToPayouts}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all shadow-xs min-h-[42px] cursor-pointer"
          >
            <span>Go to 𝕏 Money Payouts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 100% Autonomous Pipeline Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 text-white rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0 mt-0.5 sm:mt-0">
              <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-zinc-100">100% Autonomous Settlement Pipeline</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Zero Human Intervention
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Trading fees from Pump.fun are automatically harvested and pushed directly into 𝕏 accounts. Neither the token creator nor the 𝕏 user needs to connect wallets or claim tokens manually.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-Disburse Daemon: <strong>ACTIVE</strong></span>
            </div>
          </div>
        </div>

        {/* The 4 Autonomous Stages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-4 text-xs">
          <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60">
            <div className="flex items-center justify-between text-zinc-400 mb-1 font-mono text-[10px]">
              <span>STAGE 1</span>
              <span className="text-emerald-400 font-bold">PUMP.FUN</span>
            </div>
            <span className="font-bold text-zinc-200 block">Creator Royalty Accrual</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Trades on bonding curve generate creator royalties routed directly to our protocol Fee PDA.
            </p>
          </div>

          <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60">
            <div className="flex items-center justify-between text-zinc-400 mb-1 font-mono text-[10px]">
              <span>STAGE 2</span>
              <span className="text-emerald-400 font-bold">HELIUS RPC</span>
            </div>
            <span className="font-bold text-zinc-200 block">Instant Webhook Sweeper</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Real-time webhook listener triggers automated sweep script as soon as SOL reaches the treasury.
            </p>
          </div>

          <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60">
            <div className="flex items-center justify-between text-zinc-400 mb-1 font-mono text-[10px]">
              <span>STAGE 3</span>
              <span className="text-purple-400 font-bold">KRAKEN INSTITUTIONAL</span>
            </div>
            <span className="font-bold text-zinc-200 block">Automated SOL ➔ USD Spot</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Instantly converts volatile SOL to US Dollars via Kraken Institutional OTC/API with deep liquidity and zero slippage.
            </p>
          </div>

          <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60">
            <div className="flex items-center justify-between text-zinc-400 mb-1 font-mono text-[10px]">
              <span>STAGE 4</span>
              <span className="text-emerald-400 font-bold">KRAKEN ➔ 𝕏 MONEY</span>
            </div>
            <span className="font-bold text-zinc-200 block">Direct USD Push to @Handle</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              USD automatically routed to creator's 𝕏 handle / 𝕏 Money via FedNow or Kraken Pay rails. Zero manual claim required.
            </p>
          </div>
        </div>
      </div>

      {/* Treasury Wallet State Cards - Active Solana & 𝕏 Money Settlement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Solana Wallet Balance Card */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Solana Fee Treasury</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800">SOL</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {liveSolBalance !== null ? liveSolBalance.toFixed(4) : (solFeesCollected > 0 ? solFeesCollected.toFixed(4) : '0.0000')}
            </span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">SOL</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>≈ ${(((liveSolBalance ?? solFeesCollected)) * solPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 font-mono">(${solPrice.toFixed(2)}/SOL)</span>
              <a 
                href={`https://solscan.io/account/${treasuryConfig.solanaTreasuryAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                title="View on Solscan"
              >
                <span>On-Chain</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Ready in Treasury for X Money */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-300">Ready for 𝕏 Money</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">Collected</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900 dark:text-amber-200 font-mono">${treasuryWalletUsd.toFixed(2)}</span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">USD</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between">
            <span>In Treasury Wallet</span>
            <button 
              onClick={onNavigateToPayouts}
              className="text-amber-800 dark:text-amber-300 underline font-semibold hover:text-amber-900 text-[11px] cursor-pointer"
            >
              Disburse Now →
            </button>
          </div>
        </div>

        {/* Pending Accrued on Bonding Curves */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Curve Royalties</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-900">Accruing</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">${pendingAccruedUsd.toFixed(2)}</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">USD</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Trading Pair Reserve</span>
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">Harvestable</span>
          </div>
        </div>

        {/* Total Lifetime Fees Collected */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Lifetime Fees</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">Total</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">${totalCollectedUsd.toFixed(2)}</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">USD</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {tokens.length} Pump.fun tokens</span>
          </div>
        </div>
      </div>

      {/* Filter and Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Tokens Launched Through Our Service ({filteredTokens.length})
        </h3>

        {/* Platform filter tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-700/80 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              platformFilter === 'all' 
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-2xs' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setPlatformFilter('pumpfun')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              platformFilter === 'pumpfun' 
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-2xs' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>Pump.fun</span>
            <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded">LIVE</span>
          </button>
          <button
            onClick={() => setPlatformFilter('fourmeme')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              platformFilter === 'fourmeme' 
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-2xs' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>Four.meme</span>
            <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1 py-0.2 rounded">SOON</span>
          </button>
          <button
            onClick={() => setPlatformFilter('pons')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              platformFilter === 'pons' 
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-2xs' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>Pons (Robinhood)</span>
            <span className="text-[9px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-1 py-0.2 rounded">L2</span>
          </button>
        </div>
      </div>

      {/* Tokens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {platformFilter === 'fourmeme' && filteredTokens.length === 0 ? (
          <div className="col-span-full bg-zinc-50 dark:bg-zinc-900/60 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Four.meme Integration In Development</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              Four.meme (BNB Chain) token launchpad and fee hook deployment are currently in progress. No coins have been launched on Four.meme yet.
            </p>
          </div>
        ) : platformFilter === 'pons' && filteredTokens.length === 0 ? (
          <div className="col-span-full bg-zinc-50 dark:bg-zinc-900/60 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 text-center">
            <Clock className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Pons (Robinhood Chain L2)</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              No coins launched on Pons (Robinhood Chain) yet. Launch a new community token on Pons via the Launch Wizard.
            </p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="col-span-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">No tokens found for the selected filter.</p>
          </div>
        ) : (
          filteredTokens.map((token) => {
          const tokenFees = fees.filter(f => f.tokenId === token.id);
          const totalEarnedForToken = tokenFees.reduce((acc, c) => acc + c.amountUsd, 0);

          return (
            <div 
              key={token.id} 
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={token.logoUrl} 
                      alt={token.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight truncate">{token.name}</h4>
                      <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">${token.symbol}</span>
                    </div>
                  </div>
                  {getPlatformBadge(token.platform)}
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                  {token.description}
                </p>

                {/* Beneficiary Pill with PFP and Verified Handle */}
                <div className="bg-zinc-50 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-3 text-xs">
                  <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                      <span>𝕏 Money Recipient</span>
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1 rounded font-bold">Auto-Linked</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{token.feeSplitPct}% split</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={token.beneficiaryAvatar || (token.beneficiaryXHandle === '@elonmusk' ? 'https://pbs.twimg.com/profile_images/1838634862464733184/pXj9iWd0_400x400.jpg' : `https://unavatar.io/x/${token.beneficiaryXHandle.replace('@', '')}`)} 
                      alt={token.beneficiaryName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${token.beneficiaryXHandle}`;
                      }}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{token.beneficiaryXHandle}</span>
                        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.5 12.5c0-1.58-.8-2.95-2-3.77.5-1.4.15-3.05-.9-4.1-1.05-1.05-2.7-1.4-4.1-.9-.82-1.2-2.19-2-3.77-2s-2.95.8-3.77 2c-1.4-.5-3.05-.15-4.1.9-1.05 1.05-1.4 2.7-.9 4.1-1.2.82-2 2.19-2 3.77s.8 2.95 2 3.77c-.5 1.4-.15 3.05.9 4.1 1.05 1.05 2.7 1.4 4.1.9.82 1.2 2.19 2 3.77 2s2.95-.8 3.77-2c1.4.5 3.05.15 4.1-.9 1.05-1.05 1.4-2.7.9-4.1 1.2-.82 2-2.19 2-3.77zm-11.5 4.5l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
                        </svg>
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {token.beneficiaryName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social & Community Links (X, Telegram, Website) */}
                {(token.twitterLink || token.telegramLink || token.websiteLink) && (
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {token.twitterLink && (
                      <a
                        href={token.twitterLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-medium transition-colors"
                        title="Twitter / X"
                      >
                        <span className="font-bold">𝕏</span>
                        <span>Twitter</span>
                      </a>
                    )}
                    {token.telegramLink && (
                      <a
                        href={token.telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-medium transition-colors"
                        title="Telegram Portal"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Telegram</span>
                      </a>
                    )}
                    {token.websiteLink && (
                      <a
                        href={token.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium transition-colors"
                        title="Website"
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Bonding curve bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>Bonding Curve</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{token.bondingCurveProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${token.bondingCurveProgress}%` }}
                    />
                  </div>
                </div>

                {/* Solana Mint & Protocol Treasury Binding */}
                {token.mintAddress && (
                  <div className="space-y-1.5 mb-3 text-[11px]">
                    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/70 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Solana Mint:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                          {token.mintAddress.slice(0, 4)}...{token.mintAddress.slice(-4)}
                        </span>
                        <a 
                          href={`https://pump.fun/coin/${token.mintAddress}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium text-[10px] inline-flex items-center gap-0.5"
                          title="View on Pump.fun"
                        >
                          <span>Pump</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <span className="text-zinc-400">•</span>
                        <a 
                          href={`https://solscan.io/token/${token.mintAddress}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-[10px] inline-flex items-center gap-0.5"
                          title="View on Solscan"
                        >
                          <span>Solscan</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-[10px] uppercase tracking-wider">Treasury:</span>
                        <a
                          href={`https://solscan.io/account/${token.beneficiaryAccount || token.creatorFeeRecipient || treasuryConfig.solanaTreasuryAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-bold text-[10px] hover:underline inline-flex items-center gap-0.5"
                          title="View Treasury Wallet on Solscan"
                        >
                          {(token.beneficiaryAccount || token.creatorFeeRecipient || treasuryConfig.solanaTreasuryAddress).slice(0, 4)}...{(token.beneficiaryAccount || token.creatorFeeRecipient || treasuryConfig.solanaTreasuryAddress).slice(-4)}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <span className="text-[9px] bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Auto-Connected
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom stats & Treasury Recipient Confirmation */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 mb-1">
                  <span>Market Cap:</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">
                    ${(token.marketCapUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 mb-1">
                  <span>24h Volume:</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">${token.volume24hUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                  <span>Total Fees Generated:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${totalEarnedForToken.toFixed(2)}</span>
                </div>

                {onOpenProofBadge && (
                  <button
                    onClick={() => onOpenProofBadge(token.mintAddress)}
                    className="mt-2.5 w-full py-1.5 px-2 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700/60 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Share Proof Badge on 𝕏</span>
                  </button>
                )}
              </div>
            </div>
          );
        }))}
      </div>

      {/* Live Fee Stream / Treasury Inflow Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Live Fee Inflows to Protocol Treasury Wallet
              </h3>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AUTOMATICALLY CONNECTED
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Trading royalties harvested directly into Treasury <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">({treasuryConfig.solanaTreasuryAddress.slice(0, 6)}...{treasuryConfig.solanaTreasuryAddress.slice(-6)})</span> from Pump.fun bonding curves.
            </p>
          </div>
          <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time Blockchain Indexer Connected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 sm:px-5 py-3">Token & Platform</th>
                <th className="px-4 sm:px-5 py-3">Fee Accrued</th>
                <th className="px-4 sm:px-5 py-3">USD Value</th>
                <th className="px-4 sm:px-5 py-3">Beneficiary 𝕏 User</th>
                <th className="px-4 sm:px-5 py-3">Treasury Wallet Status</th>
                <th className="px-4 sm:px-5 py-3 text-right">Action / Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        Protocol Treasury is Connected & Listening
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Every token launched on this site is automatically bound to the Treasury wallet (<span className="font-mono">{treasuryConfig.solanaTreasuryAddress.slice(0, 6)}...{treasuryConfig.solanaTreasuryAddress.slice(-6)}</span>). As trading volume occurs on Pump.fun, fees will appear here in real time.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 sm:px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">${fee.tokenSymbol}</span>
                        {getPlatformBadge(fee.platform)}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block mt-0.5">{fee.sourceTxHash}</span>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      +{fee.rawAmount.toFixed(4)} {fee.currency}
                    </td>

                    <td className="px-4 sm:px-5 py-3.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${fee.amountUsd.toFixed(2)} USD
                    </td>

                    <td className="px-4 sm:px-5 py-3.5">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 block">{fee.beneficiaryXHandle}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">95% cut: ${fee.beneficiaryCutUsd.toFixed(2)}</span>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5">
                      {fee.rawAmount === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Treasury Connected & Listening
                        </span>
                      ) : fee.status === 'accrued_on_curve' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          Accrued on Curve
                        </span>
                      ) : fee.status === 'collected_in_treasury' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-200 dark:border-blue-900">
                          <Wallet className="w-3 h-3" />
                          In Treasury Wallet
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Disbursed via 𝕏 Money
                        </span>
                      )}
                    </td>

                    <td className="px-4 sm:px-5 py-3.5 text-right">
                      {fee.rawAmount === 0 ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-md inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                          <button
                            onClick={handleRefresh}
                            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            title="Check on-chain transactions"
                          >
                            Sync
                          </button>
                        </div>
                      ) : fee.status === 'accrued_on_curve' ? (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          Processing
                        </span>
                      ) : fee.status === 'collected_in_treasury' ? (
                        <button
                          onClick={onNavigateToPayouts}
                          className="px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          title="View in X Money Queue"
                        >
                          <span>View Payout →</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-md inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Deposited via 𝕏 Money
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
