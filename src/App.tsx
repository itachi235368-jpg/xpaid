import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TokenLaunchWizard } from './components/TokenLaunchWizard';
import { FeeCollectorDashboard } from './components/FeeCollectorDashboard';
import { XMoneyPayoutEngine } from './components/XMoneyPayoutEngine';
import { XUserLookupPortal } from './components/XUserLookupPortal';
import { HowThingsWork } from './components/HowThingsWork';
import { TreasurySettingsModal } from './components/TreasurySettingsModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { TransparencyProofModal } from './components/TransparencyProofModal';
import { 
  INITIAL_TOKENS, 
  INITIAL_FEES, 
  INITIAL_PAYOUTS, 
  INITIAL_TREASURY_CONFIG,
  getXUserProfile
} from './data/mockData';
import { 
  TokenLaunchData, 
  FeeCollectionRecord, 
  XMoneyPayout, 
  TreasuryConfig,
  FeeCurrency
} from './types';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'launch' | 'fees' | 'payouts' | 'lookup' | 'how-it-works'>('launch');
  const [tokens, setTokens] = useState<TokenLaunchData[]>(() => {
    try {
      const saved = localStorage.getItem('xpaid_tokens_v2');
      if (saved) {
        const parsed: TokenLaunchData[] = JSON.parse(saved);
        // Ensure that AjyyfC92o3Eado4UzbtDdgt35AYK3R88tjQB9gUcoF2J is fully linked with verified pfp, handle, and treasury wallet
        const synchronized = parsed.map(tok => {
          if (tok.mintAddress === 'AjyyfC92o3Eado4UzbtDdgt35AYK3R88tjQB9gUcoF2J' || tok.id === 'tok-user-spacex-mars') {
            return {
              ...tok,
              name: 'SpaceX Martian',
              symbol: 'MARS',
              mintAddress: 'AjyyfC92o3Eado4UzbtDdgt35AYK3R88tjQB9gUcoF2J',
              beneficiaryXHandle: '@elonmusk',
              beneficiaryName: 'Elon Musk',
              beneficiaryAvatar: 'https://pbs.twimg.com/profile_images/1838634862464733184/pXj9iWd0_400x400.jpg',
              beneficiaryAccount: INITIAL_TREASURY_CONFIG.solanaTreasuryAddress,
              creatorFeeRecipient: INITIAL_TREASURY_CONFIG.solanaTreasuryAddress,
              creatorWallet: INITIAL_TREASURY_CONFIG.solanaTreasuryAddress,
              twitterLink: 'https://x.com/elonmusk',
              status: 'active' as const
            };
          }
          return {
            ...tok,
            beneficiaryAccount: tok.beneficiaryAccount || tok.creatorFeeRecipient || INITIAL_TREASURY_CONFIG.solanaTreasuryAddress,
            creatorFeeRecipient: tok.creatorFeeRecipient || INITIAL_TREASURY_CONFIG.solanaTreasuryAddress
          };
        });
        const existingMints = new Set(synchronized.map(t => t.mintAddress || t.id));
        const missing = INITIAL_TOKENS.filter(t => !existingMints.has(t.mintAddress || t.id));
        return [...missing, ...synchronized];
      }
    } catch (e) {}
    return INITIAL_TOKENS;
  });

  const [fees, setFees] = useState<FeeCollectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('xpaid_fees_v2');
      if (saved) {
        const parsed: FeeCollectionRecord[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(f => f.id));
        const missing = INITIAL_FEES.filter(f => !existingIds.has(f.id));
        return [...missing, ...parsed];
      }
    } catch (e) {}
    return INITIAL_FEES;
  });

  const [payouts, setPayouts] = useState<XMoneyPayout[]>(() => {
    try {
      const saved = localStorage.getItem('xpaid_payouts_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PAYOUTS;
  });

  const [treasuryConfig, setTreasuryConfig] = useState<TreasuryConfig>(() => {
    try {
      const saved = localStorage.getItem('xpaid_treasury_config_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_TREASURY_CONFIG,
          ...parsed,
          pinataJwt: parsed.pinataJwt || INITIAL_TREASURY_CONFIG.pinataJwt,
          solanaTreasuryAddress: INITIAL_TREASURY_CONFIG.solanaTreasuryAddress
        };
      }
    } catch (e) {}
    return INITIAL_TREASURY_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('xpaid_tokens_v2', JSON.stringify(tokens));
    } catch (e) {}
  }, [tokens]);

  useEffect(() => {
    try {
      localStorage.setItem('xpaid_fees_v2', JSON.stringify(fees));
    } catch (e) {}
  }, [fees]);

  useEffect(() => {
    try {
      localStorage.setItem('xpaid_payouts_v2', JSON.stringify(payouts));
    } catch (e) {}
  }, [payouts]);

  useEffect(() => {
    try {
      localStorage.setItem('xpaid_treasury_config_v2', JSON.stringify(treasuryConfig));
    } catch (e) {}
  }, [treasuryConfig]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedProofTokenMint, setSelectedProofTokenMint] = useState<string | undefined>(undefined);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('xpaid_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('xpaid_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('xpaid_theme', 'light');
    }
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Autonomous Engine: Periodically sweeps accrued fees and auto-deposits USD to 𝕏 Money
  useEffect(() => {
    if (!treasuryConfig.autoDisburseEnabled) return;

    const interval = setInterval(() => {
      setFees(currentFees => {
        // Step 1: Check if any fee is accrued on curve, auto-sweep to treasury (simulating Helius Webhook)
        const accruedIndex = currentFees.findIndex(f => f.status === 'accrued_on_curve');
        if (accruedIndex !== -1) {
          const fee = currentFees[accruedIndex];
          const updated = [...currentFees];
          updated[accruedIndex] = {
            ...fee,
            status: 'collected_in_treasury',
            treasuryTransferTxHash: fee.network === 'solana' 
              ? `tr_${Math.random().toString(36).slice(2, 9)}` 
              : `0x${Math.random().toString(36).slice(2, 10)}`,
          };
          showToast(`⚡ Autonomous Sweep: +${fee.rawAmount} ${fee.currency} ($${fee.amountUsd.toFixed(2)}) auto-routed to Treasury`);
          return updated;
        }

        // Step 2: Check if any fee in treasury is waiting to be disbursed to 𝕏 Money
        const pendingPayoutIndex = currentFees.findIndex(f => f.status === 'collected_in_treasury');
        if (pendingPayoutIndex !== -1) {
          const fee = currentFees[pendingPayoutIndex];
          const profile = getXUserProfile(fee.beneficiaryXHandle);
          const payoutId = `xpay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          
          const newPayout: XMoneyPayout = {
            id: payoutId,
            recipientHandle: fee.beneficiaryXHandle,
            recipientName: profile.name,
            recipientAvatar: profile.avatar,
            amountUsd: fee.beneficiaryCutUsd,
            sourceTokenSymbol: fee.tokenSymbol,
            sourcePlatform: fee.platform,
            status: 'completed',
            timestamp: new Date().toISOString(),
            xMoneyReferenceId: `XM-${Math.floor(10000000 + Math.random() * 90000000)}-${fee.currency}`,
            paymentMethod: 'X Money (USD Direct)',
            proofTweetText: `⚡ @Xpaid auto-deposited $${fee.beneficiaryCutUsd.toFixed(2)} USD directly to ${fee.beneficiaryXHandle} via 𝕏 Money from $${fee.tokenSymbol} trading fees on ${fee.platform.toUpperCase()}! (Zero claim needed). Ref: ${fee.sourceTxHash}`,
            blockchainRefTx: fee.sourceTxHash,
          };

          setPayouts(prev => [newPayout, ...prev]);

          const updated = [...currentFees];
          updated[pendingPayoutIndex] = {
            ...fee,
            status: 'disbursed_x_money',
            xMoneyPayoutId: payoutId
          };
          showToast(`⚡ 𝕏 Money Auto-Deposited: $${fee.beneficiaryCutUsd.toFixed(2)} USD pushed to ${fee.beneficiaryXHandle}'s account! (Zero claim required)`);
          return updated;
        }

        return currentFees;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [treasuryConfig.autoDisburseEnabled]);

  const handleToggleWallet = () => {
    if (connectedWallet) {
      setConnectedWallet(null);
      showToast('Wallet disconnected');
    } else {
      setIsWalletModalOpen(true);
    }
  };

  // Handle new token launch
  const handleTokenLaunched = (newToken: TokenLaunchData) => {
    setTokens(prev => [newToken, ...prev]);

    // Automatically simulate initial trading volume & fee generation into treasury
    const isSol = newToken.network === 'solana';
    const isRH = newToken.network === 'robinhood';
    const currency: FeeCurrency = isSol ? 'SOL' : isRH ? 'ETH' : 'BNB';
    const rawFee = isSol ? 0.65 : isRH ? 0.045 : 0.25;
    const feeUsd = isSol ? rawFee * 150 : isRH ? rawFee * 3400 : rawFee * 600;
    const beneficiaryCut = (feeUsd * newToken.feeSplitPct) / 100;
    const protocolCut = feeUsd - beneficiaryCut;

    const initialFee: FeeCollectionRecord = {
      id: `fee-${Date.now()}`,
      tokenId: newToken.id,
      tokenSymbol: newToken.symbol,
      tokenName: newToken.name,
      platform: newToken.platform,
      network: newToken.network,
      rawAmount: rawFee,
      currency,
      amountUsd: feeUsd,
      beneficiaryXHandle: newToken.beneficiaryXHandle,
      beneficiaryCutUsd: beneficiaryCut,
      protocolCutUsd: protocolCut,
      status: 'collected_in_treasury', // Directly in our treasury wallet!
      timestamp: new Date().toISOString(),
      sourceTxHash: isSol ? `tx_${Math.random().toString(36).slice(2, 9)}` : `0x${Math.random().toString(36).slice(2, 10)}`,
      treasuryTransferTxHash: isSol ? `tr_${Math.random().toString(36).slice(2, 9)}` : `0x${Math.random().toString(36).slice(2, 10)}`,
    };

    setFees(prev => [initialFee, ...prev]);
    showToast(`Token ${newToken.name} launched! +$${feeUsd.toFixed(2)} creator fees collected into Treasury Wallet.`);

    // Auto-payout to X user without needing to claim!
    if (treasuryConfig.autoDisburseEnabled) {
      setTimeout(() => {
        executeAutoPayoutForFee(initialFee);
      }, 1200);
    }
  };

  // Link an existing Solana mint (e.g. launched on Pump.fun) to Treasury & Fee Collector
  const handleLinkExistingToken = (
    mintAddress: string,
    beneficiaryXHandle: string,
    customName?: string,
    customSymbol?: string
  ) => {
    const cleanMint = mintAddress.trim();
    const cleanHandle = beneficiaryXHandle.trim().startsWith('@')
      ? beneficiaryXHandle.trim()
      : `@${beneficiaryXHandle.trim()}`;

    const existing = tokens.find(t => t.mintAddress?.toLowerCase() === cleanMint.toLowerCase());
    if (existing) {
      showToast(`Token $${existing.symbol} (${cleanMint.slice(0, 6)}...) is already registered with Treasury!`);
      return;
    }

    const isCyberDog = cleanMint === 'EE3LZQAWuqBid2dWqeVDFSjS3iHkRwywBbooYMhFWtLx';
    const name = customName?.trim() || (isCyberDog ? 'CyberDog' : `Solana Token ${cleanMint.slice(0, 4)}`);
    const symbol = customSymbol?.trim().toUpperCase() || (isCyberDog ? 'CYBERDOG' : `TKN${cleanMint.slice(0, 3).toUpperCase()}`);

    const newToken: TokenLaunchData = {
      id: `tok-linked-${Date.now()}`,
      name,
      symbol,
      description: `Linked community token on Pump.fun (Solana). Creator fees routed to ${cleanHandle} via X Money Treasury (${treasuryConfig.solanaTreasuryAddress}).`,
      logoUrl: isCyberDog
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=200&auto=format&fit=crop&q=80',
      platform: 'pumpfun',
      network: 'solana',
      beneficiaryXHandle: cleanHandle,
      beneficiaryName: cleanHandle.replace('@', ''),
      beneficiaryAvatar: `https://unavatar.io/x/${cleanHandle.replace('@', '')}`,
      initialBuyAmount: 0.1,
      feeSplitPct: 80,
      mintAddress: cleanMint,
      pairAddress: 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM',
      creatorFeeRecipient: treasuryConfig.solanaTreasuryAddress,
      marketCapUsd: 14500,
      volume24hUsd: 4900,
      bondingCurveProgress: 21,
      createdAt: new Date().toISOString(),
      creatorWallet: treasuryConfig.solanaTreasuryAddress,
      status: 'active',
      twitterLink: `https://x.com/${cleanHandle.replace('@', '')}`,
    };

    handleTokenLaunched(newToken);
    showToast(`✅ Linked mint ${cleanMint.slice(0, 8)}... to Treasury Wallet for Fee Flow!`);
  };

  // Automated payout dispatcher (zero manual claim needed)
  const executeAutoPayoutForFee = (fee: FeeCollectionRecord) => {
    const profile = getXUserProfile(fee.beneficiaryXHandle);
    const payoutId = `xpay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newPayout: XMoneyPayout = {
      id: payoutId,
      recipientHandle: fee.beneficiaryXHandle,
      recipientName: profile.name,
      recipientAvatar: profile.avatar,
      amountUsd: fee.beneficiaryCutUsd,
      sourceTokenSymbol: fee.tokenSymbol,
      sourcePlatform: fee.platform,
      status: 'completed',
      timestamp: new Date().toISOString(),
      xMoneyReferenceId: `XM-${Math.floor(10000000 + Math.random() * 90000000)}-${fee.currency}`,
      paymentMethod: 'X Money (USD Direct)',
      proofTweetText: `⚡ @Xpaid auto-deposited $${fee.beneficiaryCutUsd.toFixed(2)} USD directly to ${fee.beneficiaryXHandle} via 𝕏 Money from $${fee.tokenSymbol} trading fees on ${fee.platform.toUpperCase()}! (Zero claim needed). Ref: ${fee.sourceTxHash}`,
      blockchainRefTx: fee.sourceTxHash,
    };

    setPayouts(prev => [newPayout, ...prev]);
    setFees(prev => prev.map(f => f.id === fee.id ? { ...f, status: 'disbursed_x_money', xMoneyPayoutId: payoutId } : f));
    showToast(`⚡ Auto-Disbursed: $${fee.beneficiaryCutUsd.toFixed(2)} USD deposited into ${fee.beneficiaryXHandle}'s 𝕏 Money wallet! (Zero claim needed)`);
  };

  // Move accrued fee into treasury wallet
  const handleHarvestFees = (feeId: string) => {
    setFees(prev => prev.map(f => {
      if (f.id === feeId) {
        return {
          ...f,
          status: 'collected_in_treasury',
          treasuryTransferTxHash: f.network === 'solana' 
            ? `tr_${Math.random().toString(36).slice(2, 9)}` 
            : `0x${Math.random().toString(36).slice(2, 10)}`,
        };
      }
      return f;
    }));
    showToast('Fees collected into protocol treasury wallet!');
  };

  // Disburse individual fee to X User via X Money
  const handleExecutePayout = (feeId: string) => {
    const fee = fees.find(f => f.id === feeId);
    if (!fee) return;
    executeAutoPayoutForFee(fee);
  };

  // Batch disburse all pending fees to X Users
  const handleBatchPayoutAll = () => {
    const pending = fees.filter(f => f.status === 'collected_in_treasury');
    if (pending.length === 0) return;

    const newPayoutsList: XMoneyPayout[] = [];
    const updatedFees = fees.map(f => {
      if (f.status === 'collected_in_treasury') {
        const profile = getXUserProfile(f.beneficiaryXHandle);
        const pId = `xpay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        newPayoutsList.push({
          id: pId,
          recipientHandle: f.beneficiaryXHandle,
          recipientName: profile.name,
          recipientAvatar: profile.avatar,
          amountUsd: f.beneficiaryCutUsd,
          sourceTokenSymbol: f.tokenSymbol,
          sourcePlatform: f.platform,
          status: 'completed',
          timestamp: new Date().toISOString(),
          xMoneyReferenceId: `XM-${Math.floor(10000000 + Math.random() * 90000000)}-${f.currency}`,
          paymentMethod: 'X Money (USD Direct)',
          proofTweetText: `⚡ @Xpaid auto-deposited $${f.beneficiaryCutUsd.toFixed(2)} USD to ${f.beneficiaryXHandle} via 𝕏 Money from $${f.tokenSymbol} fees on ${f.platform.toUpperCase()}! (Zero claim needed)`,
          blockchainRefTx: f.sourceTxHash,
        });
        return { ...f, status: 'disbursed_x_money' as const, xMoneyPayoutId: pId };
      }
      return f;
    });

    setPayouts(prev => [...newPayoutsList, ...prev]);
    setFees(updatedFees);
    showToast(`⚡ Auto-Disbursed ${newPayoutsList.length} creator payouts via 𝕏 Money! (Zero claim needed)`);
  };

  // Simulate new trading volume
  const handleSimulateTradeFees = () => {
    if (tokens.length === 0) return;
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    const isSol = randomToken.network === 'solana';
    const isRH = randomToken.network === 'robinhood';
    const currency: FeeCurrency = isSol ? 'SOL' : isRH ? 'ETH' : 'BNB';
    const amount = isSol 
      ? +(0.3 + Math.random() * 0.8).toFixed(2) 
      : isRH 
      ? +(0.015 + Math.random() * 0.05).toFixed(3)
      : +(0.1 + Math.random() * 0.3).toFixed(2);
    const usdVal = isSol ? amount * 150 : isRH ? amount * 3400 : amount * 600;
    const beneficiaryCut = (usdVal * randomToken.feeSplitPct) / 100;
    const protocolCut = usdVal - beneficiaryCut;

    const newFee: FeeCollectionRecord = {
      id: `fee-${Date.now()}`,
      tokenId: randomToken.id,
      tokenSymbol: randomToken.symbol,
      tokenName: randomToken.name,
      platform: randomToken.platform,
      network: randomToken.network,
      rawAmount: amount,
      currency,
      amountUsd: usdVal,
      beneficiaryXHandle: randomToken.beneficiaryXHandle,
      beneficiaryCutUsd: beneficiaryCut,
      protocolCutUsd: protocolCut,
      status: 'collected_in_treasury',
      timestamp: new Date().toISOString(),
      sourceTxHash: isSol ? `tx_${Math.random().toString(36).slice(2, 9)}` : `0x${Math.random().toString(36).slice(2, 10)}`,
      treasuryTransferTxHash: isSol ? `tr_${Math.random().toString(36).slice(2, 9)}` : `0x${Math.random().toString(36).slice(2, 10)}`,
    };

    setFees(prev => [newFee, ...prev]);
    showToast(`Incoming trade on $${randomToken.symbol}! +$${usdVal.toFixed(2)} fees collected in Treasury Wallet.`);

    // Auto-disburse directly to X user's X Money account
    if (treasuryConfig.autoDisburseEnabled) {
      setTimeout(() => {
        executeAutoPayoutForFee(newFee);
      }, 1400);
    }
  };

  // Calculations for header
  const totalCollectedUsd = fees
    .filter(f => f.status === 'collected_in_treasury' || f.status === 'disbursed_x_money')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);

  const totalDisbursedUsd = payouts.reduce((acc, curr) => acc + curr.amountUsd, 0);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-100/70 text-zinc-900'} flex flex-col font-sans transition-colors`}>
      {/* Toast Notification - mobile elevated above bottom nav */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-center sm:justify-start gap-3 border border-zinc-700 dark:border-zinc-600 animate-fade-in text-xs sm:text-sm max-w-sm sm:max-w-md mx-auto sm:mx-0">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-center sm:text-left">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        treasuryConfig={treasuryConfig}
        totalCollectedUsd={totalCollectedUsd}
        totalDisbursedUsd={totalDisbursedUsd}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProofBadge={() => {
          setSelectedProofTokenMint(undefined);
          setIsProofModalOpen(true);
        }}
        connectedWallet={connectedWallet}
        onToggleWallet={handleToggleWallet}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      {/* Main Content Area - padded for bottom mobile bar */}
      <main className="flex-1 pb-24 sm:pb-16">
        {activeTab === 'launch' && (
          <TokenLaunchWizard
            treasuryConfig={treasuryConfig}
            onTokenLaunched={handleTokenLaunched}
            onNavigateToFees={() => setActiveTab('fees')}
            onNavigateToHowItWorks={() => setActiveTab('how-it-works')}
            connectedWallet={connectedWallet}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
          />
        )}

        {activeTab === 'fees' && (
          <FeeCollectorDashboard
            tokens={tokens}
            fees={fees}
            treasuryConfig={treasuryConfig}
            onHarvestFees={handleHarvestFees}
            onSimulateTradeFees={handleSimulateTradeFees}
            onNavigateToPayouts={() => setActiveTab('payouts')}
            onLinkExistingToken={handleLinkExistingToken}
            onOpenProofBadge={(mint) => {
              setSelectedProofTokenMint(mint);
              setIsProofModalOpen(true);
            }}
          />
        )}

        {activeTab === 'payouts' && (
          <XMoneyPayoutEngine
            fees={fees}
            payouts={payouts}
            treasuryConfig={treasuryConfig}
            onExecutePayout={handleExecutePayout}
            onBatchPayoutAll={handleBatchPayoutAll}
          />
        )}

        {activeTab === 'lookup' && (
          <XUserLookupPortal
            tokens={tokens}
            fees={fees}
            payouts={payouts}
            onSelectToken={(t) => setActiveTab('fees')}
          />
        )}

        {activeTab === 'how-it-works' && (
          <HowThingsWork
            treasuryConfig={treasuryConfig}
            onNavigateToLaunch={() => setActiveTab('launch')}
            onNavigateToFees={() => setActiveTab('fees')}
            onNavigateToPayouts={() => setActiveTab('payouts')}
          />
        )}
      </main>

      {/* Transparency Proof Modal */}
      <TransparencyProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        tokens={tokens}
        treasuryConfig={treasuryConfig}
        selectedTokenId={selectedProofTokenMint}
      />

      {/* Treasury Settings Modal */}
      <TreasurySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={treasuryConfig}
        onSaveConfig={(cfg) => {
          setTreasuryConfig(cfg);
          showToast('Treasury configuration updated');
        }}
      />

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={(addr) => {
          setConnectedWallet(addr);
          showToast(`Wallet connected: ${addr.slice(0, 4)}...${addr.slice(-4)}`);
        }}
        currentConnectedAddress={connectedWallet}
        onDisconnect={() => {
          setConnectedWallet(null);
          showToast('Wallet disconnected');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 mb-16 sm:mb-0 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">Xpaid Protocol</span>
            <span>•</span>
            <span>Fee Bridge for Pump.fun (Solana Active • 𝕏 Money Settlement)</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
            <span>Creator Royalty Router</span>
            <span>•</span>
            <span>𝕏 Money Settlement API</span>
            <span>•</span>
            <span>Solana Mainnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
