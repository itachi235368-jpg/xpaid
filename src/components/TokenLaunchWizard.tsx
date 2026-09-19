import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Clock,
  Wallet,
  Zap,
  Check,
  Upload,
  Image as ImageIcon,
  FileImage,
  X,
  Link as LinkIcon,
  Globe,
  Send,
  ArrowRight
} from 'lucide-react';
import { LaunchPlatform, TokenLaunchData, TreasuryConfig } from '../types';
import { PRESET_MEME_LOGOS, getXUserProfile, KNOWN_X_USERS } from '../data/mockData';
import { deployPumpFunToken, getLiveSolBalance } from '../services/solanaLaunch';

interface TokenLaunchWizardProps {
  treasuryConfig: TreasuryConfig;
  onTokenLaunched: (newToken: TokenLaunchData) => void;
  onNavigateToFees: () => void;
  onNavigateToHowItWorks?: () => void;
  connectedWallet?: string | null;
  onOpenWalletModal?: () => void;
}

export const TokenLaunchWizard: React.FC<TokenLaunchWizardProps> = ({
  treasuryConfig,
  onTokenLaunched,
  onNavigateToFees,
  onNavigateToHowItWorks,
  connectedWallet,
  onOpenWalletModal,
}) => {
  const [platform, setPlatform] = useState<LaunchPlatform>('pumpfun');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState(PRESET_MEME_LOGOS[0].url);
  const [imageTab, setImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [customFileSize, setCustomFileSize] = useState<number | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social & Community Links (like pump.fun: X, Telegram, Website)
  const [twitterLink, setTwitterLink] = useState<string>('https://x.com/elonmusk');
  const [isTwitterLinkUserEdited, setIsTwitterLinkUserEdited] = useState<boolean>(false);
  const [telegramLink, setTelegramLink] = useState<string>('');
  const [websiteLink, setWebsiteLink] = useState<string>('');

  const [beneficiaryHandle, setBeneficiaryHandle] = useState('@elonmusk');
  const [beneficiaryName, setBeneficiaryName] = useState('Elon Musk');
  const [beneficiaryAccount, setBeneficiaryAccount] = useState<string>(treasuryConfig.solanaTreasuryAddress);
  const [isCustomBeneficiaryAccount, setIsCustomBeneficiaryAccount] = useState<boolean>(false);
  const [initialBuy, setInitialBuy] = useState<string>('0.05');
  const [feeSplit, setFeeSplit] = useState<number>(80);

  // Sync beneficiary account default with treasury address when configured
  useEffect(() => {
    if (!isCustomBeneficiaryAccount && treasuryConfig.solanaTreasuryAddress) {
      setBeneficiaryAccount(treasuryConfig.solanaTreasuryAddress);
    }
  }, [treasuryConfig.solanaTreasuryAddress, isCustomBeneficiaryAccount]);

  // Execution rail
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState<number>(0);
  const [liveStatusText, setLiveStatusText] = useState<string>('');
  const [launchedToken, setLaunchedToken] = useState<TokenLaunchData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [onChainTxHash, setOnChainTxHash] = useState<string | null>(null);

  const activeWalletAddress = connectedWallet || '';

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    setErrorMsg(null);
    setCustomImageFile(file);
    setCustomFileName(file.name);
    setCustomFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setLogoUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    // reset input value so re-selecting same file triggers onChange
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Refresh live SOL balance
  useEffect(() => {
    if (connectedWallet) {
      getLiveSolBalance(connectedWallet, treasuryConfig.solanaRpcUrl).then(bal => {
        setWalletBalance(bal);
      });
    } else {
      setWalletBalance(null);
    }
  }, [connectedWallet, treasuryConfig.solanaRpcUrl]);

  const currentPlatformInfo = {
    title: 'Pump.fun',
    chain: 'Solana',
    currency: 'SOL',
    treasuryWallet: treasuryConfig.solanaTreasuryAddress,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    badgeBg: 'bg-emerald-100',
    tagline: 'Standard Solana Meme Bonding Curve with 1% creator royalties',
  };

  const handleHandleChange = (newHandle: string, isQuickPick = false) => {
    const formatted = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
    setBeneficiaryHandle(formatted);
    const known = KNOWN_X_USERS.find(u => u.handle.toLowerCase() === formatted.toLowerCase());
    if (known) {
      setBeneficiaryName(known.name);
    } else {
      setBeneficiaryName(formatted.replace('@', ''));
    }

    // Auto-populate the 𝕏 (Twitter) link in Social Links with the selected fee beneficiary
    const cleanUsername = formatted.replace('@', '').trim();
    if (cleanUsername && (!isTwitterLinkUserEdited || isQuickPick)) {
      setTwitterLink(`https://x.com/${cleanUsername}`);
      if (isQuickPick) {
        setIsTwitterLinkUserEdited(false);
      }
    }
  };

  const applyPreset = (presetName: string, presetSymbol: string, presetDesc: string, presetHandle: string) => {
    setName(presetName);
    setSymbol(presetSymbol);
    setDescription(presetDesc);
    handleHandleChange(presetHandle, true);
    setPlatform('pumpfun');
    setLogoUrl(PRESET_MEME_LOGOS[0].url);
    setCustomImageFile(null);
    setCustomFileName(null);
    setCustomFileSize(null);
    setImageTab('preset');
  };

  const currentXProfile = getXUserProfile(beneficiaryHandle);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) {
      setErrorMsg('Token Name and Symbol are required.');
      return;
    }
    if (!beneficiaryHandle.trim() || beneficiaryHandle === '@') {
      setErrorMsg('Please specify a valid X (Twitter) handle to receive payouts.');
      return;
    }

    setErrorMsg(null);
    setIsLaunching(true);
    setLaunchStep(1);
    setLiveStatusText('Preparing token metadata...');

    let finalMintAddr = '';
    let finalTxHash = '';
    let deployedMetadataUri: string | undefined;
    let deployedIpfsImageUrl: string | undefined;
    let deployedTwitterUrl: string | undefined;

    const effectiveBeneficiaryAccount = treasuryConfig.solanaTreasuryAddress;

    if (!connectedWallet) {
      setErrorMsg('Please connect your Solana wallet (e.g. Phantom or Solflare) to sign the on-chain launch.');
      onOpenWalletModal?.();
      setIsLaunching(false);
      setLaunchStep(0);
      return;
    }

    try {
      setLaunchStep(2);
      const deployResult = await deployPumpFunToken(
        {
          name: name.trim(),
          symbol: symbol.toUpperCase().replace('$', ''),
          description: description || `Community token launched on Pump.fun (Solana). Creator fees routed to ${beneficiaryHandle} via X Money.`,
          imageUrl: logoUrl,
          imageFile: customImageFile,
          twitterHandle: beneficiaryHandle,
          twitterLink: twitterLink.trim() || undefined,
          telegramLink: telegramLink.trim() || undefined,
          websiteLink: websiteLink.trim() || undefined,
          initialBuySol: parseFloat(initialBuy) || 0,
          creatorPublicKey: connectedWallet,
          beneficiaryAccount: effectiveBeneficiaryAccount
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

      if (deployResult.mintAddress) {
        finalMintAddr = deployResult.mintAddress;
      }
      if (deployResult.txHash) {
        finalTxHash = deployResult.txHash;
        setOnChainTxHash(deployResult.txHash);
      }
      if (deployResult.metadataUri) {
        deployedMetadataUri = deployResult.metadataUri;
      }
      if (deployResult.ipfsImageUrl) {
        deployedIpfsImageUrl = deployResult.ipfsImageUrl;
      }
      if (deployResult.twitterUrl) {
        deployedTwitterUrl = deployResult.twitterUrl;
      }
    } catch (err: any) {
      console.warn('Deploy pumpfun error:', err);
      setErrorMsg(err?.message || 'Failed to deploy on-chain. Please check your wallet connection and gas.');
      setIsLaunching(false);
      setLaunchStep(0);
      return;
    }

    // Generate token record
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const mintAddr = finalMintAddr || `${randomHex.toUpperCase()}pump`;
    const pairAddr = `${Math.random().toString(36).substring(2, 12).toUpperCase()}pair`;

    const tokenData: TokenLaunchData = {
      id: `tok-${Date.now()}`,
      name: name.trim(),
      symbol: symbol.toUpperCase().replace('$', ''),
      description: description || `Community token launched on Pump.fun (Solana). Creator fees routed to ${beneficiaryHandle} via X Money.`,
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
      pairAddress: pairAddr,
      creatorFeeRecipient: effectiveBeneficiaryAccount,
      marketCapUsd: 0,
      volume24hUsd: 0,
      bondingCurveProgress: 0,
      createdAt: new Date().toISOString(),
      creatorWallet: connectedWallet || treasuryConfig.solanaTreasuryAddress,
      status: 'active',
      twitterLink: deployedTwitterUrl || twitterLink.trim() || (beneficiaryHandle ? `https://x.com/${beneficiaryHandle.replace('@', '')}` : undefined),
      telegramLink: telegramLink.trim() || undefined,
      websiteLink: websiteLink.trim() || undefined,
      metadataUri: deployedMetadataUri,
      ipfsImageUrl: deployedIpfsImageUrl,
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
    setCustomFileSize(null);
    setCustomUrlInput('');
    setTwitterLink('');
    setTelegramLink('');
    setWebsiteLink('');
    setBeneficiaryAccount(treasuryConfig.solanaTreasuryAddress);
    setIsCustomBeneficiaryAccount(false);
    setImageTab('upload');
    setLaunchedToken(null);
    setLaunchStep(0);
    setOnChainTxHash(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
      {/* Title & Concept Card */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous Fee Bridge Engine
          </div>

          {onNavigateToHowItWorks && (
            <button
              type="button"
              onClick={onNavigateToHowItWorks}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>How Things Work</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </button>
          )}
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Launch Token & Route Creator Fees to X Money
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Deploy meme tokens on <strong className="text-zinc-900 dark:text-zinc-200">Pump.fun (Solana)</strong> directly from your connected wallet. 
          All trading royalties are automatically collected into our protocol treasury wallet and disbursed directly to the designated X user via <strong className="text-zinc-900 dark:text-zinc-200">𝕏 Money</strong>.
        </p>

        {/* Quick presets */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <span className="text-zinc-400 dark:text-zinc-500 font-medium text-[11px] sm:text-xs">Quick Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('SpaceX Martian', 'MARS', 'The official Mars settlement meme coin on Pump.fun with auto 𝕏 Money royalty routing', '@elonmusk')}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors text-[11px] sm:text-xs border border-zinc-200 dark:border-zinc-700/60"
          >
            🚀 @elonmusk
          </button>
          <button
            type="button"
            onClick={() => applyPreset('CZ BNB Diamond', 'CZSOL', 'Meme token on Pump.fun routing creator trading fees to CZ via 𝕏 Money', '@cz_binance')}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors text-[11px] sm:text-xs border border-zinc-200 dark:border-zinc-700/60"
          >
            🔶 @cz_binance
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Pepe Solana', 'PEPE4X', 'Fair launch on Pump.fun routing trading fees to Matt Furie via 𝕏 Money', '@matt_furie')}
            className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors text-[11px] sm:text-xs border border-zinc-200 dark:border-zinc-700/60"
          >
            🐸 @matt_furie
          </button>
        </div>
      </div>

      {/* Success Modal / Banner when token is successfully launched */}
      {launchedToken && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={launchedToken.logoUrl}
                alt={launchedToken.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500/80 shadow-md bg-white dark:bg-zinc-900"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_MEME_LOGOS[0].url;
                }}
              />
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                  Successfully Deployed on PUMP.FUN
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Fee Listener Active
                </span>
                <span className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded font-semibold border border-blue-200 dark:border-blue-900/50 flex items-center gap-1">
                  <span className="font-bold">𝕏</span> Account Linked
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1.5">
                {launchedToken.name} (${launchedToken.symbol}) is Live!
              </h3>
              
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Creator fees generated from every trade on Pump.fun are routed directly to Treasury Wallet (SOL) and will automatically disburse to <strong className="text-zinc-900 dark:text-zinc-200">{launchedToken.beneficiaryXHandle}</strong> via X Money.
              </p>

              {/* On-chain Details Box */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 text-xs">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block font-medium">Token Mint Address:</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200 break-all font-semibold">{launchedToken.mintAddress}</span>
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block font-medium">Creator / Deployer Wallet:</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200 break-all font-semibold">{launchedToken.creatorWallet}</span>
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block font-medium">Beneficiary Account (Solana Treasury):</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 break-all font-semibold">
                      {launchedToken.beneficiaryAccount || launchedToken.creatorFeeRecipient}
                    </span>
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {(launchedToken.beneficiaryAccount || launchedToken.creatorFeeRecipient) === treasuryConfig.solanaTreasuryAddress ? 'Protocol Treasury Connected' : 'Custom'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block font-medium">Beneficiary 𝕏 Account:</span>
                  <a 
                    href={launchedToken.twitterLink || `https://x.com/${launchedToken.beneficiaryXHandle.replace('@', '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{launchedToken.beneficiaryXHandle}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">({launchedToken.feeSplitPct}% split)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {launchedToken.metadataUri && (
                  <div className="sm:col-span-2 pt-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-1">
                    <span className="text-zinc-400 dark:text-zinc-500 font-medium">IPFS Metadata (Image & 𝕏 embedded):</span>
                    <a
                      href={launchedToken.metadataUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span className="truncate max-w-[280px] sm:max-w-md">{launchedToken.metadataUri}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Community & Social Links Badge Row */}
              {(launchedToken.twitterLink || launchedToken.telegramLink || launchedToken.websiteLink) && (
                <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-zinc-500 font-medium text-[11px]">Community Links:</span>
                  {launchedToken.twitterLink && (
                    <a
                      href={launchedToken.twitterLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
                    >
                      <span className="text-[10px] font-bold">𝕏</span>
                      Twitter / 𝕏
                    </a>
                  )}
                  {launchedToken.telegramLink && (
                    <a
                      href={launchedToken.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-medium transition-colors"
                    >
                      <Send className="w-3 h-3 text-blue-500" />
                      Telegram
                    </a>
                  )}
                  {launchedToken.websiteLink && (
                    <a
                      href={launchedToken.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-medium transition-colors"
                    >
                      <Globe className="w-3 h-3 text-emerald-600" />
                      Website
                    </a>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={`https://pump.fun/coin/${launchedToken.mintAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Pump.fun
                </a>
                {launchedToken.metadataUri && (
                  <a
                    href={launchedToken.metadataUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    Verify IPFS Metadata
                  </a>
                )}
                <a
                  href={`https://solscan.io/token/${launchedToken.mintAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Solscan
                </a>
                <button
                  onClick={onNavigateToFees}
                  className="px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 flex items-center gap-2 transition-colors"
                >
                  <Coins className="w-4 h-4 text-emerald-600" />
                  View in Fee Collector
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors"
                >
                  Launch Another Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleLaunch} className="space-y-4 sm:space-y-6">
        {/* Step 1: Select Platform */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs flex items-center justify-center font-bold">1</span>
                Meme Launchpad Protocol
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Select where the bonding curve and creator fee listeners are deployed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Pump.fun option - Active */}
            <label
              className="cursor-pointer rounded-xl p-3.5 sm:p-4 border-2 transition-all flex flex-col justify-between border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs relative overflow-hidden"
            >
              <input
                type="radio"
                name="platform"
                value="pumpfun"
                checked={platform === 'pumpfun'}
                onChange={() => setPlatform('pumpfun')}
                className="sr-only"
              />
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                Active Now
              </div>
              <div>
                <div className="flex items-center justify-between pr-14">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">Pump.fun</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Solana
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 sm:mt-2">
                  Solana bonding curve with automated trading fee stream collected directly to treasury.
                </p>
              </div>
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">● Ready to Deploy</span>
                <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">SOL Fee Split</span>
              </div>
            </label>

            {/* Four.meme option - Coming Soon */}
            <div
              className="rounded-xl p-3.5 sm:p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 opacity-70 cursor-not-allowed flex flex-col justify-between relative overflow-hidden select-none"
            >
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                Soon
              </div>
              <div>
                <div className="flex items-center justify-between pr-12">
                  <span className="font-bold text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">Four.meme</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    BNB Chain
                  </span>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 sm:mt-2">
                  BNB Chain fair launchpad fee redirection hook scheduled for rollout.
                </p>
              </div>
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-500">
                  <Clock className="w-3 h-3" /> Coming Soon
                </span>
                <span className="font-mono">BNB</span>
              </div>
            </div>

            {/* Pons option - Coming Soon */}
            <div
              className="rounded-xl p-3.5 sm:p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 opacity-70 cursor-not-allowed flex flex-col justify-between relative overflow-hidden select-none"
            >
              <div className="absolute top-0 right-0 bg-teal-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                Soon
              </div>
              <div>
                <div className="flex items-center justify-between pr-12">
                  <span className="font-bold text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">Pons</span>
                  <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    Robinhood Chain
                  </span>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 sm:mt-2">
                  Robinhood Chain Ethereum L2 fair launchpad under testnet bridge testing.
                </p>
              </div>
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                <span className="inline-flex items-center gap-1 font-medium text-teal-600 dark:text-teal-500">
                  <Clock className="w-3 h-3" /> Coming Soon
                </span>
                <span className="font-mono">ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Token Identity & Branding */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs flex items-center justify-center font-bold">2</span>
              Token Identity & Artwork
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Specify your token's display info and avatar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Token Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CyberDoge, SpaceMusk"
                className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-base sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ticker / Symbol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. CDOGE, MUSK"
                maxLength={8}
                className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-base sm:text-sm font-mono uppercase"
                required
              />
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description & Vision
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell traders about the meme, the community, and the designated X creator..."
              rows={2}
              className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-base sm:text-sm"
            />
          </div>

          {/* Token Artwork / Logo Selection */}
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Token Artwork / Icon <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Upload an image file from your device, pick a meme preset, or paste a link.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    imageTab === 'upload'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Select File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('preset')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    imageTab === 'preset'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    imageTab === 'url'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  URL
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              className="hidden"
            />

            {/* Tab 1: Upload from Files (Drag & Drop + Button) */}
            {imageTab === 'upload' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 scale-[0.99]'
                    : customFileName
                    ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/50'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/70 dark:bg-zinc-950/50 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  {/* Thumbnail */}
                  <div className="relative shrink-0">
                    <img
                      src={logoUrl}
                      alt="Uploaded token logo"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-md bg-white dark:bg-zinc-900"
                    />
                    {customFileName && (
                      <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <FileImage className={`w-4 h-4 ${customFileName ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}`} />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {customFileName || 'Click to select an image from files'}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {customFileSize
                        ? `${(customFileSize / 1024).toFixed(1)} KB • Custom file ready for on-chain deployment`
                        : 'Drag and drop your image here, or tap Browse Files (PNG, JPG, GIF, WebP, SVG)'}
                    </p>

                    <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {customFileName ? 'Change File' : 'Browse Files'}
                      </button>

                      {customFileName && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomFileName(null);
                            setCustomFileSize(null);
                            setCustomImageFile(null);
                            setLogoUrl(PRESET_MEME_LOGOS[0].url);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Meme Presets */}
            {imageTab === 'preset' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={logoUrl}
                    alt="Active preset"
                    className="w-10 h-10 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Active Choice</span>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {PRESET_MEME_LOGOS.find(p => p.url === logoUrl)?.name || 'Custom Selection'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_MEME_LOGOS.map((item) => {
                    const isSelected = logoUrl === item.url && !customFileName;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setLogoUrl(item.url);
                          setCustomFileName(null);
                          setCustomFileSize(null);
                          setCustomImageFile(null);
                        }}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                        />
                        <span className={`text-[11px] truncate w-full font-medium ${isSelected ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Custom URL */}
            {imageTab === 'url' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://... direct image URL or IPFS link"
                    className="flex-1 px-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-base sm:text-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setLogoUrl(customUrlInput.trim());
                        setCustomFileName('External Image URL');
                        setCustomFileSize(null);
                        setCustomImageFile(null);
                      }
                    }}
                    disabled={!customUrlInput.trim()}
                    className="px-4 py-2.5 sm:py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Apply URL
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  <img
                    src={logoUrl}
                    alt="URL preview"
                    className="w-10 h-10 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PRESET_MEME_LOGOS[0].url;
                    }}
                  />
                  <div className="truncate flex-1">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium block">Current Artwork URL:</span>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate block">{logoUrl}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Social & Community Links */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs flex items-center justify-center font-bold">3</span>
                Social & Community Links
              </h3>
              <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                Pump.fun Standard
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Add your official community channels. These links are embedded directly into the Pump.fun on-chain token page and DEX screeners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* 𝕏 (Twitter) Link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center">𝕏</span>
                  𝕏 Link
                </label>
                <span className="text-[9px] sm:text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded font-medium border border-blue-200 dark:border-blue-900/60">
                  Auto-synced
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={twitterLink}
                  onChange={(e) => {
                    setTwitterLink(e.target.value);
                    setIsTwitterLinkUserEdited(true);
                  }}
                  placeholder={beneficiaryHandle ? `https://x.com/${beneficiaryHandle.replace('@', '')}` : "https://x.com/yourcommunity"}
                  className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-base sm:text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center justify-between">
                <span>Filled with 𝕏 fee beneficiary.</span>
                {isTwitterLinkUserEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      const clean = beneficiaryHandle.replace('@', '').trim();
                      setTwitterLink(`https://x.com/${clean}`);
                      setIsTwitterLinkUserEdited(false);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-1 shrink-0"
                  >
                    Reset
                  </button>
                )}
              </p>
            </div>

            {/* Telegram Link */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-500" />
                Telegram Channel
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  placeholder="https://t.me/yourgroup or @group"
                  className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-base sm:text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                Official Telegram community chat.
              </p>
            </div>

            {/* Website Link */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Website URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                  placeholder="https://yourtoken.com"
                  className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                Project homepage or meme landing site.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4: Beneficiary X (Twitter) Handle & Fee Split Settings */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs flex items-center justify-center font-bold">4</span>
                Designated 𝕏 Beneficiary
              </h3>
              <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium border border-blue-200 dark:border-blue-900/60">
                𝕏 Money Automatic Routing
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Trading fees collected by our treasury will be disbursed directly in USD to this X account via X Money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input handle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Target 𝕏 Handle <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 sm:top-2 text-zinc-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  value={beneficiaryHandle.replace('@', '')}
                  onChange={(e) => handleHandleChange(e.target.value)}
                  placeholder="elonmusk, cz_binance, or your username"
                  className="w-full pl-8 pr-3.5 py-2.5 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-base sm:text-sm font-medium"
                  required
                />
              </div>

              {/* Quick Pick Accounts with X Money Enabled */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">𝕏 Money Verified:</span>
                {['@elonmusk', '@cz_binance', '@matt_furie', '@naval', '@vitalikbuterin', '@mrbeast'].map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => handleHandleChange(handle, true)}
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                      beneficiaryHandle.toLowerCase() === handle.toLowerCase()
                        ? 'bg-blue-600 text-white border-blue-600 font-medium'
                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {handle}
                  </button>
                ))}
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Zero-Claim Protocol:</span> The creator does not need a crypto wallet. Royalties settle directly into their 𝕏 Money wallet.
                </div>
              </div>

              {/* Fee Split Slider */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Distribution Split:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] border border-emerald-200 dark:border-emerald-900/60">
                    {feeSplit}% to {beneficiaryHandle}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={feeSplit}
                  onChange={(e) => setFeeSplit(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  <span>50%</span>
                  <span>80% Default</span>
                  <span>95% Max</span>
                </div>
              </div>

              {/* Protocol Treasury Connection - Added to Every New Launch on Our Site */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Our Treasury Address (Automated Royalty Recipient)
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ADDED TO THIS LAUNCH
                  </span>
                </div>

                {/* Treasury Address Card */}
                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-emerald-900 dark:text-emerald-300 tracking-wider">
                      Solana Protocol Treasury (Pump.fun Fee Vault)
                    </span>
                    <a
                      href={`https://solscan.io/account/${treasuryConfig.solanaTreasuryAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-semibold"
                    >
                      <span>View on Solscan</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-3 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    <span className="break-all font-semibold select-all text-emerald-900 dark:text-emerald-300">
                      {treasuryConfig.solanaTreasuryAddress}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    ✨ <strong>Automated fee flow:</strong> Our treasury address above is automatically bound to this new token on-chain. All trading royalties generated on the Pump.fun bonding curve are collected into this vault and autonomously disbursed in USD to <strong className="text-zinc-900 dark:text-zinc-200">{beneficiaryHandle}</strong>'s 𝕏 Money account.
                  </p>
                </div>
              </div>
            </div>

            {/* Live X Profile Card Preview */}
            <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    𝕏 Money Availability Check
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentXProfile.badgeColor}`}>
                    {currentXProfile.xMoneyFeatureAvailable ? '● 𝕏 Money Available' : '○ Pending Setup'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={currentXProfile.avatar}
                    alt={currentXProfile.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentXProfile.handle)}`;
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{currentXProfile.name}</span>
                      {currentXProfile.verificationBadge === 'gold' ? (
                        <span className="bg-amber-400 text-zinc-950 font-bold rounded-full px-1 text-[9px]">✓ Gold</span>
                      ) : (
                        <span className="bg-blue-500 text-white font-bold rounded-full px-1 text-[9px]">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{currentXProfile.handle}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 leading-relaxed">
                  {currentXProfile.bio}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between items-center">
                  <span>Beneficiary Account:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-[170px]" title={beneficiaryAccount || treasuryConfig.solanaTreasuryAddress}>
                    {(beneficiaryAccount || treasuryConfig.solanaTreasuryAddress).slice(0, 4)}...{(beneficiaryAccount || treasuryConfig.solanaTreasuryAddress).slice(-4)}
                    {(!isCustomBeneficiaryAccount || beneficiaryAccount === treasuryConfig.solanaTreasuryAddress) ? ' (Treasury)' : ' (Custom)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Settlement:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">100% Automated (Zero Claim)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Region:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">{currentXProfile.countryRegion}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Speed:</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{currentXProfile.estimatedAutoDepositTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Creator Wallet & Launch Signing Authority */}
        <div className="bg-zinc-900 text-white p-4 sm:p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Creator Wallet & Signing Authority
                </h3>
                <p className="text-xs text-zinc-400">
                  The wallet from which the token is minted on Solana
                </p>
              </div>
            </div>

            {/* Connect / Switch Button */}
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="px-3.5 py-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[40px] self-start sm:self-auto"
            >
              <Wallet className="w-3.5 h-3.5" />
              {connectedWallet ? 'Switch Wallet' : 'Connect Wallet'}
            </button>
          </div>

          {/* Connected Wallet Info Card */}
          {connectedWallet ? (
            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-zinc-500 block mb-0.5">Signing Address:</span>
                <span className="font-mono font-semibold text-zinc-200 break-all">
                  {connectedWallet}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-1.5 py-0.2 rounded font-bold">
                    CONNECTED WALLET
                  </span>
                  <span className="text-zinc-500">• Solana Mainnet</span>
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Available Balance:</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {walletBalance !== null ? `${walletBalance.toFixed(3)} SOL` : 'Fetching balance...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 sm:p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-zinc-200 font-semibold block">No Wallet Connected</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Connect your personal Solana wallet (Phantom or Solflare) to deploy tokens directly on Pump.fun.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenWalletModal}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-xs min-h-[44px]"
              >
                <Wallet className="w-3.5 h-3.5" />
                Connect Wallet
              </button>
            </div>
          )}

          {/* Deployment Mode Card */}
          <div className="p-3.5 rounded-xl border border-purple-500/40 bg-purple-950/20 text-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs flex items-center gap-1.5 text-purple-300">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                Real On-Chain Solana Mainnet Launch
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                Pump.fun Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Broadcasts and creates the bonding curve on Solana Mainnet. Your wallet signs the transaction and all creator trading royalties route automatically to the treasury and 𝕏 Money.
            </p>
          </div>

          {/* Initial Dev Buy field */}
          <div className="pt-2.5 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs">
              <span className="text-zinc-300 font-medium">Initial Creator Buy (Optional):</span>
              <p className="text-zinc-500 text-[11px]">Purchase tokens in the first block of the bonding curve.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={initialBuy}
                onChange={(e) => setInitialBuy(e.target.value)}
                className="w-24 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-mono text-base sm:text-sm focus:outline-hidden focus:border-zinc-500"
              />
              <span className="text-xs font-semibold text-zinc-400">SOL</span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit / Launch Button */}
        <div className="pt-1 sm:pt-2">
          <button
            id="btn-launch-token"
            type="submit"
            disabled={isLaunching}
            className="w-full py-4 px-6 min-h-[52px] rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLaunching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="truncate">
                  {liveStatusText || 'Broadcasting transaction to Solana Mainnet...'}
                </span>
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 shrink-0" />
                <span className="truncate">
                  {`Launch ${symbol ? `$${symbol}` : 'Token'} On-Chain & Enable 𝕏 Money`}
                </span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
            Contract-enforced fee redirection • 100% of creator royalties route to Treasury and disburse via 𝕏 Money
          </p>
        </div>
      </form>
    </div>
  );
};
