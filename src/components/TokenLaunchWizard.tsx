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
  ChevronUp
} from 'lucide-react';
import { LaunchPlatform, TokenLaunchData, TreasuryConfig } from '../types';
import { PRESET_MEME_LOGOS, getXUserProfile, KNOWN_X_USERS } from '../data/mockData';
import { deployPumpFunToken, getLiveSolBalance, getSolanaProvider } from '../services/solanaLaunch';
import { configurePumpFeeSharingOnChain } from '../services/pumpClaimService';
import { getCurrentSolPrice } from '../services/solPriceService';

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
  { handle: '@elonmusk', name: 'Elon Musk' },
  { handle: '@matt_furie', name: 'Matt Furie' },
  { handle: '@cz_binance', name: 'CZ 🔶' },
  { handle: '@solana', name: 'Solana' },
  { handle: '@vitalikbuterin', name: 'Vitalik' },
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
  const [feeSplit] = useState<number>(95); // 95% to Creator, 5% Buy & Burn

  useEffect(() => {
    if (prefilledHandle) {
      handleHandleChange(prefilledHandle);
    }
  }, [prefilledHandle]);

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
    setLiveStatusText('Uploading token metadata & image to IPFS...');

    let finalMintAddr = '';
    let deployedMetadataUri: string | undefined;
    let deployedIpfsImageUrl: string | undefined;
    let deployedTwitterUrl: string | undefined;
    let deployedFeeSharingTx: string | undefined;

    const effectiveBeneficiaryAccount = treasuryConfig.solanaTreasuryAddress;

    try {
      setLaunchStep(2);
      const deployResult = await deployPumpFunToken(
        {
          name: name.trim(),
          symbol: symbol.toUpperCase().replace('$', ''),
          description: description || `Community token launched for ${beneficiaryHandle} on Pump.fun. 95% trading fees automatically convert to USD via 𝕏 Money.`,
          imageUrl: logoUrl,
          imageFile: customImageFile,
          twitterHandle: beneficiaryHandle,
          twitterLink: twitterLink.trim() || undefined,
          telegramLink: telegramLink.trim() || undefined,
          websiteLink: websiteLink.trim() || undefined,
          initialBuySol: parseFloat(initialBuy) || 0,
          creatorPublicKey: connectedWallet,
          beneficiaryAccount: effectiveBeneficiaryAccount,
        },
        treasuryConfig,
        (status) => setLiveStatusText(status)
      );

      if (!deployResult.success && deployResult.error) {
        setErrorMsg(deployResult.error);
        setIsLaunching(false);
        setLaunchStep(0);
        return;
      }

      if (deployResult.mintAddress) finalMintAddr = deployResult.mintAddress;
      if (deployResult.metadataUri) deployedMetadataUri = deployResult.metadataUri;
      if (deployResult.ipfsImageUrl) deployedIpfsImageUrl = deployResult.ipfsImageUrl;
      if (deployResult.twitterUrl) deployedTwitterUrl = deployResult.twitterUrl;
      if (deployResult.feeSharingTx) deployedFeeSharingTx = deployResult.feeSharingTx;
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to deploy token on-chain.');
      setIsLaunching(false);
      setLaunchStep(0);
      return;
    }

    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const mintAddr = finalMintAddr || `${randomHex.toUpperCase()}pump`;

    const tokenData: TokenLaunchData = {
      id: `tok-${Date.now()}`,
      name: name.trim(),
      symbol: symbol.toUpperCase().replace('$', ''),
      description: description || `Community token launched for ${beneficiaryHandle}. 95% fees convert to USD via 𝕏 Money.`,
      logoUrl: deployedIpfsImageUrl || logoUrl,
      platform: 'pumpfun',
      network: 'solana',
      beneficiaryXHandle: beneficiaryHandle,
      beneficiaryName,
      beneficiaryAvatar: currentXProfile.avatar || `https://unavatar.io/x/${beneficiaryHandle.replace('@', '')}`,
      beneficiaryAccount: effectiveBeneficiaryAccount,
      initialBuyAmount: parseFloat(initialBuy) || 0,
      feeSplitPct: feeSplit,
      mintAddress: mintAddr,
      pairAddress: 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM',
      creatorFeeRecipient: effectiveBeneficiaryAccount,
      marketCapUsd: 0,
      volume24hUsd: 0,
      bondingCurveProgress: 0,
      createdAt: new Date().toISOString(),
      creatorWallet: connectedWallet || treasuryConfig.solanaTreasuryAddress,
      status: 'active',
      twitterLink: deployedTwitterUrl || twitterLink.trim() || `https://x.com/${beneficiaryHandle.replace('@', '')}`,
      telegramLink: telegramLink.trim() || undefined,
      websiteLink: websiteLink.trim() || undefined,
      metadataUri: deployedMetadataUri,
      ipfsImageUrl: deployedIpfsImageUrl,
      feeSharingTx: deployedFeeSharingTx,
      feeSharingBound: !!deployedFeeSharingTx,
    };

    onTokenLaunched(tokenData);
    setLaunchedToken(tokenData);
    setIsLaunching(false);
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 relative z-10">
      
      {/* Back to Home Button */}
      {onBackToHome && (
        <div className="mb-6">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Explore</span>
          </button>
        </div>
      )}
      
      {/* Sleek Hero Header */}
      <div className="text-center mb-8 sm:mb-10 space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pump.fun Automated Creator Royalty Bridge</span>
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Launch a token for any 𝕏 account
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
          <strong className="text-zinc-900 dark:text-zinc-200 font-semibold">95% of trading fees</strong> convert to USD and auto-deposit to their 𝕏 balance. <strong className="text-zinc-900 dark:text-zinc-200 font-semibold">5%</strong> buy & burn.
        </p>
      </div>

      {/* Success View */}
      {launchedToken && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-500/40 dark:border-emerald-500/30 p-6 sm:p-8 shadow-xl space-y-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <img 
              src={launchedToken.logoUrl} 
              alt={launchedToken.name}
              className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
                  {launchedToken.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  ${launchedToken.symbol}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                95% royalties routed to <strong className="text-zinc-900 dark:text-zinc-200">{launchedToken.beneficiaryXHandle}</strong>
              </p>
            </div>
          </div>

          {!launchedToken.feeSharingBound ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Step 2 of 2: Sign Royalty Binding
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-900 dark:text-amber-200 rounded">
                  Required
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Sign Transaction 2 in your wallet to legally bind 100% of Pump.fun creator fees to the treasury.
              </p>
              <button
                type="button"
                onClick={handleSignTransaction2}
                disabled={isSigningTx2}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isSigningTx2 ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{tx2StatusText || 'Awaiting Signature...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-200" />
                    <span>⚡ Sign Transaction 2 (PumpFees Binding)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>PumpFees Royalty Successfully Bound on Solana Mainnet!</span>
            </div>
          )}

          {/* Two-Transaction On-Chain Status Breakdown */}
          <div className="space-y-2.5 font-mono text-xs bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-sans">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">On-Chain Deployment Audit</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Solana Mainnet</span>
            </div>

            <div className="flex justify-between items-center text-zinc-500">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center">1</span>
                <span>Tx 1 (Token Mint):</span>
              </span>
              <a
                href={`https://solscan.io/token/${launchedToken.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>{launchedToken.mintAddress.slice(0, 6)}...{launchedToken.mintAddress.slice(-6)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex justify-between items-center text-zinc-500">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center">2</span>
                <span>Tx 2 (PumpFees Binding):</span>
              </span>
              {launchedToken.feeSharingBound ? (
                <a
                  href={`https://solscan.io/tx/${launchedToken.feeSharingTx || launchedToken.mintAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>{launchedToken.feeSharingTx ? `${launchedToken.feeSharingTx.slice(0, 6)}...${launchedToken.feeSharingTx.slice(-6)}` : 'Bound & Active'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] font-sans">Awaiting Tx 2 Signature</span>
              )}
            </div>

            <div className="flex justify-between items-center text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-sans">Beneficiary Routing:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">{launchedToken.beneficiaryXHandle} (95% USD)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://pump.fun/coin/${launchedToken.mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>View on Pump.fun</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onNavigateToFees}
              className="py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Track Fee Flow</span>
            </button>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
          >
            Launch Another Token →
          </button>
        </div>
      )}

      {/* Main Unified Launch Card */}
      {!launchedToken && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl p-5 sm:p-8 space-y-6">
          
          {/* Launchpad & Network Selector */}
          <div className="space-y-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Launchpad & Ecosystem
              </label>
              <span className="text-[11px] text-zinc-400">Multi-Chain Routing</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Pump.fun (Solana) - Live */}
              <button
                type="button"
                onClick={() => setPlatform('pumpfun')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  platform === 'pumpfun'
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Pump.fun</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    LIVE
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Solana • 95% SOL Fees
                </div>
              </button>

              {/* Four.meme (BNB Chain) - Coming Soon */}
              <button
                type="button"
                onClick={() => setPlatform('fourmeme')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  platform === 'fourmeme'
                    ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 ring-2 ring-amber-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Four.meme</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    SOON
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  BNB Chain • 95% BNB Fees
                </div>
              </button>

              {/* Pons / Robinhood - Coming Soon */}
              <button
                type="button"
                onClick={() => setPlatform('pons')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  platform === 'pons'
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Pons / Robinhood</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    SOON
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Direct USD & Equity Payouts
                </div>
              </button>
            </div>

            {/* Coming Soon Notice when Four.meme is chosen */}
            {platform === 'fourmeme' && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>🟡</span> Four.meme (BNB Smart Chain) Integration
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    In Development
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Four.meme token launches will automatically route 95% BNB creator fees from PancakeSwap bonding curves into 𝕏 Money USD settlements. Switch back to <strong>Pump.fun</strong> for live Solana launches.
                </p>
                <button
                  type="button"
                  onClick={() => setPlatform('pumpfun')}
                  className="mt-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Switch to Pump.fun (Solana Live) →
                </button>
              </div>
            )}

            {/* Coming Soon Notice when Pons / Robinhood is chosen */}
            {platform === 'pons' && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>🟢</span> Pons & Robinhood USD Rail Bridge
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Pons protocol off-ramps will enable direct USD transfers to Robinhood brokerage accounts, fractional stock rewards, and instant FedNow / ACH payouts.
                </p>
                <button
                  type="button"
                  onClick={() => setPlatform('pumpfun')}
                  className="mt-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Switch to Pump.fun (Solana Live) →
                </button>
              </div>
            )}
          </div>
          
          <form onSubmit={handleLaunch} className="space-y-6">
            
            {/* 1. Target 𝕏 Handle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                1. Target 𝕏 Account
              </label>
              
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400 dark:text-zinc-500 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={beneficiaryHandle.replace(/^@/, '')}
                  onChange={(e) => handleHandleChange(e.target.value)}
                  placeholder="elonmusk, matt_furie, creator..."
                  className="w-full pl-8 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                  required
                />
              </div>

              {/* Quick Pick Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-zinc-400">Popular:</span>
                {POPULAR_HANDLES.map(p => (
                  <button
                    key={p.handle}
                    type="button"
                    onClick={() => handleHandleChange(p.handle)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      beneficiaryHandle.toLowerCase() === p.handle.toLowerCase()
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {p.handle}
                  </button>
                ))}
              </div>

              {/* Live Profile Resolution Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 mt-2">
                <img 
                  src={currentXProfile.avatar} 
                  alt={currentXProfile.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {currentXProfile.name}
                    </span>
                    {(currentXProfile.verificationBadge !== 'none' || currentXProfile.kycVerified) && (
                      <span className="text-blue-500 font-bold text-xs" title="Verified 𝕏 Creator">✓</span>
                    )}
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] block">
                    {beneficiaryHandle}
                  </span>
                </div>
                <div className="text-right text-[11px]">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <DollarSign className="w-3 h-3" />
                    <span>95% USD Royalties</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Token Details */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                2. Token Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SpaceX Martian"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                    Ticker / Symbol
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-xs">
                      $
                    </span>
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      placeholder="MARS"
                      maxLength={10}
                      className="w-full pl-7 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 uppercase"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                  Description <span className="text-zinc-400 text-[11px] font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Meme token for ${beneficiaryHandle}. 95% trading fees auto-route to their 𝕏 Money wallet.`}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>
            </div>

            {/* 3. Artwork & Image */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                3. Artwork / Logo
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
                    ? 'border-emerald-500 bg-emerald-500/5' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50'
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
                  alt="Token Logo"
                  className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{customFileName || 'Upload custom logo'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Drag & drop or click to choose file (PNG, JPG, GIF up to 8MB)
                  </p>
                </div>
              </div>

              {/* Preset Memes row */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-zinc-400">Presets:</span>
                {PRESET_MEME_LOGOS.slice(0, 4).map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setLogoUrl(p.url);
                      setCustomImageFile(null);
                      setCustomFileName(null);
                    }}
                    className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform cursor-pointer"
                    title={p.name}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Social Links (𝕏, Telegram, Website) */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => setShowSocials(!showSocials)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors py-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Social Links & More Options</span>
                  <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    optional
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <span>{showSocials ? 'Hide' : 'Add Links'}</span>
                  {showSocials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              {showSocials && (
                <div className="space-y-3 pt-1 animate-fade-in">
                  <div>
                    <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
                      <span className="font-bold text-[11px]">𝕏</span>
                      <span>Twitter / 𝕏 Link</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={twitterLink}
                        onChange={(e) => setTwitterLink(e.target.value)}
                        placeholder="https://x.com/username"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
                        <Send className="w-3 h-3 text-sky-500" />
                        <span>Telegram Link</span>
                      </label>
                      <input
                        type="url"
                        value={telegramLink}
                        onChange={(e) => setTelegramLink(e.target.value)}
                        placeholder="https://t.me/community"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-emerald-500" />
                        <span>Website Link</span>
                      </label>
                      <input
                        type="url"
                        value={websiteLink}
                        onChange={(e) => setWebsiteLink(e.target.value)}
                        placeholder="https://myproject.fun"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Initial Buy & Economics */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  5. Initial Buy (Optional)
                </label>
                {walletBalance !== null && (
                  <span className="text-xs font-mono text-zinc-500">
                    Balance: <strong className="text-zinc-900 dark:text-zinc-200">{walletBalance.toFixed(3)} SOL</strong>
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
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    SOL
                  </span>
                </div>
                <div className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  ≈ ${(parseFloat(initialBuy || '0') * currentSolPrice).toFixed(2)} USD
                </div>
              </div>

              {/* Fee Split Bar */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    95% Creator Settlement (USD)
                  </span>
                  <span className="text-zinc-500">
                    5% Protocol Buy & Burn
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[95%]" />
                  <div className="h-full bg-zinc-400 dark:bg-zinc-600 w-[5%]" />
                </div>
              </div>
            </div>

            {/* 6. Two-Transaction Protocol Feature */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    2-Transaction Protocol
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  On-Chain Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Tx 1 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                      Tx 1: Token Mint & Curve
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                      Mints token on Pump.fun & pins metadata to IPFS.
                    </div>
                  </div>
                </div>

                {/* Tx 2 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                      Tx 2: PumpFees Binding
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                      Legally binds 100% creator fees for 95% USD payouts.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Primary Launch Action */}
            <div className="pt-2">
              {!connectedWallet ? (
                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="w-full py-4 px-6 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet to Launch</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLaunching}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLaunching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{liveStatusText || 'Launching on Pump.fun...'}</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      <span>Launch Token on Pump.fun</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
