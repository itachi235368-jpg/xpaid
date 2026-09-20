import React, { useState } from 'react';
import { 
  Search, 
  UserCheck, 
  Coins, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Bell,
  Zap,
  Globe,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { TokenLaunchData, FeeCollectionRecord, XMoneyPayout, XUserProfile } from '../types';
import { KNOWN_X_USERS, getXUserProfile, X_MONEY_REGULATORY_DATA } from '../data/mockData';

interface XUserLookupPortalProps {
  tokens: TokenLaunchData[];
  fees: FeeCollectionRecord[];
  payouts: XMoneyPayout[];
  onSelectToken: (token: TokenLaunchData) => void;
}

export const XUserLookupPortal: React.FC<XUserLookupPortalProps> = ({
  tokens,
  fees,
  payouts,
  onSelectToken,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'directory' | 'regulatory'>('profile');
  const [searchHandle, setSearchHandle] = useState('@elonmusk');
  const [activeHandle, setActiveHandle] = useState('@elonmusk');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'active' | 'beta' | 'pending'>('all');
  const [directorySearch, setDirectorySearch] = useState('');
  const [showSimulatedPush, setShowSimulatedPush] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const cleanHandle = activeHandle.startsWith('@') ? activeHandle.toLowerCase() : `@${activeHandle.toLowerCase()}`;
  const currentProfile = getXUserProfile(cleanHandle);

  // Find tokens launched for this handle
  const userTokens = tokens.filter(
    t => t.beneficiaryXHandle.toLowerCase() === cleanHandle
  );

  // Find payouts for this handle
  const userPayouts = payouts.filter(
    p => p.recipientHandle.toLowerCase() === cleanHandle
  );

  // Find fees for this handle
  const userFees = fees.filter(
    f => f.beneficiaryXHandle.toLowerCase() === cleanHandle
  );

  const totalReceivedUsd = userPayouts.reduce((acc, p) => acc + p.amountUsd, 0);
  const pendingInTreasuryUsd = userFees
    .filter(f => f.status === 'collected_in_treasury')
    .reduce((acc, f) => acc + f.beneficiaryCutUsd, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchHandle.trim()) return;
    setActiveHandle(searchHandle.trim());
    setActiveTab('profile');
  };

  const selectUser = (handle: string) => {
    setSearchHandle(handle);
    setActiveHandle(handle);
    setActiveTab('profile');
  };

  // Filter directory users
  const filteredDirectoryUsers = KNOWN_X_USERS.filter(user => {
    const matchesSearch = 
      user.handle.toLowerCase().includes(directorySearch.toLowerCase()) ||
      user.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      user.countryRegion.toLowerCase().includes(directorySearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (directoryFilter === 'all') return true;
    if (directoryFilter === 'active') return user.xMoneyStatus === 'active';
    if (directoryFilter === 'beta') return user.xMoneyStatus === 'beta';
    if (directoryFilter === 'pending') return user.xMoneyStatus === 'pending_setup';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-3 sm:px-6 space-y-6 sm:space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-900">
          <span className="font-bold">𝕏</span>
          <span>𝕏 Money Feature Checker & Zero-Claim Deposit Tracker</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          𝕏 Money Availability & Automated Payouts
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          Verify which creators on 𝕏 have the 𝕏 Money payment feature active. All trading royalties flow automatically into their 𝕏 accounts—<strong>no manual claiming needed</strong>.
        </p>

        {/* View Mode Switcher */}
        <div className="mt-5 sm:mt-6 inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex-wrap justify-center gap-1 max-w-full">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Check Creator ({cleanHandle})</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Verified 𝕏 Directory ({KNOWN_X_USERS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('regulatory')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'regulatory'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>41-State MTL Guide</span>
          </button>
        </div>

        {/* Search Bar for single handle */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSearch} className="mt-4 sm:mt-5 flex items-center max-w-md mx-auto relative px-1 sm:px-0">
            <span className="absolute left-4 sm:left-4 text-zinc-400 dark:text-zinc-500 font-bold text-base">@</span>
            <input
              type="text"
              value={searchHandle.replace('@', '')}
              onChange={(e) => setSearchHandle(e.target.value)}
              placeholder="Enter any X handle to inspect 𝕏 Money..."
              className="w-full pl-9 pr-24 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-500 text-sm shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-3 sm:right-2 px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Verify
            </button>
          </form>
        )}

        {/* Quick select verified creators */}
        {activeTab === 'profile' && (
          <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs text-zinc-500 dark:text-zinc-400 px-2">
            <span className="text-[11px]">Quick Check:</span>
            {['@elonmusk', '@lindayeacc', '@xpayments', '@cz_binance', '@mrbeast', '@sama', '@brian_armstrong', '@matt_furie'].map(h => (
              <button
                key={h}
                onClick={() => selectUser(h)}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer ${
                  cleanHandle === h.toLowerCase()
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: PROFILE INSPECTOR */}
      {activeTab === 'profile' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Main User Card with 𝕏 Money Feature Status */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 sm:pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentProfile.handle)}`;
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{currentProfile.name}</h3>
                    {currentProfile.verificationBadge === 'gold' && (
                      <span className="bg-amber-400 text-zinc-950 font-bold rounded-full px-2 py-0.5 text-[10px]">
                        ✓ Gold Verified
                      </span>
                    )}
                    {currentProfile.verificationBadge === 'blue' && (
                      <span className="bg-blue-500 text-white font-bold rounded-full p-0.5 text-[10px]">
                        ✓
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">{currentProfile.handle}</span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">{currentProfile.bio}</p>

                  {/* 𝕏 Money Availability Badge & Badges */}
                  <div className="mt-3 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentProfile.badgeColor}`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {currentProfile.xMoneyStatusLabel}
                    </span>

                    {currentProfile.followersCount && (
                      <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700">
                        👥 {currentProfile.followersCount} Followers
                      </span>
                    )}

                    {currentProfile.railType && (
                      <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                        💳 Rail: {currentProfile.railType}
                      </span>
                    )}

                    <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium border border-zinc-200 dark:border-zinc-700">
                      Region: {currentProfile.countryRegion}
                    </span>

                    {currentProfile.kycVerified ? (
                      <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        KYC Verified
                      </span>
                    ) : (
                      <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        KYC Pending
                      </span>
                    )}

                    <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                      ⚡ Zero Claim: 100% Auto-Deposit
                    </span>
                  </div>
                </div>
              </div>

              {/* Push notification preview trigger */}
              <div className="flex flex-col sm:items-end gap-2 self-start">
                <button
                  onClick={() => setShowSimulatedPush(!showSimulatedPush)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{showSimulatedPush ? 'Hide 𝕏 Alert' : 'Preview 𝕏 Push Alert'}</span>
                </button>
              </div>
            </div>

            {/* Zero-Claim Automation Banner */}
            <div className="mt-4 sm:mt-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-emerald-50/80 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-emerald-950/30 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  𝕏
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>No Claim Required — Direct Auto-Deposit Active</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Trading royalties collected in our treasury are pushed directly into <strong>{currentProfile.handle}</strong>'s 𝕏 Money account within seconds of volume occurring on Pump.fun.
                  </p>
                </div>
              </div>

              <div className="shrink-0 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-left sm:text-right self-stretch sm:self-auto">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-400 block uppercase font-bold">Auto-Settlement Speed</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">{currentProfile.estimatedAutoDepositTime}</span>
              </div>
            </div>

            {/* 𝕏 Money Four-Pillar Eligibility Verification Matrix */}
            <div className="mt-4 sm:mt-5 p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    𝕏 Money Enablement & Compliance Matrix ({currentProfile.handle})
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentProfile.badgeColor}`}>
                  {currentProfile.xMoneyStatus === 'active' ? '● Fully Enabled' : currentProfile.xMoneyStatus === 'beta' ? '● Beta Enabled' : '○ Escrow Vault Mode'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-3 text-xs">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">1. Jurisdiction & MTL</span>
                    {currentProfile.xMoneyStatus !== 'pending_setup' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    )}
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mt-1">
                    {currentProfile.licensedJurisdiction || currentProfile.countryRegion}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                    {currentProfile.xMoneyStatus === 'active' ? 'Covered by 41-State MTL' : currentProfile.xMoneyStatus === 'beta' ? 'International RevShare' : 'Pending jurisdiction verification'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">2. Identity KYC</span>
                    {currentProfile.kycVerified ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    )}
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mt-1">
                    {currentProfile.kycVerified ? 'Government ID Verified' : 'KYC Identification Pending'}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                    {currentProfile.kycVerified ? 'AU10TIX / Stripe Verified' : 'Requires photo ID in 𝕏 app'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">3. Verified Tier</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mt-1">
                    {currentProfile.verificationBadge === 'gold' ? 'Gold Organization' : currentProfile.verificationBadge === 'blue' ? '𝕏 Premium (Blue)' : 'Standard Account'}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                    {currentProfile.followersCount ? `${currentProfile.followersCount} Followers` : 'Active community standing'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">4. Settlement Rail</span>
                    {currentProfile.xMoneyStatus !== 'pending_setup' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    )}
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mt-1">
                    {currentProfile.railType || 'Visa Direct P2P'}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                    {currentProfile.xMoneyStatus === 'active' ? 'Instant (<15s) settlement' : currentProfile.xMoneyStatus === 'beta' ? 'Multi-currency clearing' : 'Auto-held in on-chain escrow'}
                  </span>
                </div>
              </div>

              {currentProfile.eligibilityNotes && (
                <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                  <span className="font-bold text-zinc-900 dark:text-zinc-200 shrink-0">Eligibility Status:</span>
                  <span>{currentProfile.eligibilityNotes}</span>
                </div>
              )}
            </div>

            {/* Simulated 𝕏 Push Notification UI */}
            {showSimulatedPush && (
              <div className="mt-4 p-3.5 bg-zinc-900 text-white rounded-xl shadow-md border border-zinc-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center font-bold text-xs shrink-0">
                  𝕏
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                    <span className="font-bold text-white uppercase tracking-wider">𝕏 Money • Auto-Deposit Notification</span>
                    <span>Just now</span>
                  </div>
                  <p className="text-zinc-200 mt-1 font-medium">
                    You received <strong className="text-emerald-400">+$458.40 USD</strong> from $GDOGE meme trading fees on Pump.fun! Deposited directly into your 𝕏 Money balance.
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                    Ref ID: XM-89240182-US • Zero claim action was required.
                  </p>
                </div>
              </div>
            )}

            {/* Financial Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-6">
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Total Auto-Deposited via 𝕏 Money
                </span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ${totalReceivedUsd.toFixed(2)} USD
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Transferred automatically (Zero Claim)
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Pending Auto-Disbursal in Treasury
                </span>
                <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                  ${pendingInTreasuryUsd.toFixed(2)} USD
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Auto-dispatches upon next block settlement
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Meme Tokens Dedicated
                </span>
                <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {userTokens.length} Tokens
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  On Pump.fun (Solana)
                </p>
              </div>
            </div>
          </div>

          {/* Tokens Generating Fees for this User */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Tokens Generating Automated Royalties for {cleanHandle} ({userTokens.length})
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Creator fee contracts routing directly to this user's 𝕏 Money account.
                </p>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                Auto-Deposit Enabled
              </span>
            </div>

            {userTokens.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                <Coins className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2 opacity-60" />
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">No active tokens assigned to {cleanHandle} yet.</p>
                <p className="mt-1">Launch a token on Pump.fun designating this handle to start auto-deposits!</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {userTokens.map((token) => (
                  <div key={token.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={token.logoUrl}
                        alt={token.name}
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{token.name}</span>
                          <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">${token.symbol}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 uppercase text-zinc-700 dark:text-zinc-300">
                            {token.platform}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Fee Split: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{token.feeSplitPct}% auto-deposit</span> • Market Cap: ${(token.marketCapUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Treasury Fee Collector:</span>
                      <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 font-semibold">{token.creatorFeeRecipient.slice(0, 6)}...{token.creatorFeeRecipient.slice(-4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Automated Payout History for this User */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  𝕏 Money Direct Auto-Deposit History ({userPayouts.length})
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Verified payments delivered directly to 𝕏 balance with zero claim actions required.
                </p>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                100% Automated
              </span>
            </div>

            {userPayouts.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                <p className="font-medium text-zinc-600 dark:text-zinc-300">No auto-payouts recorded yet for this handle.</p>
                <p className="mt-1 text-zinc-400 dark:text-zinc-500">Trading volume from assigned tokens will immediately generate automated deposits.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {userPayouts.map((payout) => (
                  <div key={payout.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-mono text-emerald-600 dark:text-emerald-400">+${payout.amountUsd.toFixed(2)} USD</span>
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3" />
                          AUTO-DEPOSITED TO 𝕏 MONEY
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium">Zero Claim Needed</span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-mono text-[11px] break-all">
                        Ref: {payout.xMoneyReferenceId} • Token: ${payout.sourceTokenSymbol} ({payout.sourcePlatform}) • Method: {payout.paymentMethod}
                      </p>
                    </div>
                    <div className="text-left sm:text-right text-zinc-400 dark:text-zinc-500 text-[11px]">
                      {new Date(payout.timestamp).toLocaleDateString()} {new Date(payout.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 𝕏 MONEY FEATURE AVAILABILITY DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>𝕏 Users with 𝕏 Money Feature Available</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Browse verified creators and accounts that have activated 𝕏 Money for automated zero-claim royalty payouts.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <button
                  onClick={() => setDirectoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    directoryFilter === 'all'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  All ({KNOWN_X_USERS.length})
                </button>
                <button
                  onClick={() => setDirectoryFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    directoryFilter === 'active'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  ● Active Instant ({KNOWN_X_USERS.filter(u => u.xMoneyStatus === 'active').length})
                </button>
                <button
                  onClick={() => setDirectoryFilter('beta')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    directoryFilter === 'beta'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                  }`}
                >
                  ● Beta Access ({KNOWN_X_USERS.filter(u => u.xMoneyStatus === 'beta').length})
                </button>
                <button
                  onClick={() => setDirectoryFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    directoryFilter === 'pending'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                  }`}
                >
                  ○ Pending / Escrow ({KNOWN_X_USERS.filter(u => u.xMoneyStatus === 'pending_setup').length})
                </button>
              </div>
            </div>

            {/* Search Filter Input */}
            <div className="mt-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  placeholder="Filter creators by name, handle (@elonmusk), or country..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-xs"
                />
              </div>
            </div>

            {/* Grid of Verified Accounts with 𝕏 Money */}
            <div className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredDirectoryUsers.map((user) => (
                <div
                  key={user.handle}
                  className="p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.handle)}`;
                          }}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{user.name}</span>
                            {user.verificationBadge === 'gold' && (
                              <span className="bg-amber-400 text-zinc-950 font-bold rounded-full px-1.5 py-0.2 text-[9px]">
                                ✓ Gold
                              </span>
                            )}
                            {user.verificationBadge === 'blue' && (
                              <span className="bg-blue-500 text-white font-bold rounded-full p-0.5 text-[9px]">
                                ✓
                              </span>
                            )}
                            {user.followersCount && (
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">
                                ({user.followersCount})
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{user.handle}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${user.badgeColor}`}>
                          {user.xMoneyFeatureAvailable ? '● 𝕏 Money Active' : '○ Pending Escrow'}
                        </span>
                        {user.railType && (
                          <span className="text-[9px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                            {user.railType}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">{user.bio}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">Region / MTL</span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate block">{user.licensedJurisdiction || user.countryRegion}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">Payout Speed</span>
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">{user.estimatedAutoDepositTime}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">KYC Status</span>
                        <span className={`font-semibold ${user.kycVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          {user.kycVerified ? '✓ Identity Verified' : '○ Pending Setup'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">Accrued Auto-Paid</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${user.totalAutoDisbursedUsd.toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      {user.xMoneyFeatureAvailable ? 'Auto-Deposit Ready' : 'Escrow Protected'}
                    </span>
                    <button
                      onClick={() => selectUser(user.handle)}
                      className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: REGULATORY & ELIGIBILITY GUIDE */}
      {activeTab === 'regulatory' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-900 mb-2">
                  <span>Official Compliance & Licensing Status</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Who is Enabled on 𝕏 Money?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                  <strong>X Payments LLC</strong> (Subsidiary of X Corp., FinCEN MSB #31000251417532) operates peer-to-peer payments and creator disbursements across the United States in partnership with <strong>Visa Direct</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 sm:px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono block">41</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Approved US States</span>
                </div>
                <div className="px-3 sm:px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-center">
                  <span className="text-xl sm:text-2xl font-bold text-zinc-700 dark:text-zinc-300 font-mono block">9</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Pending States</span>
                </div>
              </div>
            </div>

            {/* 4 Core Eligibility Requirements Grid */}
            <div className="mt-5 sm:mt-6">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
                The 4 Pillars Required for an 𝕏 User to Receive 𝕏 Money
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {X_MONEY_REGULATORY_DATA.eligibilityChecklist.map((item, idx) => (
                  <div key={item.title} className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {item.status}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.title}</h5>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{item.requirement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What happens to Unregistered Users? */}
            <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                🔒
              </div>
              <div>
                <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  What if a creator hasn't linked 𝕏 Money yet? (Zero-Loss Escrow Protection)
                </h5>
                <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-1">
                  When you launch a token for any creator (e.g. Satoshi or new creators), <strong>100% of their creator fees accrue safely in our on-chain Smart Contract Treasury</strong> on Solana or BSC. The funds can never be stolen or revoked. As soon as the creator verifies on 𝕏, the protocol automatically sweeps the accumulated balance directly to their 𝕏 Money account!
                </p>
              </div>
            </div>
          </div>

          {/* Interactive State-by-State Money Transmitter License Directory */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>X Payments LLC State Licensing Map ({X_MONEY_REGULATORY_DATA.approvedStatesCount} / 50 States Approved)</span>
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Inspect state-by-state money transmitter approval. Users with bank accounts in these states can transact instantly.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold self-start sm:self-auto">
                <button
                  onClick={() => setSelectedStateFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedStateFilter === 'all'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  All (50)
                </button>
                <button
                  onClick={() => setSelectedStateFilter('approved')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedStateFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Approved (41)
                </button>
                <button
                  onClick={() => setSelectedStateFilter('pending')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedStateFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Pending (9)
                </button>
              </div>
            </div>

            {/* Approved States Grid */}
            {(selectedStateFilter === 'all' || selectedStateFilter === 'approved') && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Licensed & Approved Jurisdictions ({X_MONEY_REGULATORY_DATA.approvedStates.length} States)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {X_MONEY_REGULATORY_DATA.approvedStates.map((state) => (
                    <div
                      key={state}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-medium flex items-center justify-between"
                    >
                      <span className="truncate">{state}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending States Grid */}
            {(selectedStateFilter === 'all' || selectedStateFilter === 'pending') && (
              <div className="mt-5 sm:mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Pending Regulatory Review & Final Certification ({X_MONEY_REGULATORY_DATA.pendingStates.length} Jurisdictions)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {X_MONEY_REGULATORY_DATA.pendingStates.map((state) => (
                    <div
                      key={state}
                      className="px-3 py-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-medium flex items-center justify-between"
                    >
                      <span>{state}</span>
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 ml-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
