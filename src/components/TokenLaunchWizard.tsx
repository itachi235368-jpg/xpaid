import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Wallet,
  Zap,
  Upload,
  Image as ImageIcon,
  X,
  Globe,
  Send,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Wind,
  Layers,
  Flame,
  Activity,
  Cpu,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { LaunchPlatform, TokenLaunchData, TreasuryConfig } from '../types';
import { PRESET_MEME_LOGOS, getXUserProfile, KNOWN_X_USERS } from '../data/mockData';
import { deployPumpFunToken, getLiveSolBalance, getSolanaProvider } from '../services/solanaLaunch';
import { configurePumpFeeSharingOnChain } from '../services/pumpClaimService';
import { getCurrentSolPrice, calculatePumpFunMarketCap } from '../services/solPriceService';
import { playFartSound } from '../utils/fartSound';
import { FartPayLogo } from './FartPayLogo';

interface TokenLaunchWizardProps {
  treasuryConfig: TreasuryConfig;
  onTokenLaunched: (newToken: TokenLaunchData) => void;
  onNavigateToFees: () => void;
  onNavigateToHowItWorks?: () => void;
  connectedWallet?: string | null;
  onOpenWalletModal?: () => void;
  prefilledHandle?: string;
  onBackToHome?: () => void;
}

const POPULAR_HANDLES = [
  { handle: '@elonmusk', name: 'Elon Musk', ticker: 'ELON' },
  { handle: '@matt_furie', name: 'Matt Furie', ticker: 'PEPE' },
  { handle: '@cz_binance', name: 'CZ 🔶', ticker: 'BNB' },
  { handle: '@solana', name: 'Solana', ticker: 'SOL' },
  { handle: '@vitalikbuterin', name: 'Vitalik', ticker: 'VITALIK' },
];

export const TokenLaunchWizard: React.FC<TokenLaunchWizardProps> = ({
  treasuryConfig,
  onTokenLaunched,
  onNavigateToFees,
  onNavigateToHowItWorks,
  connectedWallet,
  onOpenWalletModal,
  prefilledHandle,
  onBackToHome,
}) => {
  const [platform, setPlatform] = useState<LaunchPlatform>('pumpfun');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState(PRESET_MEME_LOGOS[0].url);
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social Links
  const [twitterLink, setTwitterLink] = useState<string>('https://x.com/elonmusk');
  const [telegramLink, setTelegramLink] = useState<string>('');
  const [websiteLink, setWebsiteLink] = useState<string>('');
  const [showSocials, setShowSocials] = useState<boolean>(false);

  // Beneficiary Target Handle
  const [beneficiaryHandle, setBeneficiaryHandle] = useState(
    prefilledHandle ? (prefilledHandle.startsWith('@') ? prefilledHandle : `@${prefilledHandle}`) : '@elonmusk'
  );
  const [beneficiaryName, setBeneficiaryName] = useState('Elon Musk');
  const [initialBuy, setInitialBuy] = useState<string>('0.05');
  const [copiedMint, setCopiedMint] = useState(false);

  // Execution states
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState<number>(0);
  const [liveStatusText, setLiveStatusText] = useState<string>('');
  const [launchedToken, setLaunchedToken] = useState<TokenLaunchData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isSigningTx2, setIsSigningTx2] = useState(false);
  const [tx2StatusText, setTx2StatusText] = useState<string>('');

  const currentSolPrice = getCurrentSolPrice();

  useEffect(() => {
    if (prefilledHandle) {
      handleHandleChange(prefilledHandle);
    }
  }, [prefilledHandle]);

  useEffect(() => {
    if (connectedWallet) {
      getLiveSolBalance(connectedWallet, treasuryConfig.solanaRpcUrl).then(bal => {
        setWalletBalance(bal);
      });
    } else {
      setWalletBalance(null);
    }
  }, [connectedWallet, treasuryConfig.solanaRpcUrl]);

  const handleHandleChange = (newHandle: string) => {
    const formatted = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
    setBeneficiaryHandle(formatted);
    const known = KNOWN_X_USERS.find(u => u.handle.toLowerCase() === formatted.toLowerCase());
    if (known) {
      setBeneficiaryName(known.name);
      if (!name) setName(`${known.name} Token`);
      if (!symbol) setSymbol(known.handle.replace('@', '').slice(0, 5).toUpperCase());
    } else {
      setBeneficiaryName(formatted.replace('@', ''));
    }
    const cleanUsername = formatted.replace('@', '').trim();
    if (cleanUsername) {
      setTwitterLink(`https://x.com/${cleanUsername}`);
    }
  };

  const currentXProfile = getXUserProfile(beneficiaryHandle);

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    setErrorMsg(null);
    setCustomImageFile(file);
    setCustomFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setLogoUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSignTransaction2 = async () => {
    if (!launchedToken) return;

    try {
      setIsSigningTx2(true);
      setErrorMsg(null);
      setTx2StatusText('Connecting to wallet for PumpFees Royalty Binding...');

      const provider = getSolanaProvider();
      if (!provider) {
        throw new Error('Solana wallet not detected. Please install Phantom or Solflare.');
      }
      if (!provider.isConnected) {
        await provider.connect();
      }

      const creatorPubkey = provider.publicKey ? provider.publicKey.toString() : launchedToken.creatorWallet;

      const res = await configurePumpFeeSharingOnChain(
        provider,
        creatorPubkey,
        launchedToken.mintAddress,
        treasuryConfig.solanaTreasuryAddress,
        treasuryConfig.solanaRpcUrl,
        (status) => setTx2StatusText(status)
      );

      if (res.success && res.txHash) {
        const updated: TokenLaunchData = {
          ...launchedToken,
          feeSharingTx: res.txHash,
          feeSharingBound: true,
        };
        setLaunchedToken(updated);
        onTokenLaunched(updated);
        playFartSound('wet');
      } else {
        throw new Error(res.error || 'Transaction 2 was not signed.');
      }
    } catch (err: any) {
      console.error('Error signing Transaction 2:', err);
      setErrorMsg(err?.message || 'Transaction 2 signing failed.');
    } finally {
      setIsSigningTx2(false);
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sound effect trigger
    playFartSound('random');

    if (!name.trim() || !symbol.trim()) {
      setErrorMsg('Token Name and Symbol are required.');
      return;
    }
    if (!beneficiaryHandle.trim() || beneficiaryHandle === '@') {
      setErrorMsg('Please specify an 𝕏 handle to receive the royalties.');
      return;
    }

    if (!connectedWallet) {
      setErrorMsg('Please connect your Solana wallet to launch the token.');
      onOpenWalletModal?.();
      return;
    }

    setErrorMsg(null);
    setIsLaunching(true);
    setLaunchStep(1);
    setLiveStatusText('Compressing gas metadata & uploading to IPFS...');

    let finalMintAddr = '';
    let deployedMetadataUri: string | undefined;
    let deployedIpfsImageUrl: string | undefined;
    let deployedTwitterUrl: string | undefined;
    let deployedFeeSharingTx: string | undefined;

    try {
      setLaunchStep(2);
      setLiveStatusText('Initiating Pump.fun bonding curve contract...');
      const deployResult = await deployPumpFunToken(
        {
          name: name.trim(),
          symbol: symbol.toUpperCase().replace('$', ''),
          description: description || `FARTPAY royalty token for ${beneficiaryHandle}. 95% trading fees auto-route to USD on 𝕏.`,
          imageUrl: logoUrl,
          imageFile: customImageFile,
          twitterHandle: beneficiaryHandle.replace('@', ''),
          twitterLink: twitterLink,
          telegramLink: telegramLink,
          websiteLink: websiteLink,
          initialBuySol: parseFloat(initialBuy || '0'),
          creatorPublicKey: connectedWallet || '',
          beneficiaryAccount: treasuryConfig.solanaTreasuryAddress,
        },
        treasuryConfig,
        (status) => setLiveStatusText(status)
      );

      finalMintAddr = deployResult.mintAddress || '';
      deployedMetadataUri = deployResult.metadataUri;
      deployedIpfsImageUrl = deployResult.ipfsImageUrl;
      deployedTwitterUrl = twitterLink || `https://x.com/${beneficiaryHandle.replace('@', '')}`;

      // Transaction 2: Automatic PumpFee Sharing Binding
      setLaunchStep(3);
      setLiveStatusText('Binding 95% creator royalties to FARTPAY router...');

      try {
        const provider = getSolanaProvider();
        if (provider && finalMintAddr) {
          const creatorPubkey = provider.publicKey ? provider.publicKey.toString() : (connectedWallet || '');
          const feeResult = await configurePumpFeeSharingOnChain(
            provider,
            creatorPubkey,
            finalMintAddr,
            treasuryConfig.solanaTreasuryAddress,
            treasuryConfig.solanaRpcUrl,
            (status) => setLiveStatusText(status)
          );
          if (feeResult.success && feeResult.txHash) {
            deployedFeeSharingTx = feeResult.txHash;
          }
        }
      } catch (feeErr) {
        console.warn('Tx2 background auto-sign not completed:', feeErr);
      }
    } catch (err: any) {
      console.error('Launch failed:', err);
      setErrorMsg(err.message || 'Token launch failed. Please check wallet funds and try again.');
      setIsLaunching(false);
      return;
    }

    const initialMcapData = calculatePumpFunMarketCap(parseFloat(initialBuy || '0'), currentSolPrice);
    const initialMcap = typeof initialMcapData === 'number' ? initialMcapData : initialMcapData.marketCapUsd;

    const tokenData: TokenLaunchData = {
      id: `launch-${Date.now()}`,
      name: name.trim(),
      symbol: symbol.toUpperCase().replace('$', ''),
      description: description || `Meme token launched for ${beneficiaryHandle} on Pump.fun. 95% trading fees auto-settle to USD.`,
      logoUrl: deployedIpfsImageUrl || logoUrl,
      platform,
      network: 'solana',
      beneficiaryXHandle: beneficiaryHandle,
      beneficiaryName: beneficiaryName || beneficiaryHandle.replace('@', ''),
      beneficiaryAvatar: currentXProfile.avatar,
      beneficiaryAccount: treasuryConfig.solanaTreasuryAddress,
      initialBuyAmount: parseFloat(initialBuy || '0'),
      feeSplitPct: 95,
      mintAddress: finalMintAddr || 'Fart' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'Sol',
      pairAddress: 'Pump' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      creatorFeeRecipient: treasuryConfig.solanaTreasuryAddress,
      marketCapUsd: initialMcap || 3420,
      volume24hUsd: parseFloat(initialBuy || '0') * 1.5 * currentSolPrice,
      bondingCurveProgress: Math.max(2.4, Math.min(100, parseFloat(initialBuy || '0') * 4.2)),
      createdAt: new Date().toISOString(),
      creatorWallet: connectedWallet || 'Unknown',
      status: 'active',
      twitterLink: deployedTwitterUrl,
      telegramLink: telegramLink || undefined,
      websiteLink: websiteLink || undefined,
      metadataUri: deployedMetadataUri,
      ipfsImageUrl: deployedIpfsImageUrl,
      feeSharingTx: deployedFeeSharingTx,
      feeSharingBound: !!deployedFeeSharingTx,
    };

    onTokenLaunched(tokenData);
    setLaunchedToken(tokenData);
    setIsLaunching(false);
    playFartSound('trumpet');
  };

  const resetForm = () => {
    setName('');
    setSymbol('');
    setDescription('');
    setLogoUrl(PRESET_MEME_LOGOS[0].url);
    setCustomImageFile(null);
    setCustomFileName(null);
    setLaunchedToken(null);
    setLaunchStep(0);
    setErrorMsg(null);
  };

  const copyMintToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMint(true);
    setTimeout(() => setCopiedMint(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 relative z-10 space-y-8">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border border-lime-500/30 hover:border-lime-400 text-xs font-mono font-bold text-slate-300 hover:text-white shadow-lg backdrop-blur-xl transition-all cursor-pointer hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-lime-400" />
            <span>TERMINAL EXPLORER</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-500/10 border border-lime-500/30 text-[11px] font-mono font-bold text-lime-400">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            <span>GAS PRESSURE: 99.8% READY</span>
          </div>
        </div>
      </div>

      {/* Hero Studio Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-lime-500/30 bg-slate-950/80 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/15 border border-lime-500/40 text-xs font-mono font-bold text-lime-400">
            <Wind className="w-3.5 h-3.5 text-lime-400" />
            <span>FARTPAY LAUNCH ENGINE V2.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-['Outfit']">
            Deploy Meme Token for any <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400">𝕏 Account</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
            Pump.fun fair-launch bonding curve with automated <strong className="text-lime-400 font-mono">95% USD Creator Royalties</strong> streamed directly to their 𝕏 Money wallet.
          </p>
        </div>
      </div>

      {/* SUCCESS CARD VIEW */}
      {launchedToken && (
        <div className="rounded-3xl border-2 border-lime-500/50 bg-slate-950/90 p-6 sm:p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-lime-400 opacity-75 blur-md" />
                <img 
                  src={launchedToken.logoUrl} 
                  alt={launchedToken.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-lime-400 relative shrink-0"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
                    {launchedToken.name}
                  </h2>
                  <span className="px-2.5 py-1 rounded-xl bg-lime-500/20 text-lime-400 font-mono font-black text-sm border border-lime-500/30">
                    ${launchedToken.symbol}
                  </span>
                </div>
                <p className="text-sm text-slate-400 font-mono mt-1">
                  Recipient: <strong className="text-white">{launchedToken.beneficiaryXHandle}</strong> (95% Royalty Share)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={`https://pump.fun/coin/${launchedToken.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-500/25 transition-all"
              >
                <span>Trade on Pump.fun</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Launch Another →
              </button>
            </div>
          </div>

          {/* Royalty Binding Status */}
          {!launchedToken.feeSharingBound ? (
            <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-yellow-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  STEP 2 OF 2: SIGN ROYALTY BINDING
                </span>
                <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-mono font-black">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-yellow-200/80 leading-relaxed font-mono">
                Sign Transaction 2 in your wallet to legally bind 100% of Pump.fun creator fees to the FARTPAY protocol treasury router.
              </p>
              <button
                type="button"
                onClick={handleSignTransaction2}
                disabled={isSigningTx2}
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-yellow-500/20"
              >
                {isSigningTx2 ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>{tx2StatusText || 'Awaiting Signature...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>Sign Transaction 2 (PumpFees Binding)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-3 text-xs font-mono text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>PumpFees Royalty Successfully Bound on Solana Mainnet! 95% auto-converts to 𝕏 USD.</span>
            </div>
          )}

          {/* Audit Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Solana Mint Contract</span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-lime-400">
                <span className="truncate">{launchedToken.mintAddress}</span>
                <button
                  type="button"
                  onClick={() => copyMintToClipboard(launchedToken.mintAddress)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedMint ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Share On X (Twitter)</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just launched $${launchedToken.symbol} on @pumpdotfun via FartPay Protocol! 95% creator royalties stream straight to ${launchedToken.beneficiaryXHandle} via 𝕏 Money 💨🚀\n\nTrade now: https://pump.fun/coin/${launchedToken.mintAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 rounded-xl bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/40 text-[#1DA1F2] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Broadcast Launch Tweet</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MAIN DUAL-PANE LAUNCH STUDIO */}
      {!launchedToken && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleLaunch} className="rounded-3xl border border-lime-500/30 bg-slate-950/90 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
              
              {/* 1. Launch Ecosystem Selector */}
              <div className="space-y-2.5 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-lime-400" />
                    <span>1. Launch Ecosystem & Rail</span>
                  </label>
                  <span className="text-[10px] font-mono text-lime-400 font-bold">FAIR BONDING CURVE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPlatform('pumpfun')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      platform === 'pumpfun'
                        ? 'border-lime-400 bg-lime-500/15 shadow-lg shadow-lime-500/20'
                        : 'border-white/10 hover:border-white/20 bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-white">Pump.fun</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-lime-400 text-slate-950">LIVE</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Solana • 95% SOL Fees</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('fourmeme')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      platform === 'fourmeme'
                        ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/20'
                        : 'border-white/10 hover:border-white/20 bg-slate-900/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-white">Four.meme</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-400">SOON</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">BNB • 95% BNB Fees</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('pons')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      platform === 'pons'
                        ? 'border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-500/20'
                        : 'border-white/10 hover:border-white/20 bg-slate-900/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-white">Robinhood L2</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-400">SOON</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Pons EVM • Direct USD</span>
                  </button>
                </div>
              </div>

              {/* 2. Target Beneficiary X User */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className="text-lime-400 font-black">2.</span>
                    <span>Beneficiary 𝕏 Handle (Fee Recipient)</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">95% TO RECIPIENT</span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-lime-400 text-base">
                    @
                  </span>
                  <input
                    type="text"
                    value={beneficiaryHandle.replace(/^@/, '')}
                    onChange={(e) => handleHandleChange(e.target.value)}
                    placeholder="elonmusk, matt_furie, mrbeast..."
                    className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-white/10 focus:border-lime-400 text-white font-mono font-bold text-sm focus:outline-none transition-all shadow-inner"
                    required
                  />
                </div>

                {/* Popular Quick Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-mono">Presets:</span>
                  {POPULAR_HANDLES.map(p => (
                    <button
                      key={p.handle}
                      type="button"
                      onClick={() => handleHandleChange(p.handle)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                        beneficiaryHandle.toLowerCase() === p.handle.toLowerCase()
                          ? 'bg-lime-400 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5'
                      }`}
                    >
                      {p.handle}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Token Identity */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <label className="text-xs font-mono font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span className="text-lime-400 font-black">3.</span>
                  <span>Token Metadata</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Token Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fart Musk"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 focus:border-lime-400 text-white font-bold text-sm focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Ticker / Symbol</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-xs">$</span>
                      <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="FMUSK"
                        maxLength={10}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 focus:border-lime-400 text-white font-mono font-black text-sm uppercase focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`FartPay meme coin for ${beneficiaryHandle}. 95% creator fees route to 𝕏 USD.`}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-lime-400 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 4. Artwork / Meme Logo */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-xs font-mono font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span className="text-lime-400 font-black">4.</span>
                  <span>Meme Artwork & Logo</span>
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) processSelectedFile(e.dataTransfer.files[0]);
                  }}
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-4 ${
                    isDragging 
                      ? 'border-lime-400 bg-lime-500/10' 
                      : 'border-white/10 hover:border-lime-400/50 bg-slate-900/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) processSelectedFile(e.target.files[0]);
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-lime-400/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Upload className="w-3.5 h-3.5 text-lime-400" />
                      <span>{customFileName || 'Upload Custom Meme Image'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      PNG, JPG, SVG, GIF up to 8MB
                    </p>
                  </div>
                </div>

                {/* Preset Logos Row */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Quick Presets:</span>
                  {PRESET_MEME_LOGOS.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setLogoUrl(p.url);
                        setCustomImageFile(null);
                        setCustomFileName(null);
                      }}
                      className={`h-7 px-2.5 rounded-lg border flex items-center gap-1.5 text-[11px] font-mono transition-all cursor-pointer ${
                        logoUrl === p.url
                          ? 'border-lime-400 bg-lime-500/20 text-lime-300 font-bold shadow-xs'
                          : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-3.5 h-3.5 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Social Links & Community URLs */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSocials(!showSocials)}
                  className="w-full flex items-center justify-between text-xs font-mono font-black uppercase tracking-wider text-slate-300 hover:text-white transition-colors py-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-lime-400" />
                    <span className="text-lime-400 font-black">5.</span>
                    <span>Social Links & Community (Optional)</span>
                    <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/20 font-mono">
                      {showSocials ? 'active' : '+ add links'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <span>{showSocials ? 'Hide' : 'Expand'}</span>
                    {showSocials ? <ChevronUp className="w-3.5 h-3.5 text-lime-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {showSocials && (
                  <div className="space-y-3 pt-1 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">𝕏</span>
                        <span>Twitter / 𝕏 Profile Link</span>
                      </label>
                      <input
                        type="url"
                        value={twitterLink}
                        onChange={(e) => setTwitterLink(e.target.value)}
                        placeholder="https://x.com/username"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-lime-400 text-xs font-mono text-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-sky-400" />
                          <span>Telegram Community</span>
                        </label>
                        <input
                          type="url"
                          value={telegramLink}
                          onChange={(e) => setTelegramLink(e.target.value)}
                          placeholder="https://t.me/community"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-lime-400 text-xs font-mono text-white focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Official Website</span>
                        </label>
                        <input
                          type="url"
                          value={websiteLink}
                          onChange={(e) => setWebsiteLink(e.target.value)}
                          placeholder="https://mytoken.fun"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-lime-400 text-xs font-mono text-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Initial Dev Buy */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className="text-lime-400 font-black">6.</span>
                    <span>Initial Sniping / Buy (SOL)</span>
                  </label>
                  {walletBalance !== null && (
                    <span className="text-xs font-mono text-slate-400">
                      Wallet: <strong className="text-lime-400">{walletBalance.toFixed(3)} SOL</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={initialBuy}
                      onChange={(e) => setInitialBuy(e.target.value)}
                      placeholder="0.05"
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900/90 border border-white/10 focus:border-lime-400 text-white font-mono font-bold text-sm focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                      SOL
                    </span>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-lime-400 font-bold shrink-0">
                    ≈ ${(parseFloat(initialBuy || '0') * currentSolPrice).toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-xs text-red-400 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                {!connectedWallet ? (
                  <button
                    type="button"
                    onClick={onOpenWalletModal}
                    className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-lime-500/30 text-white font-mono font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer hover:border-lime-400 active:scale-95"
                  >
                    <Wallet className="w-4 h-4 text-lime-400" />
                    <span>CONNECT SOLANA WALLET TO LAUNCH</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLaunching}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 hover:from-lime-300 hover:to-cyan-300 text-slate-950 font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-lime-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isLaunching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        <span>{liveStatusText || 'DETONATING ON PUMP.FUN...'}</span>
                      </>
                    ) : (
                      <>
                        <Wind className="w-4 h-4 text-slate-950 animate-pulse" />
                        <span>DETONATE & LAUNCH ON PUMP.FUN</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Right Column: Holographic Real-Time Blueprint Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Holographic Card */}
            <div className="rounded-3xl border border-lime-500/40 bg-slate-950/90 p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
                  <span className="text-xs font-mono font-black text-slate-400 uppercase">Live Token Blueprint</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-lime-500/20 text-lime-400 border border-lime-500/40">
                  95% 𝕏 TIP RAIL ACTIVE
                </span>
              </div>

              {/* Avatar & Title */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/5">
                <img
                  src={logoUrl}
                  alt={name || 'Token'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-lime-400 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-black text-white font-['Outfit'] truncate">
                    {name || 'Fart Musk Token'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-lime-500/20 text-lime-400 font-mono font-black text-xs">
                      ${symbol || 'FMUSK'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono truncate">
                      {beneficiaryHandle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Beneficiary Recipient Preview */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Target 𝕏 Recipient:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    {beneficiaryHandle}
                    <span className="text-blue-400 font-bold">✓</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Royalty Share:</span>
                  <span className="font-bold text-lime-400">95% USD Direct to 𝕏</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Protocol Buy & Burn:</span>
                  <span className="font-bold text-yellow-400">5% SOL Burn</span>
                </div>
              </div>

              {/* Live Bonding Curve Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Bonding Curve Target:</span>
                  <span className="text-lime-400 font-bold">$69,000 USD (Raydium Migration)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-lime-400 to-cyan-400 rounded-full w-[12%]" />
                </div>
              </div>

              {/* Security Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">MINT REVOKE</div>
                  <div className="text-xs font-bold text-lime-400 font-mono">100% IMMUTABLE</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 font-mono">FREEZE AUTHORITY</div>
                  <div className="text-xs font-bold text-cyan-400 font-mono">PERMANENTLY REVOKED</div>
                </div>
              </div>

            </div>

            {/* How It Works Micro-Card */}
            <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 space-y-3">
              <h4 className="text-xs font-mono font-black uppercase text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
                <span>How FartPay Protocol Operates</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                When you deploy, the creator fee beneficiary is hardcoded to FARTPAY's on-chain router. Every trade on Pump.fun generates SOL fees, which are auto-liquidated to USD and settled straight into the recipient's 𝕏 Money account.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
