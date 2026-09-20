export type LaunchPlatform = 'pumpfun' | 'fourmeme' | 'pons';
export type BlockchainNetwork = 'solana' | 'bsc' | 'robinhood';
export type FeeCurrency = 'SOL' | 'BNB' | 'ETH';

export type XMoneyFeatureStatus = 'active' | 'beta' | 'pending_setup' | 'unsupported_region';

export interface XUserProfile {
  handle: string;
  name: string;
  avatar: string;
  xMoneyStatus: XMoneyFeatureStatus;
  xMoneyStatusLabel: string;
  xMoneyFeatureAvailable: boolean;
  verificationBadge: 'gold' | 'blue' | 'none';
  countryRegion: string;
  bio: string;
  payoutMethod: 'Direct 𝕏 Money Auto-Deposit' | 'Escrow Auto-Reserve';
  estimatedAutoDepositTime: string;
  totalAutoDisbursedUsd: number;
  badgeColor: string;
  followersCount?: string;
  kycVerified?: boolean;
  railType?: 'Visa Direct P2P' | 'Stripe Connect' | 'Pending Setup';
  licensedJurisdiction?: string;
  eligibilityNotes?: string;
}

export interface TokenLaunchData {
  id: string;
  name: string;
  symbol: string;
  description: string;
  logoUrl: string;
  platform: LaunchPlatform;
  network: BlockchainNetwork;
  beneficiaryXHandle: string;
  beneficiaryName?: string;
  beneficiaryAvatar?: string;
  beneficiaryAccount?: string; // Solana beneficiary/treasury account (defaults to Protocol Treasury wallet)
  initialBuyAmount: number;
  feeSplitPct: number; // e.g. 95 means 95% to X user, 5% to protocol
  mintAddress: string;
  pairAddress: string;
  creatorFeeRecipient: string; // Our treasury wallet
  marketCapUsd: number;
  volume24hUsd: number;
  bondingCurveProgress: number; // 0 - 100%
  createdAt: string;
  creatorWallet: string;
  status: 'active' | 'graduated' | 'paused';
  twitterLink?: string;
  telegramLink?: string;
  websiteLink?: string;
  metadataUri?: string;
  ipfsImageUrl?: string;
  feeSharingTx?: string;
  feeSharingBound?: boolean;
}

export interface FeeCollectionRecord {
  id: string;
  tokenId: string;
  tokenSymbol: string;
  tokenName: string;
  platform: LaunchPlatform;
  network: BlockchainNetwork;
  rawAmount: number; // in SOL, BNB, or ETH
  currency: FeeCurrency;
  amountUsd: number;
  beneficiaryXHandle: string;
  beneficiaryCutUsd: number;
  protocolCutUsd: number;
  status: 'accrued_on_curve' | 'collected_in_treasury' | 'disbursed_x_money';
  timestamp: string;
  sourceTxHash: string;
  treasuryTransferTxHash?: string;
  xMoneyPayoutId?: string;
}

export interface XMoneyPayout {
  id: string;
  recipientHandle: string;
  recipientName: string;
  recipientAvatar: string;
  amountUsd: number;
  sourceTokenSymbol: string;
  sourcePlatform: LaunchPlatform;
  status: 'pending' | 'processing' | 'completed';
  timestamp: string;
  xMoneyReferenceId: string;
  paymentMethod: 'Kraken USD ➔ 𝕏 Money' | 'Kraken Instant FedNow (USD)' | 'X Money (USD Direct)' | 'X Escrow Wallet';
  proofTweetText: string;
  blockchainRefTx: string;
  krakenOrderId?: string;
  krakenWithdrawalRef?: string;
  fiatConversionRate?: number;
}

export interface TreasuryConfig {
  solanaTreasuryAddress: string;
  bnbTreasuryAddress: string;
  robinhoodTreasuryAddress: string;
  solanaRpcUrl: string;
  heliusWebhookId?: string;
  pinataJwt?: string;
  defaultFeeSplitToXUser: number; // 95%
  protocolBuybackBurnPct: number; // 5%
  autoDisburseThresholdSol: number; // e.g. 0.01 SOL threshold to trigger payout
  autoDisburseThresholdUsd: number; // e.g. $1.80 (0.01 SOL equivalent)
  autoDisburseEnabled: boolean;
  autoClaimFeesEnabled?: boolean; // Autonomous fee harvest from all token bonding curves
  autoClaimIntervalSeconds?: number; // Periodic harvest cycle
  activeNetwork: 'mainnet' | 'testnet';
  fiatOffRampProvider?: 'kraken' | 'jupiter_usdc' | 'stripe';
  krakenApiKey?: string;
  krakenDepositSolAddress?: string;
  krakenAutoSellToUsd?: boolean;
  krakenPayoutRail?: 'fednow_instant' | 'ach_standard' | 'kraken_pay_p2p' | 'x_money_direct';
}
