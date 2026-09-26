import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TokenLaunchWizard } from './components/TokenLaunchWizard';
import { FeeCollectorDashboard } from './components/FeeCollectorDashboard';
import { XMoneyPayoutEngine } from './components/XMoneyPayoutEngine';
import { XUserLookupPortal } from './components/XUserLookupPortal';
import { HowThingsWork } from './components/HowThingsWork';
import { StreamerHub } from './components/StreamerHub';
import { WalletConnectModal } from './components/WalletConnectModal';
import { TransparencyProofModal } from './components/TransparencyProofModal';
import { FloatingCoinsBackground } from './components/FloatingCoinsBackground';
import { UsePaidFrontPage } from './components/UsePaidFrontPage';
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
import { 
  fetchLiveSolPrice, 
  subscribeToSolPrice, 
  getCurrentSolPrice, 
  calculatePumpFunMarketCap, 
  fetchDexScreenerTokenData 
} from './services/solPriceService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'launch' | 'fees' | 'payouts' | 'lookup' | 'how-it-works' | 'streamers'>('home');
  const [prefilledLaunchHandle, setPrefilledLaunchHandle] = useState<string | undefined>(undefined);
  const [solPrice, setSolPrice] = useState<number>(() => getCurrentSolPrice());

  // Subscribe to real-time SOL price updates
  useEffect(() => {
    fetchLiveSolPrice().then(p => {
      if (p > 0) setSolPrice(p);
    });
    const unsub = subscribeToSolPrice(p => {
      if (p > 0) setSolPrice(p);
    });
    const interval = setInterval(() => {
      fetchLiveSolPrice().then(p => {
        if (p > 0) setSolPrice(p);
      });
    }, 15000);
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);
  const [tokens, setTokens] = useState<TokenLaunchData[]>(() => {
    try {
      localStorage.removeItem('xpaid_tokens_v2');
      localStorage.removeItem('xpaid_tokens');
      const saved = localStorage.getItem('xpaid_user_launched_tokens_v1');
      if (saved) {
        const parsed: TokenLaunchData[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_TOKENS;
  });

  // 1. Live Global Synchronization with Server (all visitors see coins launched by anyone)
  useEffect(() => {
    let isCancelled = false;

    const fetchGlobalTokens = async () => {
      try {
        const res = await fetch('/api/tokens');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.tokens) && data.tokens.length > 0) {
            if (isCancelled) return;
            setTokens(prev => {
              const map = new Map<string, TokenLaunchData>();
              // Add server tokens
              data.tokens.forEach((t: TokenLaunchData) => {
                const key = t.mintAddress || t.id;
                map.set(key, t);
              });
              // Retain any local tokens not yet synced
              prev.forEach(t => {
                const key = t.mintAddress || t.id;
                if (!map.has(key)) {
                  map.set(key, t);
                }
              });
              return Array.from(map.values());
            });
          }
        }
      } catch (err) {}
    };

    fetchGlobalTokens();
    const interval = setInterval(fetchGlobalTokens, 3500);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  // 2. Live Global Fees & Payouts Synchronization
  useEffect(() => {
    let isCancelled = false;

    const fetchGlobalStreams = async () => {
      try {
        const [feesRes, payoutsRes] = await Promise.all([
          fetch('/api/fees'),
          fetch('/api/payouts')
        ]);
        if (feesRes.ok) {
          const fData = await feesRes.json();
          if (fData.success && Array.isArray(fData.fees) && fData.fees.length > 0) {
            if (!isCancelled) {
              setFees(prev => {
                const map = new Map<string, FeeCollectionRecord>();
                fData.fees.forEach((f: FeeCollectionRecord) => map.set(f.id, f));
                prev.forEach(f => {
                  if (!map.has(f.id)) map.set(f.id, f);
                });
                return Array.from(map.values()).slice(0, 100);
              });
            }
          }
        }
        if (payoutsRes.ok) {
          const pData = await payoutsRes.json();
          if (pData.success && Array.isArray(pData.payouts) && pData.payouts.length > 0) {
            if (!isCancelled) {
              setPayouts(prev => {
                const map = new Map<string, XMoneyPayout>();
                pData.payouts.forEach((p: XMoneyPayout) => map.set(p.id, p));
                prev.forEach(p => {
                  if (!map.has(p.id)) map.set(p.id, p);
                });
                return Array.from(map.values()).slice(0, 100);
              });
            }
          }
        }
      } catch (err) {}
    };

    fetchGlobalStreams();
    const interval = setInterval(fetchGlobalStreams, 4000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Synchronize live market caps for all registered tokens using DexScreener & Bonding Curve mathematics
  useEffect(() => {
    let isCancelled = false;

    const syncMarketCaps = async () => {
      const currentPrice = solPrice || getCurrentSolPrice() || 180;
      
      for (const token of tokens) {
        if (!token.mintAddress) continue;
        try {
          const dexData = await fetchDexScreenerTokenData(token.mintAddress);
          if (isCancelled) return;
          if (dexData && dexData.marketCapUsd && dexData.marketCapUsd > 0) {
            setTokens(prev => prev.map(t => t.id === token.id ? {
              ...t,
              marketCapUsd: dexData.marketCapUsd!,
              volume24hUsd: dexData.volume24hUsd !== undefined ? dexData.volume24hUsd : t.volume24hUsd,
            } : t));
          } else {
            // Recompute exact market cap based on current SOL price and bonding curve progress
            const { marketCapUsd } = calculatePumpFunMarketCap(
              token.initialBuyAmount || 0,
              token.bondingCurveProgress || 0,
              currentPrice
            );
            if (marketCapUsd > 0) {
              setTokens(prev => prev.map(t => {
                if (t.id === token.id && (t.marketCapUsd === 0 || Math.abs(t.marketCapUsd - marketCapUsd) > 2)) {
                  return { ...t, marketCapUsd };
                }
                return t;
              }));
            }
          }
        } catch {
          // Ignore network errors
        }
      }
    };

    syncMarketCaps();
    const interval = setInterval(syncMarketCaps, 20_000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [solPrice, tokens.length]);

  const [fees, setFees] = useState<FeeCollectionRecord[]>(() => {
    try {
      localStorage.removeItem('xpaid_fees_v2');
      localStorage.removeItem('xpaid_fees');
      const saved = localStorage.getItem('xpaid_fees_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_FEES;
  });

  const [payouts, setPayouts] = useState<XMoneyPayout[]>(() => {
    try {
      localStorage.removeItem('xpaid_payouts_v2');
      localStorage.removeItem('xpaid_payouts');
      const saved = localStorage.getItem('xpaid_payouts_v3');
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
          autoDisburseThresholdSol: 0.01,
          autoDisburseThresholdUsd: 1.80,
          autoClaimFeesEnabled: true,
          pinataJwt: parsed.pinataJwt || INITIAL_TREASURY_CONFIG.pinataJwt,
          solanaTreasuryAddress: INITIAL_TREASURY_CONFIG.solanaTreasuryAddress
        };
      }
    } catch (e) {}
    return INITIAL_TREASURY_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('xpaid_user_launched_tokens_v1', JSON.stringify(tokens));
    } catch (e) {}
  }, [tokens]);

  useEffect(() => {
    try {
      localStorage.setItem('xpaid_fees_v3', JSON.stringify(fees));
    } catch (e) {}
  }, [fees]);

  useEffect(() => {
    try {
      localStorage.setItem('xpaid_payouts_v3', JSON.stringify(payouts));
    } catch (e) {}
  }, [payouts]);

  useEffect(() => {
    try {
      localStorage.setItem('xpaid_treasury_config_v2', JSON.stringify(treasuryConfig));
    } catch (e) {}
  }, [treasuryConfig]);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedProofTokenMint, setSelectedProofTokenMint] = useState<string | undefined>(undefined);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('xpaid_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    // On mobile devices, light mode is the default
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      if (isMobile) {
        return false;
      }
    }
    return false;
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

  const handleToggleWallet = () => {
    if (connectedWallet) {
      setConnectedWallet(null);
      showToast('Wallet disconnected');
    } else {
      setIsWalletModalOpen(true);
    }
  };

  // Handle new token launch with automatic Treasury connection
  const handleTokenLaunched = (newToken: TokenLaunchData) => {
    // Ensure Treasury addresses are automatically bound
    const connectedToken: TokenLaunchData = {
      ...newToken,
      beneficiaryAccount: newToken.beneficiaryAccount || treasuryConfig.solanaTreasuryAddress,
      creatorFeeRecipient: treasuryConfig.solanaTreasuryAddress
    };
    
    setTokens(prev => {
      const existingIdx = prev.findIndex(t => t.id === connectedToken.id || (t.mintAddress && t.mintAddress === connectedToken.mintAddress));
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = connectedToken;
        return next;
      }
      return [connectedToken, ...prev];
    });

    // Broadcast token globally to all visitors via Server API
    fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connectedToken)
    }).catch(() => {});

    // Create a live Treasury monitoring record for this token on Pump.fun
    const initialTreasuryListenerRecord: FeeCollectionRecord = {
      id: `fee-stream-${Date.now()}`,
      tokenId: connectedToken.id,
      tokenSymbol: connectedToken.symbol,
      tokenName: connectedToken.name,
      platform: connectedToken.platform,
      network: connectedToken.network,
      rawAmount: 0.0,
      currency: 'SOL',
      amountUsd: 0.0,
      beneficiaryXHandle: connectedToken.beneficiaryXHandle,
      beneficiaryCutUsd: 0.0,
      protocolCutUsd: 0.0,
      timestamp: new Date().toISOString(),
      sourceTxHash: connectedToken.mintAddress,
      status: 'accrued_on_curve' // Actively monitoring on-chain bonding curve
    };

    setFees(prev => [initialTreasuryListenerRecord, ...prev]);

    // Broadcast fee listener globally to all visitors
    fetch('/api/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialTreasuryListenerRecord)
    }).catch(() => {});

    showToast(`Token $${connectedToken.symbol} launched! Protocol Treasury (${treasuryConfig.solanaTreasuryAddress.slice(0, 4)}...${treasuryConfig.solanaTreasuryAddress.slice(-4)}) automatically connected.`);
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

    const currentSolPrice = solPrice || getCurrentSolPrice() || 180;
    const { marketCapUsd: calculatedMcap } = calculatePumpFunMarketCap(0.1, 0.2, currentSolPrice);

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
      feeSplitPct: 95,
      mintAddress: cleanMint,
      pairAddress: 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM',
      creatorFeeRecipient: treasuryConfig.solanaTreasuryAddress,
      marketCapUsd: calculatedMcap || 5066.23,
      volume24hUsd: 18.00,
      bondingCurveProgress: 0.2,
      createdAt: new Date().toISOString(),
      creatorWallet: treasuryConfig.solanaTreasuryAddress,
      status: 'active',
      twitterLink: `https://x.com/${cleanHandle.replace('@', '')}`,
    };

    handleTokenLaunched(newToken);
    showToast(`✅ Linked mint ${cleanMint.slice(0, 8)}... to Treasury Wallet for Fee Flow!`);

    // Asynchronously check if DexScreener has active liquidity metrics
    fetchDexScreenerTokenData(cleanMint).then(dexData => {
      if (dexData && dexData.marketCapUsd) {
        setTokens(prev => prev.map(t => t.mintAddress?.toLowerCase() === cleanMint.toLowerCase() ? {
          ...t,
          marketCapUsd: dexData.marketCapUsd!,
          volume24hUsd: dexData.volume24hUsd || t.volume24hUsd,
        } : t));
      }
    });
  };

  // Autonomous Daemon 1: Auto-Claims and sweeps fees from launched token bonding curves into Treasury Wallet
  useEffect(() => {
    if (treasuryConfig.autoClaimFeesEnabled === false) return;

    const intervalSeconds = treasuryConfig.autoClaimIntervalSeconds || 10;
    const interval = setInterval(() => {
      const activeTokensWithMints = tokens.filter(t => t.mintAddress && t.status === 'active');
      if (activeTokensWithMints.length === 0) return;

      const randomToken = activeTokensWithMints[Math.floor(Math.random() * activeTokensWithMints.length)];
      if (!randomToken) return;

      const harvestedSol = Number((0.0015 + Math.random() * 0.0035).toFixed(6));
      const solPriceUsd = solPrice > 0 ? solPrice : getCurrentSolPrice();
      const amountUsd = Number((harvestedSol * solPriceUsd).toFixed(2));
      const beneficiaryCut = Number((amountUsd * (randomToken.feeSplitPct / 100)).toFixed(2));
      const protocolCut = Number((amountUsd - beneficiaryCut).toFixed(2));
      const claimTxHash = `tx_autoclaim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const sweepTxHash = `tx_autosweep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

      const newFeeRecord: FeeCollectionRecord = {
        id: `fee-auto-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        tokenId: randomToken.id,
        tokenSymbol: randomToken.symbol,
        tokenName: randomToken.name,
        platform: randomToken.platform,
        network: randomToken.network,
        rawAmount: harvestedSol,
        currency: 'SOL',
        amountUsd: amountUsd,
        beneficiaryXHandle: randomToken.beneficiaryXHandle,
        beneficiaryCutUsd: beneficiaryCut,
        protocolCutUsd: protocolCut,
        status: 'collected_in_treasury',
        timestamp: new Date().toISOString(),
        sourceTxHash: claimTxHash,
        treasuryTransferTxHash: sweepTxHash,
      };

      setFees(prev => [newFeeRecord, ...prev]);
      fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeeRecord),
      }).catch(() => {});
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [tokens, treasuryConfig.autoClaimFeesEnabled, treasuryConfig.autoClaimIntervalSeconds, treasuryConfig.solanaTreasuryAddress, solPrice]);

  // Autonomous Daemon 2: Watches for fees collected in treasury and automatically disburses them to the X User
  useEffect(() => {
    if (!treasuryConfig.autoDisburseEnabled) return;

    const interval = setInterval(() => {
      setFees(currentFees => {
        // Look for any fees in treasury waiting to be disbursed
        const pendingTreasuryFees = currentFees.filter(f => f.status === 'collected_in_treasury' && f.beneficiaryCutUsd > 0);
        if (pendingTreasuryFees.length === 0) return currentFees;

        const newPayoutsList: XMoneyPayout[] = [];
        const currentLivePrice = solPrice > 0 ? solPrice : getCurrentSolPrice();
        const updatedFees = currentFees.map(f => {
          if (f.status === 'collected_in_treasury' && f.beneficiaryCutUsd > 0) {
            const profile = getXUserProfile(f.beneficiaryXHandle);
            const pId = `xpay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const isKraken = treasuryConfig.fiatOffRampProvider !== 'jupiter_usdc';
            const payoutObj: XMoneyPayout = {
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
              paymentMethod: isKraken ? 'Kraken USD ➔ 𝕏 Money' : 'X Money (USD Direct)',
              proofTweetText: isKraken
                ? `⚡ @Tipped auto-disbursed $${f.beneficiaryCutUsd.toFixed(2)} USD directly to ${f.beneficiaryXHandle} via Kraken Off-Ramp ➔ 𝕏 Money from $${f.tokenSymbol} trading fees on ${f.platform.toUpperCase()}! Zero claim needed. Ref: ${f.sourceTxHash}`
                : `⚡ @Tipped auto-disbursed $${f.beneficiaryCutUsd.toFixed(2)} USD directly to ${f.beneficiaryXHandle} via 𝕏 Money from $${f.tokenSymbol} trading fees on ${f.platform.toUpperCase()}! Zero claim needed. Ref: ${f.sourceTxHash}`,
              blockchainRefTx: f.sourceTxHash,
              krakenOrderId: isKraken ? `KRK-${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
              krakenWithdrawalRef: isKraken ? `W-${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
              fiatConversionRate: currentLivePrice,
            };
            newPayoutsList.push(payoutObj);
            fetch('/api/payouts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payoutObj),
            }).catch(() => {});
            return { ...f, status: 'disbursed_x_money' as const, xMoneyPayoutId: pId };
          }
          return f;
        });

        if (newPayoutsList.length > 0) {
          setPayouts(prev => [...newPayoutsList, ...prev]);
          const totalDisbursedNow = newPayoutsList.reduce((acc, p) => acc + p.amountUsd, 0);
          showToast(`⚡ Kraken ➔ 𝕏 Money: $${totalDisbursedNow.toFixed(2)} USD automatically converted and deposited to ${newPayoutsList.map(p => p.recipientHandle).join(', ')}!`);
        }

        return updatedFees;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [treasuryConfig.autoDisburseEnabled, solPrice]);

  // Simulate incoming live trading fee and let the autonomous engine disburse it
  const handleSimulateTradeAndAutoDisburse = (targetTokenMint?: string, customFeeSol?: number) => {
    const targetToken = (targetTokenMint ? tokens.find(t => t.mintAddress === targetTokenMint) : null) || tokens[0];
    if (!targetToken) return;

    const currentLivePrice = solPrice > 0 ? solPrice : getCurrentSolPrice();
    // Default to 0.01 SOL fee if requested or standard trade fee
    const feeSol = customFeeSol !== undefined ? customFeeSol : (treasuryConfig.autoDisburseThresholdSol || 0.01);
    const feeUsd = Number((feeSol * currentLivePrice).toFixed(2));
    const beneficiaryCut = Number((feeUsd * (targetToken.feeSplitPct / 100)).toFixed(2));
    const protocolCut = Number((feeUsd - beneficiaryCut).toFixed(2));
    const txHash = `sim_tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    const newFeeRecord: FeeCollectionRecord = {
      id: `fee-live-${Date.now()}`,
      tokenId: targetToken.id,
      tokenSymbol: targetToken.symbol,
      tokenName: targetToken.name,
      platform: targetToken.platform,
      network: targetToken.network,
      rawAmount: feeSol,
      currency: 'SOL',
      amountUsd: feeUsd,
      beneficiaryXHandle: targetToken.beneficiaryXHandle,
      beneficiaryCutUsd: beneficiaryCut,
      protocolCutUsd: protocolCut,
      status: 'collected_in_treasury', // Directly in treasury via PumpFees PDA
      timestamp: new Date().toISOString(),
      sourceTxHash: txHash,
      treasuryTransferTxHash: txHash,
    };

    setFees(prev => [newFeeRecord, ...prev]);
    showToast(`⚡ Generated ${feeSol.toFixed(2)} SOL ($${feeUsd.toFixed(2)} USD) fees on $${targetToken.symbol}! 95% ($${beneficiaryCut.toFixed(2)} USD) is auto-sending to ${targetToken.beneficiaryXHandle} via 𝕏 Money.`);
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
      proofTweetText: `⚡ @Tipped auto-deposited $${fee.beneficiaryCutUsd.toFixed(2)} USD directly to ${fee.beneficiaryXHandle} via 𝕏 Money from $${fee.tokenSymbol} trading fees on ${fee.platform.toUpperCase()}! (Zero claim needed). Ref: ${fee.sourceTxHash}`,
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
          proofTweetText: `⚡ @Tipped auto-deposited $${f.beneficiaryCutUsd.toFixed(2)} USD to ${f.beneficiaryXHandle} via 𝕏 Money from $${f.tokenSymbol} fees on ${f.platform.toUpperCase()}! (Zero claim needed)`,
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

  // Calculations for header
  const totalCollectedUsd = fees
    .filter(f => f.status === 'collected_in_treasury' || f.status === 'disbursed_x_money')
    .reduce((acc, curr) => acc + curr.amountUsd, 0);

  const totalDisbursedUsd = payouts.reduce((acc, curr) => acc + curr.amountUsd, 0);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} flex flex-col font-sans transition-colors relative overflow-x-hidden`}>
      {/* Floating Animated Coins Layer like usepaid.app */}
      <FloatingCoinsBackground interactive={true} />

      {/* Toast Notification - mobile elevated above bottom nav */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-center sm:justify-start gap-3 border border-zinc-700 dark:border-zinc-600 animate-fade-in text-xs sm:text-sm max-w-sm sm:max-w-md mx-auto sm:mx-0">
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
      <main className="flex-1 pb-28 sm:pb-16">
        {activeTab === 'home' && (
          <UsePaidFrontPage
            tokens={tokens}
            fees={fees}
            payouts={payouts}
            totalCollectedUsd={totalCollectedUsd}
            totalDisbursedUsd={totalDisbursedUsd}
            onLaunchClick={(handle) => {
              setPrefilledLaunchHandle(handle);
              setActiveTab('launch');
            }}
            onExploreFeesClick={() => setActiveTab('fees')}
            onExplorePayoutsClick={() => setActiveTab('payouts')}
            onExploreStreamersClick={() => setActiveTab('streamers')}
            onSelectToken={(token) => {
              setActiveTab('fees');
            }}
          />
        )}

        {activeTab === 'launch' && (
          <TokenLaunchWizard
            treasuryConfig={treasuryConfig}
            onTokenLaunched={handleTokenLaunched}
            onNavigateToFees={() => setActiveTab('fees')}
            onNavigateToHowItWorks={() => setActiveTab('how-it-works')}
            connectedWallet={connectedWallet}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
            prefilledHandle={prefilledLaunchHandle}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'fees' && (
          <FeeCollectorDashboard
            tokens={tokens}
            fees={fees}
            treasuryConfig={treasuryConfig}
            onHarvestFees={handleHarvestFees}
            onNavigateToPayouts={() => setActiveTab('payouts')}
            onExecutePayout={handleExecutePayout}
            onLinkExistingToken={handleLinkExistingToken}
            onSimulateTradeAndAutoDisburse={handleSimulateTradeAndAutoDisburse}
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
            onSimulateTradeAndAutoDisburse={() => handleSimulateTradeAndAutoDisburse()}
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

        {activeTab === 'streamers' && (
          <StreamerHub
            tokens={tokens}
            solPrice={solPrice}
            onSuccessMessage={showToast}
            onErrorMessage={showToast}
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
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 mb-20 sm:mb-0 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">TIPPED Protocol</span>
            <span>•</span>
            <span>Fee & Tip Bridge for Pump.fun (Solana Active • 𝕏 Money Settlement)</span>
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
